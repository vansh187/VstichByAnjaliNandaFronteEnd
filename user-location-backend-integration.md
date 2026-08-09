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

**We send a ready-to-open Google Maps link, not raw latitude/longitude** —
built client-side as `https://www.google.com/maps?q=<lat>,<lng>` — so
whatever gets stored is something a human (e.g. support staff looking at an
order) can click straight into a map, rather than two floats they'd need to
paste into a maps tool themselves.

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
| `google_maps_link` | string, optional | **present only when `location_permission_granted` is `true`** — omitted entirely otherwise, and never sent without the boolean also being `true`. A full URL, e.g. `https://www.google.com/maps?q=28.4595,77.0266` |

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
  "google_maps_link": "https://www.google.com/maps?q=28.4595,77.0266"
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

Store `google_maps_link` directly on the new user's `vstitch_users` row at
creation time (see suggested column below) when present.

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
| `google_maps_link` | string | a full URL, e.g. `https://www.google.com/maps?q=28.4595,77.0266` |

```json
{ "google_maps_link": "https://www.google.com/maps?q=28.4595,77.0266" }
```

This **updates** `google_maps_link` on the `vstitch_users` row belonging to
the authenticated user (identified from the token, not a body field) — not
an insert into a separate table.

### Success response — `200`

```json
{ "status": "updated" }
```

### Error responses

| Status | Example `detail` | Cause |
|---|---|---|
| 401 | `"Not authenticated."` | missing/expired/invalid token |
| 422 | validation error array | missing/malformed `google_maps_link` |
| 500 | `"Something went wrong. Please try again later."` | unexpected server/database error |

(Standard error shape — see bottom of this doc.)

---

## Suggested schema

Add columns directly to `vstitch_users` rather than a separate table, since
there's only ever one "current location" per user. **Both must be
nullable** — they mirror the request fields above, which are themselves
optional (permission denied, prompt dismissed, unsupported browser, or an
account that predates this feature all mean no value to store):

| Column | Type | Notes |
|---|---|---|
| `location_permission_granted` | boolean, nullable | `NULL` for accounts that existed before this feature, or where neither request field was sent |
| `google_maps_link` | string/text, nullable | set at signup if granted, else `NULL`; updated on every subsequent login where the shopper has location enabled |

---

## Database patch

```sql
ALTER TABLE vstitch_users
  ADD COLUMN location_permission_granted BOOLEAN NULL,
  ADD COLUMN google_maps_link TEXT NULL;
```

Both columns are nullable and have no default — existing rows simply stay
`NULL` until that user next signs up (not applicable, they already exist)
or logs in and grants location.

If migrations run through Alembic, the equivalent revision:

```python
"""add location columns to vstitch_users

Revision ID: xxxxxxxxxxxx
Revises: <previous_revision_id>
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column("vstitch_users", sa.Column("location_permission_granted", sa.Boolean(), nullable=True))
    op.add_column("vstitch_users", sa.Column("google_maps_link", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("vstitch_users", "google_maps_link")
    op.drop_column("vstitch_users", "location_permission_granted")
```

---

## Suggested implementation (FastAPI + Pydantic + SQLAlchemy)

Reference only — adapt names/imports/module paths to match your actual
codebase structure; this isn't verified against your real code, just
written to match the conventions already visible in this repo's other
`*-backend-integration.md` docs (Pydantic error shape, `vstitch_`-prefixed
identifiers).

**Model** — add the two columns next to the rest of `vstitch_users`:

```python
class VstitchUser(Base):
    __tablename__ = "vstitch_users"
    # ...existing columns...
    location_permission_granted: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    google_maps_link: Mapped[str | None] = mapped_column(Text, nullable=True)
```

**Signup schema** — extend the existing request model with the two new
optional fields (default `None`/`False` so older/other clients that don't
send them still validate):

```python
class SignupRequest(BaseModel):
    # ...existing fields...
    location_permission_granted: bool = False
    google_maps_link: str | None = None

    @field_validator("google_maps_link")
    @classmethod
    def validate_maps_link(cls, v, info):
        if v is None:
            return v
        if not info.data.get("location_permission_granted"):
            raise ValueError("google_maps_link should only be sent when location_permission_granted is true.")
        if not v.startswith("https://www.google.com/maps"):
            raise ValueError("Enter a valid Google Maps URL.")
        return v
```

In the `/signup` handler, when creating the row, pass the two fields
straight through: `location_permission_granted=payload.location_permission_granted, google_maps_link=payload.google_maps_link`.

**New endpoint** — `POST /users/location`:

```python
class UpdateLocationRequest(BaseModel):
    google_maps_link: str

    @field_validator("google_maps_link")
    @classmethod
    def validate_maps_link(cls, v):
        if not v.startswith("https://www.google.com/maps"):
            raise ValueError("Enter a valid Google Maps URL.")
        return v


class UpdateLocationResponse(BaseModel):
    status: str


@router.post("/users/location", response_model=UpdateLocationResponse)
def update_user_location(
    payload: UpdateLocationRequest,
    current_user: VstitchUser = Depends(get_current_user),  # however auth is resolved elsewhere in this codebase
    db: Session = Depends(get_db),
):
    current_user.google_maps_link = payload.google_maps_link
    current_user.location_permission_granted = True
    db.commit()
    return UpdateLocationResponse(status="updated")
```

`get_current_user`/`get_db` should be whatever dependency this codebase
already uses for other authenticated endpoints (e.g. `/orders`) — reuse
those, don't reintroduce new auth plumbing for this one route.

## Nice-to-have (not blocking)

- If it's ever useful to query or aggregate by location (e.g. regional
  promotions), consider also parsing/storing latitude and longitude
  separately from the link at write time — the frontend only ever sends
  the link itself, not raw coordinates.

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
      "loc": ["body", "google_maps_link"],
      "msg": "Value error, Enter a valid URL.",
      "input": "not-a-url"
    }
  ]
}
```
