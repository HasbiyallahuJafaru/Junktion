# JUNKTION — Admin Dashboard

## Overview

The admin dashboard lives at `/app/admin/` in the same Next.js project.
It shares the design language (Syne + DM Sans, dark palette) but uses a
**functional, data-dense layout** — not the organic animated style of the public site.

No cards. Data sits directly on dark surfaces. Orange accents only.

---

## Color Scheme (Admin)

```
Background:     #0A0A0A
Sidebar:        #111111
Surface:        #141414     ← table rows, form areas
Border:         #1E1E1E
Text primary:   #F5F0EB
Text muted:     #6B6760
Orange accent:  #F15A22
Success:        #22C55E
Warning:        #F59E0B
Danger:         #EF4444
```

---

## Layout — `/app/admin/layout.tsx`

```
┌────────────────────────────────────────────────────┐
│ Sidebar (240px fixed)  │  Main content (flex-1)    │
│                        │                            │
│  JUNKTION              │  [page content]            │
│  admin                 │                            │
│                        │                            │
│  ○ Orders          ← all roles                     │
│  ○ Menu            ← owner only (greyed for cashier)│
│  ○ Accounts        ← owner only                    │
│  ○ Analytics       ← owner only                    │
│  ○ Staff           ← owner only                    │
│                        │                            │
│  ─────────────────     │                            │
│  [name] [role badge]   │                            │
│  Sign Out              │                            │
└────────────────────────────────────────────────────┘
```

**Role badge**: `OWNER` in orange / `CASHIER` in muted
**Owner-only links**: still visible to cashiers but clicking redirects to `/admin/orders` with a toast: "Owner access required"
**Mobile**: sidebar collapses to bottom tab bar (Orders · Menu · Settings)

---

## `/admin/login` Page

```
Full screen, #0A0A0A background
Center: JUNKTION wordmark (Syne 800, large, orange)
Below: "Admin Portal" (DM Sans 400, muted, small)

Form (no box — fields on surface):
  Email: [underline input]
  Password: [underline input] [show/hide toggle]
  [Sign In button — full width, orange, Syne 700]

Error state:
  Red message below button
  Button shakes: @keyframes shake 300ms

On success: redirect to /admin/orders
```

---

## `/admin/orders` Page

### Summary Strip (top, always visible)
Fetches `GET /api/admin/orders/summary` every 60s.
```
Today's Orders: 24    Revenue: ₦187,500    Pending: 6
```
Numbers in Syne 800 orange. Labels in DM Sans 400 muted.
Auto-refresh indicator: small dot pulses when refreshing.

### Filter Tabs
```
All  ·  Pending  ·  Confirmed  ·  Preparing  ·  Ready  ·  Delivered  ·  Cancelled
```
Active tab underlined in orange. Count badge on Pending tab.

### Order Table
```
Ref          Items              Total     Address          Status      Time      Action
JNK-A3F9KL  Shawarma ×2, +1   ₦11,300  15 Indep. Way    PENDING     14:22     [Update ▼]
```

- **Ref**: Syne 600, monospace feel, orange
- **Items**: first 2 items shown, "+N more" if overflow
- **Total**: Naira (converted from kobo)
- **Address**: truncated at 30 chars, full on hover
- **Status badge**: colored text, no background box
  - `PENDING` — amber
  - `CONFIRMED` — blue `#60A5FA`
  - `PREPARING` — orange
  - `READY` — green
  - `DELIVERED` — muted
  - `CANCELLED` — red, strikethrough
- **Time**: relative (e.g. "14 mins ago") — absolute on hover
- **Action**: dropdown with valid next statuses only (per VALID_TRANSITIONS)

### New Order Indicator
Poll `GET /api/admin/orders?status=pending&since=[lastCheck]` every 30s.
If new orders: orange dot appears on Orders nav link + browser tab title prefixed with `(N) `.
No push notifications needed — polling is sufficient.

---

## `/admin/menu` Page

### Item List
```
[image circle 48px]  Name             Category   Price    Available  Featured  Actions
                     Reg Chicken...   Shawarma   ₦3,900   [toggle]   [toggle]  Edit  Delete
```

- Image circle: 48px, Cloudinary URL
- Available toggle: orange when on, muted when off
  - Toggling off immediately hides item from public menu
- Featured toggle: orange star when on (shows in carousel)
- Edit → `/admin/menu/[id]/edit`
- Delete → inline confirm ("Delete [name]? This cannot be undone.") — no modal
- Drag handle on left for reordering (updates displayOrder)
- "Add Item" button top right → `/admin/menu/new`

### Add / Edit Form (`/admin/menu/new` and `/admin/menu/[id]/edit`)

