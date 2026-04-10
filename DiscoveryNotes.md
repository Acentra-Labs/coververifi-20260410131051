# Discovery Brief: CoverVerifi

**Generated:** 2026-04-10_08-24

---

## App Overview
**App Name:** CoverVerifi
**Alternative Names:** SubShield, ComplianceBridge, InsureGate

CoverVerifi is a multi-tenant SaaS platform that automates subcontractor insurance compliance tracking for construction consultants and general contractors. It replaces the current manual process of calling dozens of insurance agents, tracking certificates in spreadsheets, and scrambling to verify coverage before payments — reducing hours of phone calls to automated email workflows with one-click agent verification links.

## Target Users

**Primary Users:**
- **Insurance compliance consultants** (like Dawn) who manage subcontractor compliance on behalf of multiple GCs. They are the system administrators — they onboard GCs, enter subcontractor data, configure requirements, and monitor compliance across all clients.
- **General contractors (GCs)** who need to verify their subcontractors carry proper workers comp and general liability before every payment/draw. Typically managing 15-20+ subs per job across multiple jobs.

**Secondary Users:**
- **Insurance agents** who receive verification requests and upload new certificates. They should NOT need an account — they interact via emailed magic links only.
- **Subcontractors** who may need to upload their own documents or view their compliance status. Minimal interaction required.

## Core Problem

General contractors are legally liable for uninsured subcontractors' workers on their jobs. Under Idaho Code 72-216, if a sub's workers comp lapses and a worker is injured, the GC becomes the statutory employer and bears full liability — including all medical costs, lost wages, and a 10% penalty. During annual premium audits, if a GC cannot produce a valid COI for a sub, the insurer reclassifies those sub payments as payroll and charges additional premium.

