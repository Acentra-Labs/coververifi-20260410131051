# Approved Features: CoverVerifi

FEATURES.md has been updated. Here's a summary of the decomposition:

---

### MUST HAVE (7 features — unchanged, already well-scoped)
1. **Authentication & Role-Based Routing** — Supabase Auth + role routing (consultant/GC)
2. **Consultant Multi-GC Admin Dashboard** — GC cards with compliance health metrics
3. **GC Subcontractor Compliance Table** — Sortable/filterable data table with status badges
4. **Subcontractor Management & Profiles** — Multi-step add wizard with duplicate detection
5. **Subcontractor Detail View** — Full profile with certificates, W-9, timeline
6. **Compliance Status Engine** — Traffic-light calculation logic consumed by all views
7. **Agent Verification Portal** — Public tokenized page for no-login agent interaction

### NICE TO HAVE (10 features — 2 added)
- Email Workflow UI, Notification Center, Charts, CSV Import, Reports, Global Search, GC Management, Document Version History
- **NEW: Draw Readiness View** (#9) — promoted from FUTURE since `PaymentDraw.jsx` already exists in the codebase
- **NEW: Annual W-9 Renewal Reminders** (#10) — per discovery brief SHOULD HAVE

### FUTURE (15 features)
- "Payment Draw Integration" updated to "Payment Draw + ERP Integration" (basic view promoted up)
- All other FUTURE items unchanged

### Key updates applied:
- `react-router-dom` v6 → **v7** (current stable)
- `@supabase/auth-helpers-react` → **`@supabase/ssr`** (former is deprecated)
- Added `@supabase/ssr` to package manifest
- Data model (13 tables), build plan (5-day), and design system unchanged — already aligned with brief
