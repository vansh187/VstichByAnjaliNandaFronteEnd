# Customization Interest — Admin Notification Email (Backend Spec)

## Context

The new "VStitch AI" widget (`src/components/VstitchAiWidget.jsx`, bottom-right
on every page) has a "Need a Custom Outfit?" option. A visitor enters their
**name, phone, and email**, and the request should notify the studio admin
by email so they can follow up.

**Today**, since no backend endpoint exists for this yet, submitting the
form opens a `mailto:` link pre-addressed to `vstitchbyanjalinanda@gmail.com`
with the subject and body already filled in, and the visitor's own mail app
takes over from there.

**This is a real limitation, not just a placeholder**: a `mailto:` link can
only pre-fill `to`, `subject`, and `body` — there is no way for a link to
set genuine email-transport headers like `Importance: High` or
`X-Priority: 1`. Those can only be set by whatever actually sends the SMTP
message. It also depends on the visitor having a configured mail app, which
many people (especially on mobile) don't. **A real "high importance" flag,
and guaranteed delivery regardless of the visitor's device, requires this to
be sent server-side.**

## Suggested endpoint

```
POST /customization-interest
```

**Auth:** none required — this is a pre-purchase contact form, reachable by
anyone browsing the site, logged in or not.

**Request body:**

```json
{
  "name": "Anjali Sharma",
  "phone": "+91 98765 43210",
  "email": "anjali@example.com"
}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | 1–250 chars, can't be blank |
| `phone` | string | 7–50 chars, can't be blank |
| `email` | string | valid email format |

**What the backend should do:** send an email to the studio admin inbox
(`vstitchbyanjalinanda@gmail.com` — same address already used in the site
footer) with:

- **Subject:** `Customization Required By {name}`
- **Body:**

  ```
  A customer has requested a custom outfit through the VStitch website.

  Name: {name}
  Email: {email}
  Phone: {phone}

  Please reach out to them as soon as possible to discuss their requirements.

  — Sent from the VStitch website
  ```

- **Headers marking it high priority**, e.g. (exact set depends on the
  mail-sending library):
  - `Importance: high`
  - `X-Priority: 1`
  - `X-MSMail-Priority: High`

**Success response (`201` or `200`):**

```json
{ "status": "sent" }
```

(No id needed unless you'd also like to persist these submissions to a
table for a future admin dashboard — not required for the initial version,
but trivial to add alongside the email send if useful.)

**Error handling** — please follow the same conventions as the rest of the
API:

- `422` with per-field messages for validation failures
- `500` if the email fails to send (e.g. SMTP provider down) — a safe
  generic message the frontend can show as "couldn't send right now, please
  try WhatsApp instead"
- `429` if you'd like to rate-limit this the same way
  `/customization-requests` is (5/min per IP) — recommended, since this is
  another public, unauthenticated write endpoint

## Frontend integration notes

Once this exists, `VstitchAiWidget.jsx`'s form submit will switch from
building a `mailto:` link to a real `POST /customization-interest` call
(same pattern as `CustomizationModal.jsx`'s `submitCustomizationRequest`),
with the `mailto:` link kept only as a documented fallback message shown if
the request fails outright (e.g. "Couldn't reach us — please WhatsApp
instead" linking to the consultation number).