**Current workarounds:** Spreadsheets in OneDrive, manual phone calls to 20+ different insurance agencies per job, physically reviewing each certificate before every draw, and hoping agents voluntarily notify them of lapses (they often don't, especially for general liability). This process is error-prone, time-consuming, and doesn't scale.

**Existing solutions** (Procore, HCSS, Avetta) are enterprise-priced ($600+/client or $12,500+/year), overly complex with dozens of unneeded modules, and have lengthy onboarding. Even mid-market tools like myCOI have opaque pricing and clunky interfaces. TrustLayer and BCS offer free tiers but lack the consultant-centric multi-tenant model Dawn needs.

## Platform Recommendation

**Responsive Web App** — A single responsive web application that works across desktop and mobile browsers. Reasoning:
- GCs want mobile access to "pull data quickly" — a responsive web app satisfies this without building a separate native app
- Dawn confirmed responsive web is sufficient for MVP
- Insurance agents interact via email links only — no app needed
- Fastest path to market for a 3-5 day prototype
- Can add a PWA manifest later for home-screen installation if mobile usage is heavy

## Recommended Tech Stack

**React + Vite + TailwindCSS + shadcn/ui + Supabase**

Reasoning:
- **React + Vite**: Fast build times, hot reload for rapid prototyping, large ecosystem
- **TailwindCSS + shadcn/ui**: Pre-built, accessible components that match the professional, data-dense dashboard pattern needed. shadcn/ui's table, badge, card, and dialog components directly map to the compliance dashboard UX
- **Supabase**: Provides auth (multi-tenant with RLS), PostgreSQL database, file storage (for certificates and W9s), edge functions (for email automation), and real-time subscriptions — all from one platform with a generous free tier. Eliminates the need to cobble together separate auth, database, and storage services
- **No SSR/SEO needed**: This is a logged-in SaaS app, not a marketing site. SPA is the right choice.

## Key Requirements

### MUST HAVE (MVP)

1. **Multi-tenant consultant architecture**
   - Consultant (admin) account can manage multiple GC clients
   - Each GC has their own login showing only their subcontractors
   - Row-level security ensures GCs cannot see other GCs' data
   - Consultant sees aggregate view across all GCs
   - [INFERRED] Future-proofed for Dawn to resell to other consultants (each consultant becomes a tenant)

2. **Subcontractor onboarding & management**
   - Consultant or GC enters sub info: company name, contact, phone, email, insurance agent name/email/phone
   - W9 upload with optional OCR parsing (extract company name, address, EIN, tax classification) — highlight missing fields
   - If a sub already exists in the system (entered by another GC), auto-populate known agent info (but don't reveal which other GCs use that sub)
   - Subs attached to specific GCs with ability for one sub to be linked to multiple GCs
   - [INFERRED] W9 storage toggle in settings (on/off) — when enabled, encrypts SSN/EIN fields at rest per Idaho breach notification law safe harbor requirements

3. **Insurance certificate tracking**
   - Track per subcontractor: General Liability policy (number, carrier, effective date, expiration date, coverage limits) and Workers Comp policy (number, carrier, effective date, expiration date, coverage limits)
   - Configurable minimum requirements per GC (default: $1M GL per occurrence, state statutory WC with $500K employer's liability)
   - Status badges: Compliant (green), Expiring within 30 days (amber), Expired/Non-compliant (red), Pending verification (gray)
   - Certificate document upload and storage (PDF)
   - [INFERRED] Track additional insured endorsement status (checkbox: required yes/no, confirmed yes/no) per GC-sub relationship
   - [INFERRED] Ghost policy flag — mark if a sole proprietor sub has a ghost WC policy (informational warning to GC)

4. **Automated email notifications**
   - Email templates customizable per GC (with GC's branding/info)
   - Auto-email to insurance agent requesting certificate when new sub is onboarded
   - Auto-email 30-day, 14-day, 7-day expiration warnings to agent (and optionally sub and GC)
   - Email includes: sub name, policy type needed, coverage requirements, and a magic link for response
   - [INFERRED] "I am no longer this person's agent" response option in agent emails
   - [INFERRED] Confirmation email to consultant when agent responds

5. **Insurance agent magic link verification**
   - Agent receives email with unique, secure, tokenized link (no login required)
   - Link opens a branded page showing: what is being requested (new cert vs. verification of existing)
   - For new certificate requests: simple upload form
   - For verification requests: Yes/No buttons ("Is this policy still active?")
   - [INFERRED] Option for agent to upload a replacement certificate directly
   - [INFERRED] Link expiration after 30 days with re-send capability

6. **Compliance dashboard**
   - Consultant view: all GCs with aggregate compliance stats, drill into any GC
   - GC view: all their subs with insurance status, expiration dates, agent info, policy numbers
   - Filterable/sortable by status (compliant, expiring, expired), sub name, expiration date
   - [INFERRED] "Action items" queue: things that need attention now (expired certs, unresponded requests, new subs without insurance on file)
   - [INFERRED] Draw-readiness view: "Before you pay these subs, here's their compliance status" — maps to the existing workflow of checking insurance before each draw

7. **Authentication & role-based access**
   - Consultant/Admin: full access to all GCs and subs in their tenant
   - General Contractor: sees only their subs, can add new subs, can trigger verification requests
   - [INFERRED] Email/password auth with password reset via Supabase Auth
   - [INFERRED] Session management with automatic timeout for security

### SHOULD HAVE (Post-MVP)

8. **W9 OCR parsing** — Use Docsumo or Claude Vision API to auto-extract fields from uploaded W9s, highlight what's missing, and pre-fill the sub's record. For MVP, manual entry with file upload is sufficient.

9. **Subcontractor portal** — Optional login for subs to view what documents are needed, upload certificates themselves (though agent-submitted certs are preferred for authenticity).

10. **Subcontract agreement tracking** — Track annual subcontract agreements (signed/unsigned status, expiration). Dawn noted this is "nice to have, not MVP."

11. **Annual W9 renewal reminders** — Auto-notify when a W9 is older than 12 months and needs refreshing.

12. **Reporting & export** — Compliance reports for audits (show historical certificate coverage per sub for any date range), exportable to PDF/CSV. Critical for the annual audit requirement — GCs must prove coverage for specific date ranges going back up to 3 years.

13. **Additional insured endorsement workflow** — Configurable per GC: if the GC requires additional insured endorsement, add it to the automated request flow and track confirmation.

## Competitive Landscape

| Product | Pricing | Target | Strengths | Weaknesses |
|---------|---------|--------|-----------|------------|
| **TrustLayer** | Free (≤50 vendors), then ~$10/vendor/mo | SMB to Enterprise | Clean UX, no vendor login needed, 30-min onboarding, free tier | Limited customization, no consultant multi-tenant model |
| **BCS** | Free (≤25 vendors), $0.95/vendor/mo | SMB | AI-powered extraction, real-time deficiency feedback, Procore integration | Newer to market, less brand recognition |
| **myCOI Central** | ~$1,500-$3,000/yr (estimated) | Mid-market (100-500 employees) | Automated follow-ups, vendor portal, compliance dashboard | "Chunky and cumbersome" UI, slow certificate reviews, opaque pricing |
| **Avetta** | $600+/client, quote-based | Enterprise | Broad risk management, 130K+ businesses | Terrible customer service, "painful" UX, prohibitively expensive for SMB |
| **Billy** | $100-$300/mo | Construction GCs | Construction-specific, AI endorsement review, deep ERP integrations | More expensive, focused on larger GCs |
| **Constrafor** | $12,500/yr minimum | Mid-large construction | Full procurement + compliance platform | Way too expensive and broad for small consultant |
| **Procore/HCSS** | Enterprise pricing | Large contractors | Full construction management suites | Massively over-featured, expensive, cumbersome |

**CoverVerifi's differentiation:**
- **Consultant-centric multi-tenant model** — None of the competitors are built for a consultant managing compliance across multiple GC clients. They all assume the GC is the primary user.
- **Simplicity** — Focused exclusively on insurance compliance, not a 50-feature construction management suite
- **Price point** — Targeting the gap between free tools (limited) and enterprise solutions ($600+/yr)
- **Agent magic links** — Frictionless verification flow that doesn't require agents to create accounts
- **Idaho-specific defaults** — Pre-configured with Idaho WC and GL requirements, Idaho Industrial Commission registration awareness

## UX Considerations

### Information Architecture
- **Left sidebar navigation**: Dashboard, My GCs (for consultant) / My Subs (for GC), Documents, Settings
- **Consultant landing page**: Card grid of GC clients, each showing compliance health score (% compliant), sub count, action items count
- **GC subcontractor list**: Data table with columns — Sub Name, WC Status, GL Status, WC Expiry, GL Expiry, Agent, Last Verified. Color-coded status badges. Click to expand details.
- **Sub detail panel**: Slide-over or dedicated page showing full sub info, all certificates on file, verification history, W9 status, linked GCs (consultant view only)

### Color System (Tailwind/shadcn compatible)
- **Primary**: Slate-800/900 (#1e293b / #0f172a) — navy, trustworthy, professional
- **Primary accent**: Blue-600 (#2563eb) — interactive elements, links
- **CTA/Action**: Amber-600 (#d97706) — primary action buttons (stands out from generic blue SaaS)
- **Compliant**: Green-600 (#16a34a)
- **Expiring**: Amber-500 (#f59e0b)
- **Expired/Non-compliant**: Red-600 (#dc2626)
- **Background**: Slate-50 (#f8fafc), cards on white
- **Text**: Slate-900 primary, Slate-500 secondary

### Key Flows
1. **Onboard new sub**: GC enters sub info → system checks if sub exists → if yes, pre-fills agent info → upload W9 → auto-email agent for certificates → track in dashboard
2. **Pre-draw verification**: GC opens "Draw Readiness" view → sees all subs on current job with compliance status → one-click "Verify All" sends batch emails to agents → track responses
3. **Agent verification**: Agent receives email → clicks magic link → sees branded page → uploads cert or clicks "Yes, still active" → system updates status and notifies consultant/GC
4. **Expiration workflow**: 30 days before expiry → auto-email to agent → if no response, escalate at 14, 7, 1 day → on expiry day, notify GC and consultant → flag sub as non-compliant

### Design Direction
- Clean, minimal, data-dense — construction professionals want information, not animations
- Card-based layouts with clear status badges
- Professional but approachable — not sterile enterprise, not playful startup
- [INFERRED] Logo concept: Shield or checkmark motif combined with construction element. "CoverVerifi" suggests coverage + verification.

## Technical Considerations

### Data Architecture
- **Multi-tenant via Supabase RLS**: Consultant → GCs → Subcontractors → Certificates. Row-level security policies ensure tenant isolation.
- **Key entities**: Consultants, GeneralContractors, Subcontractors, InsuranceAgents, Certificates, VerificationRequests, W9Documents, GC_Sub_Relationships, EmailTemplates
- **Subcontractor sharing**: A sub can be linked to multiple GCs. The sub record is shared; the GC-Sub relationship record holds GC-specific settings (additional insured required, etc.)

### Email Automation
- **Supabase Edge Functions + Resend or SendGrid** for transactional email
- Customizable email templates stored per GC with merge fields (GC name, sub name, policy type, requirements, magic link)
- [INFERRED] Email delivery tracking (sent, opened, clicked) to know if agents are engaging
- Cron job or scheduled function for expiration-based triggers (30/14/7/1 day)

### File Storage & Security
- Supabase Storage for certificates (PDF) and W9s
- [INFERRED] W9s stored in a separate, access-controlled bucket with encryption at rest
- [INFERRED] SSN/EIN fields encrypted at the application level (not just database level) per Idaho Code 28-51-104 breach notification safe harbor
- [INFERRED] Access logging for W9 document views (who accessed what, when)
- Certificate retention: minimum 3 years per audit lookback window, recommend 5-7 years per construction defect statute of limitations

### W9 Parsing (Post-MVP or stretch goal)
- For MVP: manual entry with PDF upload
- For enhancement: Claude Vision API or Docsumo for OCR extraction of W9 fields
- Extract: name, business name, tax classification, address, EIN/SSN
- Highlight missing/unreadable fields for manual review

### Magic Link System
- Generate unique, time-limited tokens (UUID v4) per verification request
- Token maps to: requesting GC, subcontractor, policy type, requirements
- Agent landing page is a simple, unauthenticated form — upload cert or confirm coverage
- [INFERRED] Rate limiting and token expiration (30 days) to prevent abuse

### Idaho-Specific Defaults
- Default GL requirement: $1,000,000 per occurrence / $2,000,000 aggregate
- Default WC requirement: Statutory + $500,000/$500,000/$500,000 employer's liability
- Sole proprietor flag: Idaho sole proprietors without employees are exempt from WC but GCs should still require ghost policies or proof of exemption
- [INFERRED] Idaho Industrial Commission registration status field (registered / exempt / unknown)

### Pricing Model Recommendation (for Dawn's SaaS)
- **Free tier**: 1 GC, up to 5 subs (for demos and small trials)
- **Professional**: $79/mo — up to 5 GCs, 50 subs, full automation
- **Business**: $199/mo — up to 20 GCs, 200 subs, custom email templates, priority support
- **Enterprise**: Custom — unlimited, white-label, API access

## Open Questions

1. **Email sender identity**: Should automated emails come from Dawn's domain, the GC's domain, or a CoverVerifi domain? This affects email deliverability setup (SPF/DKIM) and trust with agents. Recommend CoverVerifi domain for MVP with GC branding in the email body.

2. **Historical data migration**: Does Dawn have existing spreadsheets of subs, agents, and certificates that need to be imported into the system at launch? If so, what format?

3. **Ghost policy handling**: Should the system actively warn GCs when a sole proprietor sub has a ghost policy (which provides no actual coverage)? Or is this just informational? The notes mentioned it but didn't clarify the desired behavior.

4. **Multi-state expansion**: The MVP is Idaho-focused, but if Dawn resells to consultants in other states, the default insurance requirements and WC registration rules will differ. Should the system support state-specific requirement profiles from the start, or is Idaho-only fine for MVP?

5. **Payment processing**: When Dawn is ready to charge for subscriptions, does she have a preference on payment processor? [INFERRED] Stripe is the standard choice for SaaS — can integrate via Supabase + Stripe for subscription billing when ready.
