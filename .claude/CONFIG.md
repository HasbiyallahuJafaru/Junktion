# JUNKTION — Configuration

## Non-Secret Site Config — `/app/data/config.ts`

```typescript
/** Non-secret site config. Safe to commit. */
export const SITE_CONFIG = {
  name:        'Junktion',
  tagline:     'Eat. Different.',
  description: "Kaduna's premium street food spot. Shawarma, grills, wraps, and more.",

  phone: {
    primary:   '07048785688',
    secondary: '08088883561',
    whatsapp:  '2347048785688',   // international format, no +
  },

  address: {
    street:  'C10 Surame Road U/Rimi',
    area:    'GRA',
    city:    'Kaduna State',
    full:    'C10 Surame Road U/Rimi, GRA, Kaduna State',
    lat:      10.5105,
    lng:      7.4165,
  },

  instagram: {
    handle: '@junktionkd',
    url:    'https://instagram.com/junktionkd',
  },

  hours: 'Open daily · 10am – 10pm',   // confirm before launch

  seo: {
    title:       'Junktion — Eat. Different.',
    description: "Kaduna's street food spot. Order shawarma, grills, wraps, pasta, and wings.",
    ogImage:     '/og-image.jpg',
  },
} as const

/** WhatsApp deep link */
export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${SITE_CONFIG.phone.whatsapp}?text=${encodeURIComponent(message)}`
}

/** WhatsApp order message */
export function buildOrderMessage(params: {
  reference: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  deliveryAddress: string
}): string {
  const lines = params.items
    .map((i) => `\u2022 ${i.name} \u00d7 ${i.quantity} \u2014 \u20a6${(i.price / 100).toLocaleString('en-NG')}`)
    .join('\n')

  return `Hi Junktion! \ud83e\uddfe

*Order Summary:*
${lines}

*Total:* \u20a6${(params.total / 100).toLocaleString('en-NG')}
*Delivery to:* ${params.deliveryAddress}
*Order Ref:* ${params.reference}

*Payment:* Transferred to Moniepoint \u2705

Please confirm my order. Thank you!`
}
```

---

## Environment Variables — `.env.local`

Create this file at project root. Never commit to git.
Add all these to Netlify Environment Variables before deploying.

```bash
# ── Database (Neon) ─────────────────────────────────
DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require

# ── Auth (RS256 keypair — run scripts/gen-keys.js) ──
# Both values are base64-encoded PEM strings
JWT_PRIVATE_KEY=LS0tLS1CRUdJTi...
JWT_PUBLIC_KEY=LS0tLS1CRUdJTi...

# ── Cloudinary ───────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret_here

# Safe to expose — used in browser upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## Netlify Config — `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

# Required for Next.js on Netlify
[[plugins]]
  package = "@netlify/plugin-nextjs"

# Increase function timeout (default 10s → 26s on Pro)
[functions]
  included_files = ["./drizzle/**"]

# Headers for security
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Admin routes: no cache (always fresh)
[[headers]]
  for = "/admin/*"
  [headers.values]
    Cache-Control = "no-store"

# API routes: no cache
[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-store"
```

---

## Netlify Deployment Steps

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Initialize project (first time)
netlify init
# Choose: Create & configure a new site
# Build command: npm run build
# Publish directory: .next

# 4. Add environment variables
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set JWT_PRIVATE_KEY "LS0tLS1..."
netlify env:set JWT_PUBLIC_KEY "LS0tLS1..."
netlify env:set CLOUDINARY_CLOUD_NAME "your_cloud"
netlify env:set CLOUDINARY_API_KEY "123..."
netlify env:set CLOUDINARY_API_SECRET "abc..."
netlify env:set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME "your_cloud"

# 5. Deploy
netlify deploy --prod

# Future deployments
netlify deploy --prod    # or push to main branch if git integration enabled
```

---

## Neon Database Setup

```
1. Go to neon.tech → Create project → "junktion"
2. Copy connection string → DATABASE_URL
3. Run: npx drizzle-kit push:pg
4. Run: node scripts/seed.js
```

---

## Cloudinary Setup

```
1. Sign up at cloudinary.com (free tier: 25GB storage, 25GB bandwidth/month)
2. Dashboard → Settings → API Keys → Copy cloud name, API key, API secret
3. Create folder: Media Library → New Folder → "junktion" → "menu"
4. Recommended upload preset (optional):
   Settings → Upload → Add upload preset
   Name: junktion_menu
   Signing mode: Signed
   Folder: junktion/menu
```

---

## `.gitignore` additions

```
.env.local
.env*.local
/drizzle/*.sql   # generated migrations (optional — commit if you want migration history)
scripts/gen-keys.js  # optional — delete after generating keys
```
