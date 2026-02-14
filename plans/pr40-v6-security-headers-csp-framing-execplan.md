# PR40 ExecPlan: Security Header Hardening (CSP + Framing Strategy)

## Summary
Implement modern response-header hardening with a secure default anti-embed posture and an explicit allow-list mode for showcase embedding.

## Goals
- Add CSP across all app routes, including `/health`.
- Add explicit frame-embedding strategy:
  - default deny
  - optional allow-list for showcase embedding
- Keep existing hardening headers and production HSTS behavior.
- Extend e2e checks for CSP and mode-specific frame behavior.
- Document environment/config decisions and verification workflow.

## Non-goals
- No auth/RLS model changes.
- No UI redesign or route behavior changes.
- No new third-party analytics integrations.

## Assumptions and defaults
- Default mode is `SECURITY_EMBED_MODE=deny`.
- Allow-list mode is enabled explicitly with `SECURITY_EMBED_MODE=allowlist`.
- Current known parent embed origin is `https://kompete1.github.io`.
- Additional embed origins are supplied via `SECURITY_EMBED_ORIGINS`.

## Interfaces/config changes
- New env vars consumed in `web/next.config.ts`:
  - `SECURITY_EMBED_MODE`: `deny` | `allowlist` (default `deny`)
  - `SECURITY_EMBED_ORIGINS`: comma-separated HTTPS origins
- New/expanded response header:
  - `Content-Security-Policy`
- Conditional frame header behavior:
  - `deny` mode: `X-Frame-Options: DENY`
  - `allowlist` mode: omit `X-Frame-Options`

## Implementation steps
1. Update `web/next.config.ts`:
   - Parse embed mode + origins from env.
   - Build CSP directives conservatively.
   - Add mode-specific `frame-ancestors` policy.
   - Keep baseline headers and production-only HSTS.
2. Extend `web/tests/e2e/security-headers.spec.ts`:
   - Assert CSP is present on `/health`.
   - Assert mode-aware frame behavior.
3. Update docs:
   - `.env.example`
   - `SECURITY.md`
   - `web/README.md`
   - `web/docs/operations-runbook.md`
   - `web/docs/testing-manual.md`

## Acceptance criteria
1. `/health` returns CSP and existing baseline security headers.
2. `deny` mode returns `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
3. `allowlist` mode returns `frame-ancestors 'self'` + configured origins and does not emit blocking `X-Frame-Options`.
4. Lint/build/e2e security-header test pass locally.
5. Docs clearly state embedding decision and reproducible setup.

## Verification
From `web/`:
- `npm run lint`
- `npm run build`
- `npm run test:e2e -- tests/e2e/security-headers.spec.ts`

Allow-list mode verification:
- `SECURITY_EMBED_MODE=allowlist`
- `SECURITY_EMBED_ORIGINS=https://kompete1.github.io`
- rerun security-header e2e spec

## Risks and mitigations
- Risk: CSP blocks required runtime behavior.
  - Mitigation: conservative directives, include Supabase connect endpoints and dev localhost allowances.
- Risk: external embed breaks unexpectedly.
  - Mitigation: explicit allow-list mode + documented origin configuration.

## Rollback
- Revert PR40 config/docs changes and redeploy known-good build.
