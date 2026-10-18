# Hosted-first Deployment — Implementation Tasks

**Status:** Deferred — hosted native development takes priority  
**Specification:** `./spec.md`

## T001 — Future Railway-ready image selection

- [ ] Select a deployment configuration when managed hosting becomes active.
- [ ] Verify images in Railway build logs for Gateway, Core, Geo and Worker.

## T002 — Hosted environment contract

- [x] Document the required public/private service layout and variable contract.
- [ ] Create Railway staging project, services and managed Redis.
- [ ] Set secrets in Railway/Vercel; do not store them in tracked files.

## T003 — Staging validation

- [ ] Deploy the four backend services to Railway staging.
- [ ] Apply reviewed Supabase Cloud migrations without reset.
- [ ] Set Vercel staging API URL to the Railway Gateway URL.
- [ ] Run health, API smoke and authenticated Journey A/B/C checks.

## T004 — Production cutover

- [ ] Promote the same verified configuration to production.
- [ ] Update Vercel production API URL and verify CORS.
- [ ] Retain the previous Gateway URL/configuration as rollback until acceptance.
