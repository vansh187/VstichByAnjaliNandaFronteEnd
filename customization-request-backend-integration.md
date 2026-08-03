# Customization / Bespoke Fit Request — Backend Integration Spec

## Context

Every product page now has a "Request bespoke measurements" form (see
`src/components/CustomizationModal.jsx`) where a shopper enters their body
measurements and asks for a custom-fit version of a specific product +
variant (size/color) they were viewing.

**Today**, since no backend endpoint exists yet, submitting the form just
opens a pre-filled WhatsApp message to the studio's number — nothing is
persisted anywhere. This doc specifies the endpoint needed so these
requests get saved to the database instead, tied to the exact product and
variant the shopper was looking at.

Once this endpoint exists, the frontend will swap the WhatsApp-only submit
for a real API call (keeping WhatsApp as a secondary "message us" link, not
the only channel).

## Fields collected by the form today

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | string | yes | |
| Phone Number | string | yes | not validated as a specific format client-side |
| Bust | number (inches) | yes | |
| Waist | number (inches) | yes | |
| Hips | number (inches) | yes | |
| Shoulder | number (inches) | yes | |
| Sleeve Length | number (inches) | yes | |
| Dress Length | number (inches) | yes | |
| Additional Notes | string | no | free text, max 500 chars client-side |

Also known at submit time but not currently sent anywhere (needs the new
endpoint to carry them):

- **Product ID** (`vstitch_product_id`) — the product being viewed
- **Variant ID** (`vstitch_product_variant_id`) — the exact size/color
  variant selected on the page at the time of the request
- **User ID**, if the shopper is logged in (their auth token would be sent
  the same way `/orders` etc. already receive it) — the form is usable
  while logged out too, since browsing a product page doesn't require login

## Suggested schema

`customization_requests` table:

| Column | Type | Notes |
|---|---|---|
| `vstitch_customization_request_id` | PK | |
| `vstitch_product_id` | FK → products | required |
| `vstitch_product_variant_id` | FK → product_variants | required |
| `vstitch_user_id` | FK → users, nullable | populated from bearer token when present |
| `customer_name` | string | |
| `customer_phone` | string | |
| `bust_in` | decimal | |
| `waist_in` | decimal | |
| `hips_in` | decimal | |
| `shoulder_in` | decimal | |
| `sleeve_length_in` | decimal | |
| `dress_length_in` | decimal | |
| `notes` | text, nullable | |
| `status` | enum: `pending`, `in_review`, `confirmed`, `completed`, `cancelled` | default `pending` |
| `created_at` / `updated_at` | timestamps | |

## Endpoint

```
POST /products/{product_id}/variants/{variant_id}/customization-requests
```

(or, if flatter routes are preferred to match the rest of the API,
`POST /customization-requests` with `product_id` / `variant_id` in the body
— whichever matches existing conventions, e.g. how `/orders` is structured.)

**Auth:** Bearer token optional. If a valid token is sent, attach the
resolved user id to the record; if omitted, save the request anonymously
(`vstitch_user_id = null`). Don't reject the request just for having no
token — the form is reachable while logged out.

**Request body:**

```json
{
  "customer_name": "Anjali Sharma",
  "customer_phone": "+91 98765 43210",
  "bust_in": 36,
  "waist_in": 30,
  "hips_in": 39,
  "shoulder_in": 14.5,
  "sleeve_length_in": 22,
  "dress_length_in": 42,
  "notes": "Slightly looser through the waist, please."
}
```

**Success response (`201`):**

```json
{
  "vstitch_customization_request_id": 101,
  "vstitch_product_id": 42,
  "vstitch_product_variant_id": 317,
  "status": "pending",
  "created_at": "2026-08-03T10:15:00Z"
}
```

**Error handling** — please follow the same conventions already used
elsewhere in the API so the existing frontend error-handling code (which
expects this shape) works without changes:

- `422` with per-field messages for validation failures (missing required
  measurement, invalid phone format, etc.)
- `404` if `product_id` or `variant_id` doesn't exist, or the variant
  doesn't belong to that product
- No `401` unless a token *is* provided and is invalid/expired — a request
  with no token at all should succeed anonymously, as above

## Nice-to-have (not blocking)

`GET /customization-requests` (auth required) — returns the logged-in
user's own submitted requests, for a possible future "My Customization
Requests" section under My Orders. Not needed for the initial version.
