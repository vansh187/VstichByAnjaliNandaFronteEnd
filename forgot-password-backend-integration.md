# Forgot Password (Email OTP) — Backend Integration Spec

## Context

The login card (`src/components/AuthCard.jsx`) now has a "Forgot password?"
link that opens a two-step flow, entirely inside the existing login/signup
modal (no separate page, no emailed link to click through):

1. Shopper enters the email on their account → frontend calls
   **`POST /password-reset/request`** → backend emails a 6-digit code.
2. Shopper enters that code + a new password on the same screen →
   frontend calls **`POST /password-reset/confirm`** → password is updated.

Neither endpoint exists yet. The frontend is built against the contract
below and is currently pointed at a stubbed/mocked response for local
testing — please implement to this shape so no frontend changes are needed
once it's live. Endpoint paths, field names, and status codes below are a
proposal, not a hard requirement — if something needs to change to match
existing conventions elsewhere in the API, that's fine, just flag it back
so the frontend can be updated to match.

**Base URL:** `https://vstichbyanjalinandapythonbackend.onrender.com`

| Method | Path | Auth |
|---|---|---|
| POST | `/password-reset/request` | None — reachable by any visitor |
| POST | `/password-reset/confirm` | None — the OTP itself is the credential |

---

## 1. `POST /password-reset/request` — send the code

### Headers

```
Content-Type: application/json
```

### Request body

| Field | Type | Rules |
|---|---|---|
| `email` | string | valid email format |

```json
{ "email": "customer@example.com" }
```

### Success response — `200`

```json
{ "status": "sent" }
```

**Important — always return `200` here, whether or not an account exists
for that email.** This prevents the endpoint being used to enumerate
registered emails. If the email isn't registered, do nothing silently
(don't send an email, don't error) rather than returning a different
status/body — the frontend shows the same "we've sent a code" message
either way and has no way to distinguish the two cases, by design.

### OTP behavior (suggested, adjust as needed)

- 6 digits, numeric.
- Expires after **10 minutes**.
- Generating a new code invalidates the previous one (so "Resend" in the UI
  is just calling this endpoint again with the same email).
- Rate-limited to **5 requests/minute per IP** (matches `/subscribe`), plus
  ideally a per-email cooldown (e.g. don't allow a resend within 30-60s) to
  discourage spamming a single inbox.

### Error responses

| Status | Example `detail` | Cause |
|---|---|---|
| 422 | validation error array | missing/blank `email`, or not a valid email format |
| 429 | `"Too many requests - please try again shortly."` | rate limit exceeded |
| 500 | `"Something went wrong. Please try again later."` | unexpected server/database/email-provider error |

(Standard error shape — see bottom of this doc.)

---

## 2. `POST /password-reset/confirm` — verify the code and set the new password

### Headers

```
Content-Type: application/json
```

### Request body

| Field | Type | Rules |
|---|---|---|
| `email` | string | same email the code was requested for |
| `otp` | string | the 6-digit code |
| `new_password` | string | min 8 chars (same rule as `/signup`) |

```json
{
  "email": "customer@example.com",
  "otp": "482913",
  "new_password": "a-new-secure-password"
}
```

### Success response — `200`

```json
{ "status": "success" }
```

The frontend does **not** expect an `access_token` here — after a
successful reset it sends the shopper back to the Log In tab to sign in
normally with the new password, rather than auto-logging them in. (Happy
to change this if you'd rather return a session directly — just let us
know which shape to expect.)

### Error responses

| Status | Example `detail` | Cause |
|---|---|---|
| 400 | `"Invalid or expired code."` | wrong OTP, or OTP expired/already used |
| 422 | validation error array | missing fields, malformed email, `new_password` too short |
| 429 | `"Too many attempts - please request a new code."` | too many failed OTP attempts for this email (brute-force protection — please rate-limit attempts more aggressively than the request endpoint, since a 6-digit code is guessable in bulk without this) |
| 500 | `"Something went wrong. Please try again later."` | unexpected server/database error |

The frontend shows the `400`/`429` message inline near the code field, and
routes any `422` field errors under their respective inputs (`email`,
`otp`, `new_password`) the same way every other form in the app already
does.

---

## Standard error shape

```json
{ "detail": "Human-readable message, safe to show or adapt for the user" }
```

**422** is the one exception — `detail` is an array of field-level
validation errors (Pydantic's default shape), same as every other endpoint:

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "Value error, Enter a valid email address.",
      "input": "not-an-email"
    }
  ]
}
```

## Suggested schema

If it's cleanest to store OTPs in their own table rather than reusing
something existing:

`password_reset_otps` table:

| Column | Type | Notes |
|---|---|---|
| `vstitch_password_reset_otp_id` | PK | |
| `vstitch_user_id` | FK → users | resolved from `email` at request time |
| `otp_hash` | string | store a hash, not the raw code |
| `expires_at` | timestamp | now + 10 minutes |
| `consumed_at` | timestamp, nullable | set once successfully used, so it can't be replayed |
| `attempt_count` | int, default 0 | increment on each failed `/confirm` call, for the 429 above |
| `created_at` | timestamp | |

## Nice-to-have (not blocking)

- Invalidate/expire any outstanding OTP for a user the moment their
  password is successfully changed by *any* means (including this flow
  itself completing), so a stale code can't be reused.
- Log successful password resets the same way other security-relevant
  events are logged, if that's already a pattern elsewhere in the API.
