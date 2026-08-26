# LAFA Vape — Nuxt 3 (B2B Wholesale)

## Project overview
LAFA Vape is a solo-run B2B vape export business targeting **small-B clients**: vape shops and
small wholesalers in the **US** and **Middle East** (NOT large distributors). This is the public
website (lafavape.com).

- **Positioning:** US domestic stock (2–4 day delivery) + Dubai global hub, low MOQ + sample
  orders + mixed-SKU, full compliance docs (MSDS / UN38.3 / COA), logistics & payments handled
  for US + Middle East.
- **Stack:** Nuxt 3 (SSR + Build Output API) + Nitro API + Tailwind CSS + Turso (HTTP client)
  + Resend (email), deployed on Vercel.

### ⚠️ Positioning rules (important)
- Target audience is **vape shops + small wholesalers** — write copy for "店主 / 小批发商",
  never "distributors / 分销伙伴".
- **"Gray customs" is an operational reality but must NEVER appear on the public site.** The
  public posture stays: "full compliance docs + import compliance/customs are the importer's
  responsibility." Keep operational/payment/customs details in private WhatsApp chat only.

## Commands
```bash
npm run dev          # dev server -> http://localhost:3000
npm run build        # -> .vercel/output (Build Output API for Vercel)
npm run preview
```

## Pages (auto-routed)
- `index.vue` — hero + wholesale CTA + products + blog + contact form
- `product/[id].vue` — product detail (WhatsApp wholesale CTA only, no retail checkout)
- `wholesale.vue` — value props + compliance docs + WhatsApp CTA + lead form
- `verify.vue` — anti-counterfeit code verification
- `blog/index.vue`, `blog/[id].vue`, `story.vue`
- `faq.vue`, `terms.vue`, `privacy.vue`, `compliance.vue`

## Components
`NavHeader.vue`, `SiteFooter.vue`, `ContactForm.vue`, `ChatWidget.vue`, `ToastNotification.vue`

## Server (Nitro)
- `api/contact.post.ts`, `api/subscribe.post.ts` — contact + newsletter (Resend)
- `api/wholesale.post.ts` — B2B lead capture (Turso)
- `api/verify-code.post.ts` — anti-counterfeit lookup
- `api/like-blog.post.ts` — blog likes
- `api/data/[file].get.ts` — serves products / blog / hero / settings / codes JSON
- `routes/sitemap.xml.get.ts`, `routes/uploads/[...path].get.ts`
- `middleware/security.ts`, `utils/` (db=Turso, fileUtils, imageUtils, mailer=Resend)

## Data (`server/data/`)
`products.json`, `blog.json`, `hero.json`, `settings.json`, `codes.json` (anti-counterfeit),
plus local `*.db` SQLite files (dev/legacy).

## Removed C2C features (do NOT re-add)
Stripe checkout, retail "Buy Now", WeChat ordering, referral/rewards program, and the
`SocialProof` component were all removed for the B2B pivot.

## Security
- `.env` is git-ignored and must never be committed (PASSWORD_HASH, COOKIE_SECRET,
  RESEND_API_KEY, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN).
- `server/data/codes.json` currently holds only TEST placeholder codes and is needed at
  build time (statically imported by `verify-code.post.ts`). Before launch with real
  anti-counterfeit codes, move them into the Turso `codes` table and delete this file —
  do NOT commit real codes to git.
- The full codes list is NOT exposed publicly: `/api/data/codes` was removed from
  `data/[file].get.ts`.

## Placeholders to replace later
- `settings.json` `whatsapp` = `"971500000000"` — replace with the real WhatsApp number.
- Social links in `layouts/default.vue` JSON-LD still point to placeholder accounts.

## Compliance note
Every shipment includes MSDS / UN38.3 / COA. Import compliance & customs clearance are the
responsibility of the local importer (stated on wholesale + footer).
