# Studio Feature Roadmap (Before → After, Why It’s Better, How To Ship)

This roadmap details enhancements we can add to the Studio without breaking existing flows on mobile or desktop. For each area, you’ll find: current state (Before), proposed improvement (After), the benefits, and a high-level implementation plan.

---

## Guiding Principles
- Keep current “Generate now” UX intact; add features as optional, progressive enhancements.
- Mobile-first: larger touch targets, sticky CTAs, swipe-friendly interactions.
- Safe rollouts: behind flags; incremental shipping; no regressions.
- Use Supabase for durable state (images, metadata), Vercel for edge/serverless API.

---

## 1) Try‑On Mode (Virtual Try‑On)
- **Before**
  - Optional “Use my photo” toggle; sends person + product to model; hides gender/age/ethnicity when enabled.
  - Try‑on prompt improved to preserve identity and overlay garment.
- **After**
  - Stronger identity preservation and alignment with pose/occlusion hints.
  - Optional garment masking and person face/upper‑body focus for cleaner composites.
  - Saved default person photo per user.
- **Why it’s better**
  - Higher realism, less artifacting, faster repeat usage (no re‑upload).
- **How to ship**
  - Prompt tuning: add explicit constraints (face/pose/perspective). Gate by a feature flag.
  - Garment mask: lightweight canvas brush; send binary mask as additional conditioning.
  - Default person photo: add `user_profile` in Supabase; store `person_photo_path` and allow quick reuse.

---

## 2) Generation Controls (Quality, Consistency, Speed)
- **Before**
  - Category presets; fixed size; background presets; single “Generate Photos”.
- **After**
  - Aspect ratio presets (1:1, 4:5, 3:4, 16:9) with crop preview.
  - Style presets (Studio, Editorial, Catalog) and “seed lock” for consistent looks.
  - Background control: keep/blur/replace (studio white/gray/gradient/custom image).
- **Why it’s better**
  - Aligns with marketplace requirements; repeatable brand look; creative control.
- **How to ship**
  - UI: small preset buttons with responsive previews.
  - Prompt: append style/background/ratio hints; seed persisted per session.
  - Optional background replace: run a background module or instruct the model explicitly.

---

## 3) Economy Mode (Batch Generation)
- **Before**
  - Real‑time generation; immediate results; higher token price.
- **After**
  - Optional “Economy (slower, cheaper)” toggle using batch jobs.
  - Images appear as “Processing…” in the Gallery and resolve when ready.
- **Why it’s better**
  - Reduces cost per image (~50% vs standard); supports larger batches and bursts.
- **How to ship**
  - Backend: add a batch job endpoint + status polling/webhook handler.
  - Frontend: toggle + status UI; notify when ready (toast/email); auto‑insert into Gallery.

---

## 4) High‑Res Upscaler
- **Before**
  - Base resolution only.
- **After**
  - 2x/4x upscaler button per image (extra credits); saves a new version to Gallery.
- **Why it’s better**
  - Sharper marketplace images without re‑generation.
- **How to ship**
  - API: `/api/images/upscale` (service role for Storage and metadata insert).
  - UI: action on Gallery cards; show credit cost tooltip.

---

## 5) Editing UX (Fast & Friendly)
- **Before**
  - Rotate; basic edits via modal.
- **After**
  - Quick transforms: rotate (done), flip, auto‑crop (Amazon 2000×2000, Flipkart 1080×1080), smart margins.
  - Fine‑tune sliders: brightness/contrast/exposure/temp with live preview.
  - Magic erase brush for small artifact removal.
- **Why it’s better**
  - Faster to reach marketplace‑ready assets; less external tooling.
- **How to ship**
  - Client‑side canvas edits; persist edited outputs as new images; track `parentId` lineage.

---

## 6) Gallery & Organization
- **Before**
  - Per‑user gallery; rotate & download; metadata tags (category, background; person try‑on hides model attributes).
- **After**
  - Albums/folders; user tags; favorites; bulk actions (ZIP download, delete, move to album).
  - Filter/search by date, category, tag, background.
  - Default person photo; copy public URL; optionally private images with signed links.
- **Why it’s better**
  - Scales with user libraries; faster retrieval; share‑friendly.
- **How to ship**
  - Supabase: `albums`, `image_tags`, `favorites` tables; RLS by user.
  - API routes: list/filter; bulk ops; ZIP generation on the fly.
  - UI: multi‑select with sticky actions; tag editor modal.

---

## 7) Mobile‑First Enhancements
- **Before**
  - Responsive layout; generate button within the panel.
- **After**
  - Sticky generate bar on small screens; bigger touch targets; swipe between images.
  - Skeleton loaders and smart lazy loading.
- **Why it’s better**
  - Smoother, thumb‑reachable controls; perceived performance boost.
- **How to ship**
  - Sticky footer CTA; gesture handlers; `loading="lazy"` + intersection observers.

