# Save Customer Location (Backend Spec)

## Context

The browser's native geolocation permission prompt now fires once, right
when the site first loads (not when the login/signup card opens). Whatever
the shopper does next decides where that result goes:

- **Signs up** → the result travels inside the existing **`POST /signup`**
  body as two additional fields — an **insert**, since the account (and its
  row in `vstitch_users`) doesn't exist yet.
- **Logs in** (email/password *or* Google — Google never goes through our
  signup form, so it always falls into this path) → the frontend calls a
  new **`POST /users/location`** with the now-known user's token — an
  **update** against their existing `vstitch_users` row.

In both cases, **deny/dismiss/unsupported browser** → no location field is
sent at all (signup) or the update call is skipped entirely (login).
Nothing about signup/login itself is blocked or delayed by this — the
prompt was already resolved by the time either form is submitted.

**Base URL:** `https://vstichbyanjalinandapythonbackend.onrender.com`

---

## 1. `POST /signup` — two additional fields

No change to the endpoint path, auth, or existing fields — just two new
fields alongside the current signup body. **Both are optional** — treat a
request with neither present (e.g. an older client, or a request replayed
outside the browser) the same as a denied prompt, not a validation error:

| Field | Type | Rules |
|---|---|---|
| `location_permission_granted` | boolean, optional | whether the shopper allowed the geolocation prompt; absent should be treated the same as `false` |
| `location` | object, optional | **present only when `location_permission_granted` is `true`** — omitted entirely otherwise, and never sent without the boolean also being `true` |
| `location.latitude` | number | -90 to 90 |
| `location.longitude` | number | -180 to 180 |

**Allowed:**

```json
{
  "vstitch_user_name": "anjali_sharma",
  "password": "a-secure-password",
  "first_name": "Anjali",
  "last_name": "Sharma",
  "email": "anjali@example.com",
  "phone_number": "+919876543210",
  "location_permission_granted": true,
  "location": { "latitude": 28.4595, "longitude": 77.0266 }
}
```

**Denied:**

```json
{
  "vstitch_user_name": "anjali_sharma",
  "password": "a-secure-password",
  "first_name": "Anjali",
  "last_name": "Sharma",
  "email": "anjali@example.com",
  "phone_number": "+919876543210",
  "location_permission_granted": false
}
```

Store `latitude`/`longitude` directly on the new user's `vstitch_users` row
at creation time (see suggested columns below) when present.

---

## 2. `POST /users/location` — update on login

### Headers

```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request body

| Field | Type | Rules |
|---|---|---|
| `latitude` | number | -90 to 90 |
| `longitude` | number | -180 to 180 |

```json
{ "latitude": 28.4595, "longitude": 77.0266 }
```

This **updates** `latitude`/`longitude` on the `vstitch_users` row
belonging to the authenticated user (identified from the token, not a
body field) — not an insert into a separate table.

### Success response — `200`

```json
{ "status": "updated" }
```

### Error responses

| Status | Example `detail` | Cause |
|---|---|---|
| 401 | `"Not authenticated."` | missing/expired/invalid token |
| 422 | validation error array | missing/out-of-range `latitude`/`longitude` |
| 500 | `"Something went wrong. Please try again later."` | unexpected server/database error |

(Standard error shape — see bottom of this doc.)

---

## Suggested schema

Add columns directly to `vstitch_users` rather than a separate table, since
there's only ever one "current location" per user. **All three must be
nullable** — they mirror the request fields above, which are themselves
optional (permission denied, prompt dismissed, unsupported browser, or an
account that predates this feature all mean no value to store):

| Column | Type | Notes |
|---|---|---|
| `location_permission_granted` | boolean, nullable | `NULL` for accounts that existed before this feature, or where neither request field was sent |
| `latitude` | float, nullable | set at signup if granted, else `NULL`; updated on every subsequent login where the shopper has location enabled |
| `longitude` | float, nullable | same as above |

## Nice-to-have (not blocking)

- Reverse-geocode into a city/country server-side if useful elsewhere
  (regional promotions, delivery-time estimates) — the frontend only ever
  sends raw coordinates.

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
      "loc": ["body", "latitude"],
      "msg": "Value error, Enter a valid latitude.",
      "input": "200"
    }
  ]
}
```
