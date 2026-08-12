# Signup Welcome Email — Backend Spec

## Context

Today, `POST /signup` (called from `AuthCard.jsx`'s `handleSubmit`, via
`signup()` in `src/lib/api.js` → `src/context/AuthContext.jsx`) creates the
account and the frontend shows "Account created! Log in below to continue."
— no email is sent.

The client has asked for a confirmation email after signup, sent to the
address the shopper entered on the form, so they have a written record of
the **username** they chose. This matters here specifically because the app
authenticates by **username, not email** (`POST /login` takes
`vstitch_user_name` + `password` — see `AuthContext.jsx`'s `login`), so a
shopper who signs up, closes the tab, and comes back later has no way to
recover their username from their email address alone today (there's a
"Forgot password" flow, but no "forgot username" flow).

**Note on scope — password is intentionally excluded.** The original ask
included sending the password itself in this email so the shopper "doesn't
forget" it. That's been deliberately left out of this spec: emailing a
plaintext password means it sits indefinitely in an inbox (and often
mail-provider logs) that may not be secured, so anyone who later compromises
that inbox also gets the account password — a well-known anti-pattern
(OWASP flags this explicitly). The existing "Forgot password" flow already
solves "I don't remember my password" safely (email OTP → set a new
password, see `forgot-password-backend-integration.md`), so nothing is lost
by leaving it out here. If the client pushes back on this after seeing the
tradeoff, that's a product call to revisit deliberately — not something to
silently add back in.

## Suggested approach

This isn't a new frontend-triggered endpoint — it's a side effect the
backend adds **inside the existing `POST /signup` handler**, fired once the
new user row is successfully created. No new request from the frontend, and
no frontend code changes are needed (see "Frontend integration notes"
below).

**Fields already available at that point** (from the existing `/signup`
request body — see `AuthCard.jsx` lines 258–267):

| Field | Used for |
|---|---|
| `email` | the `To:` address |
| `first_name` | personalizing the greeting |
| `vstitch_user_name` | the username being confirmed |

`password` is available in that same request but should **not** be read for
this feature — see the note above.

## Email content

- **To:** `{email}` (from the signup payload)
- **From:** the studio's sending address (reuse whatever `/customization-interest`
  and other transactional emails already send from, or a dedicated
  `no-reply@` address if one exists)
- **Subject:** `Welcome to VStitch by Anjali Nanda — Your Account is Confirmed`
- **Body:**

  ```
  Dear {first_name},

  Thank you for creating an account with VStitch by Anjali Nanda. Your
  registration is now confirmed, and you're all set to explore our
  collections, save your favourite pieces, and place orders.

  For your records, here are your account details:

    Username: {vstitch_user_name}
    Email:    {email}

  Please keep your username handy — you'll need it, along with your
  password, each time you sign in. For your security, we never include
  your password in email. If you ever forget it, simply select "Forgot
  password?" on the sign-in screen to reset it using this email address.

  If you didn't create this account, please contact us at
  vstitchbyanjalinanda@gmail.com so we can look into it.

  Warm regards,
  Team VStitch by Anjali Nanda
  ```

## Failure handling

This should be **best-effort / fire-and-forget** — a failed email send must
never fail the signup itself or surface an error to the frontend, since the
frontend's success flow (`AuthCard.jsx`) already completes the moment
`POST /signup` returns `2xx` and doesn't wait on anything else. Log send
failures server-side (e.g. "welcome email failed to send for user #123")
the same way other non-blocking notification failures are already logged,
so they're visible to the team without being visible to the shopper.

## Rate limiting / abuse

None needed beyond whatever `/signup` itself already has — this only fires
once per successful account creation, not on a repeatable public endpoint.

## Frontend integration notes

No frontend changes are required. `AuthCard.jsx` already calls
`POST /signup` and treats a successful response as "account created" —
this email is purely additive backend behavior on the existing call. If a
follow-up ever wants a "verify your email" step (a link the shopper must
click before their account is active), that's a materially different,
larger feature — a separate spec — and out of scope here; this is a
plain welcome/confirmation email, not email verification.