---

## 8) Payments & Credits
- **Before**
  - Credit packs; UPI + cards; webhook credits; header shows live credits.
- **After**
  - Credit estimator (“This batch costs X”); first‑run free preview credit.
  - Subscriptions (monthly packs) via Dodo; coupons/referrals.
- **Why it’s better**
  - Clear pricing; better conversion; recurring revenue.
- **How to ship**
  - UI estimator bound to options; Dodo subscription endpoints; coupon/referral metadata; webhook crediting.

---

## 9) Reliability & Speed
- **Before**
  - Direct generate; optimistic UI; sync retries minimal.
- **After**
  - Job queue + retries for generation and upload; graceful rate‑limit handling.
  - Local caching of last product/person image; prefetch of likely next actions.
- **Why it’s better**
  - Fewer failures at peak times; faster repeat sessions; stable experience.
- **How to ship**
  - Queue (table + worker via serverless or cron); exponential backoff; status events; localStorage cache.

---

## 10) Security & Compliance
- **Before**
  - Public storage objects; RLS on tables.
- **After**
  - Signed URLs for downloads (time‑limited); optional private gallery toggle.
  - Content safety checks; audit log of generate/edit/download actions.
- **Why it’s better**
  - Better privacy; safe platform; traceability.
- **How to ship**
  - Switch to private bucket + signed URLs; add `audit_events` table and write on key actions.

---

## 11) Accessibility & Internationalization
- **Before**
  - Semantic HTML; basic contrast; no i18n.
- **After**
  - Keyboard shortcuts; ARIA labels; improved focus states.
  - i18n: externalized copy; language switcher (en → hi/es next).
- **Why it’s better**
  - Inclusive, global UX; improved usability scores.
- **How to ship**
  - Centralized strings file; i18n library; keyboard handlers; a11y audit fixes.

---

## 12) Analytics & A/B Testing
- **Before**
  - Minimal console logs.
- **After**
  - Event analytics (generate success/fail/time), conversion to checkout, feature usage.
  - Prompt/style A/B tests; cohort tagged in metadata.
- **Why it’s better**
  - Data‑driven roadmap and pricing.
- **How to ship**
  - Client event tracker (segment/posthog/etc.); serverless events for backend steps; experiment assignment layer.

---

## 13) Onboarding & Help
- **Before**
  - No guided onboarding.
- **After**
  - 3–4 step first‑run tour; inline tooltips; troubleshooting card for try‑on.
- **Why it’s better**
  - Faster activation; fewer support tickets.
- **How to ship**
  - LocalStorage flag to show once; tooltip components; link to a help page.

---

## Already Shipped (Baseline)
- Per‑user credits table auto‑create on first fetch.
- Credits endpoints: get/use; webhook skeleton for payments.
- Dodo Checkout w/ UPI + INR; return URL handling; header live credits.
- Gallery: per‑user storage + metadata; rotate & download; tags saved.
- Try‑on toggle with identity‑preserving prompt; hides model attributes.
- Vercel rewrites to fix SPA 404 on refresh.

---

## Phased Rollout Plan
1. **Low‑risk UX wins (2–3 weeks)**
   - Sticky generate bar (mobile), aspect ratios, style presets, credit estimator.
   - Favorites and albums in Gallery; bulk download.
2. **Try‑on quality & upscaler (2–4 weeks)**
   - Default person photo; masking; high‑res upscaler.
3. **Economy mode & reliability (3–5 weeks)**
   - Batch jobs, queue/retries, “Processing…” states, notifications.
4. **Security & i18n (ongoing)**
   - Signed URLs/private gallery; a11y/i18n pass; analytics + A/B tests.

---

## Effort vs Impact (Quick Glance)
- **High Impact, Medium Effort**: Economy mode, High‑res upscaler, Albums/Tags/Bulk actions, Default person photo.
- **Medium Impact, Low Effort**: Aspect ratios, Style presets, Sticky generate bar, Credit estimator, Favorites.
- **Long‑term Foundation**: Signed URLs/private gallery, i18n/a11y, analytics & experiments, queue & retries.

---

## Tech Notes
- **Supabase**
  - Tables: `user_images` (done), add `albums`, `image_tags`, `favorites`, `audit_events`, `user_profile`.
  - Storage: consider private buckets + signed URLs; RLS policies for new tables.
- **API**
  - New routes: `/api/images/upscale`, `/api/gallery/zip`, `/api/batch/*` (submit/status/webhook).
- **Frontend**
  - Components: Mask brush, aspect/ratio cropper, style presets, sticky CTA, bulk selection, tag editor.
  - State: job status and notifications; cached last uploads; A/B assignment.

---

If you want, I can start with a small PR enabling aspect ratios, style presets, favorites, and a sticky generate bar. Those deliver visible value quickly without touching core generation.