Fields:
```
Name:         [text input]
Description:  [textarea, max 300 chars, live counter]
Price:        ₦ [number input] — stored as kobo internally
Category:     [select: Shawarma / Sandwich / Pasta / Rice / Sides / Drinks]
Available:    [toggle]
Featured:     [toggle] — appears in carousel
Display Order:[number] — lower = earlier
```

Image upload section:
```
[Current image circle — 120px]
[Upload New Image button]
  → Opens file picker
  → Preview shown immediately
  → On form submit: signs + uploads to Cloudinary
  → Stores secure_url + public_id
```

Submit button: "Save Item" — orange, Syne 700.
Cancel link: returns to `/admin/menu`.

---

## `/admin/accounts` Page

### Account List
```
Account Name       Bank         Number          Primary    Active   Actions
Junktion LTD       Moniepoint   5119991680      ★ PRIMARY  [on]     Edit  Delete
[Add Account form below]
```

- Primary badge: orange star + "PRIMARY" text
- Set Primary: button on each non-primary account
  - Inline confirm: "Set [Bank] as primary? Current primary will be replaced."
  - Updates atomically in DB (transaction: set all false → set target true)
- Delete: disabled on primary account (tooltip: "Cannot delete primary account")
- Active toggle: inactive accounts won't appear in API
- "Add Account" expands inline form below the list:
  ```
  Account Name: [input]
  Account Number: [input]
  Bank Name: [input]
  [Add Account button]
  ```

---

## `/admin/analytics` Page (Owner Only)

### Layout (organic asymmetry — not card grid)

Range selector tabs top-right: `7 Days · 30 Days · 90 Days`

**Summary row** (3 stats, unequal widths, 50% · 28% · 22%):
```
₦1,240,500        187 Orders        ₦6,634 avg
Total Revenue     Total Orders      Avg Order Value
```
Numbers: Syne 800, orange. Labels: DM Sans 400, muted.

**Revenue Chart** (60% width, left-anchored):
- Line chart using `recharts`
- Dark theme: background `#0A0A0A`, grid lines `#1E1E1E`, line color `#F15A22`
- X-axis: date labels (DM Sans 400, muted)
- Y-axis: ₦ formatted values
- Tooltip: dark background, shows date + revenue + order count
- No legend (single line)

```typescript
// Recharts setup
<ResponsiveContainer width="100%" height={280}>
  <LineChart data={dailyRevenue}>
    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
    <XAxis dataKey="date" stroke="#6B6760" tick={{ fontFamily: 'DM Sans', fontSize: 12 }} />
    <YAxis stroke="#6B6760" tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
    <Tooltip
      contentStyle={{ background: '#141414', border: '1px solid #1E1E1E', borderRadius: 4 }}
      formatter={(v: number) => [`₦${v.toLocaleString('en-NG')}`, 'Revenue']}
    />
    <Line type="monotone" dataKey="revenue" stroke="#F15A22" strokeWidth={2} dot={false} />
  </LineChart>
</ResponsiveContainer>
```

**Top Items** (right of chart, 38% width):
```
#   Item                  Qty    Revenue
1   Reg Chicken Shawarma  142    ₦553,800
2   Loaded Fries          98     ₦588,000
...
```
Rank number in Syne 700 orange. Rest in DM Sans 400.
No table borders — just row spacing.

---

## `/admin/users` Page (Owner Only)

### Staff List
```
Name            Email                Role      Status    Actions
Junktion Admin  admin@junktion.ng    OWNER     Active    (no actions on self)
Amina Bello     amina@junktion.ng    CASHIER   Active    Deactivate
```

- Owner row: no action buttons (cannot deactivate self or change own role)
- Deactivate: inline confirm — "Deactivate [name]? They won't be able to log in."
- Reactivate: for deactivated accounts
- Status: green dot + "Active" / red dot + "Inactive"

### Add Staff Form (below list, inline expand)
```
Full Name:  [input]
Email:      [input]
Password:   [input] + [generate random button]
Role:       Cashier (fixed — no owner creation via UI)
[Create Staff Account button]
```

Generated password shown once with copy button. Instruct owner to share securely.

---

## Admin Shared Components

### `<AdminTable />` pattern
Not a component library — just a consistent pattern:
- `width: 100%`, no border on table itself
- `border-bottom: 1px solid #1E1E1E` on each row
- Row hover: `background: #141414`
- First column: DM Sans 600 (identifier/name)
- Other columns: DM Sans 400

### `<AdminToggle />` — availability / active toggles
```tsx
// Orange when on, #333 when off
// Width: 40px, height: 22px
// Pill shape, circle slides left/right
// Instant optimistic update — revert on API error
```

### `<StatusBadge />` — order status display
```tsx
// Text only, no background box
// Color per status (see orders page spec above)
// Syne 600, uppercase, small tracking
```

### Loading skeleton pattern
```tsx
// No spinners — use skeleton shimmer
// bg-[#1E1E1E] with shimmer animation
// Match exact layout of real content (same widths/heights)
```
