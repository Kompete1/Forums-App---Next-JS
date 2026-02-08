# Manual Testing Guide

This file lists checks that are still manual (not fully automated in e2e).

## Pre-check
1. Start app from `web/`:
   - `npm install`
   - `npm run dev`
2. Confirm app opens at `http://localhost:3000`.

## Manual-only checks

### 1) Moderator-only flows
1. Sign in as user with `mod` or `admin` role.
2. Open `/forum/<threadId>` and click `Lock thread`.
3. Confirm status changes to `Locked` and reply form is hidden.
4. Click `Unlock thread` and confirm status returns to `Open`.
5. Sign in as non-mod user and confirm lock/unlock controls do not appear.

### 2) Reports moderation visibility
1. Sign in as regular user and submit a report.
2. Sign in as mod/admin and open `/moderation/reports`; confirm report appears.
3. Sign in as non-mod and open `/moderation/reports`; confirm access denied.

### 3) Report burst limit (>10 in 15 min)
1. Sign in as one regular user.
2. Submit reports repeatedly across available thread/reply targets.
3. After 10 reports in 15 minutes, confirm message: report limit reached.

### 4) Cross-user owner boundaries
1. User A creates thread/reply/newsletter.
2. User B attempts update/delete for User A content.
3. Confirm rejection by RLS.

## SQL verification (Supabase Dashboard)
1. Open `SQL Editor`.
2. Run `web/supabase/verification/pr15_rate_limit_checks.sql`.
3. Confirm expected rows are returned for all sections.
