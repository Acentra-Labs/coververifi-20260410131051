# CoverVerifi User Guide

## What is CoverVerifi?

CoverVerifi is a tool that helps construction companies make sure their subcontractors have valid insurance. Before you pay a subcontractor or let them start work on a job, you need to verify they carry the right workers' compensation and general liability coverage. If they don't, and someone gets hurt, your company could be held responsible for all medical bills and lost wages.

CoverVerifi replaces the old process of calling insurance agents, tracking certificates in spreadsheets, and hoping nothing expires without notice. It automates the entire workflow — from requesting certificates to sending reminders before they expire.

---

## How to Log In

1. Open CoverVerifi in your web browser
2. Enter your **email address** and **password**
3. Click **Sign In**

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Consultant | dawn@mitchellcompliance.com | demo1234 |
| General Contractor | mike@boisevalley.com | demo1234 |
| General Contractor | sarah@tvbuilders.com | demo1234 |

**Consultant** accounts can see and manage multiple GC clients. **General Contractor** accounts only see their own subcontractors.

---

## The Dashboard

After you log in, you'll see the Dashboard. This is your home base.

### If You're a Consultant
- **Top stats** show how many GC clients you have, how many total subcontractors, and how many are compliant, expiring, or non-compliant
- **GC Client cards** show each contractor with a compliance percentage and colored progress bar
  - **Green** = all subs compliant
  - **Amber** = some certificates expiring soon
  - **Red** = some certificates expired or missing
- **Action Items** lists subcontractors that need attention right now
- **Recent Activity** shows what has been happening

### If You're a General Contractor
- **Top stats** show your subcontractor counts by status
- **Action Items** lists subs that need immediate attention
- **Recent Activity** shows recent events

Click any subcontractor name to see their full details.

---

## Managing GC Clients (Consultants Only)

The **My GCs** page is available only to consultant accounts.

### What You See
Cards for each GC client showing:
- Company name and primary contact
- Compliance percentage with progress bar
- Count of compliant, expiring, and non-compliant subs
- Contact info (email and phone)

### Adding a New GC Client
1. Click the **Add GC Client** button (top right)
2. Fill in the company name, contact name, and email (required)
3. Optionally add phone and address
4. Click **Add GC Client**

### Viewing a GC's Subcontractors
Click any GC card to go directly to that contractor's subcontractor list.

---

## Managing Subcontractors

The **My Subs** (GC view) or **All Subs** (consultant view) page shows all subcontractors in a table.

### Understanding the Table
Each row shows:
- **Subcontractor** — Company name and contact person
- **Trade** — What type of work they do (Electrical, Plumbing, etc.)
- **GL Status** — General Liability insurance status
- **WC Status** — Workers Compensation insurance status
- **Agent** — The insurance agent on file

### Status Colors
- **Green "Compliant"** — Certificate is current and meets requirements
- **Amber "Expires in Xd"** — Certificate expires within 30 days
- **Red "Expired"** — Certificate has expired
- **Red "No Certificate"** — No certificate on file at all
- **Gray "Pending Verification"** — Waiting for the agent to respond

### Filtering and Searching
- Use the **search box** to find subs by name or trade
- Click the **filter buttons** (All, Compliant, Expiring, Expired) to show only certain statuses
- Click **column headers** to sort the table

### Adding a New Subcontractor
1. Click **Add Subcontractor**
2. Fill in company name, contact name, email, and trade (required)
3. If you're a consultant, select which GC this sub belongs to
4. Optionally fill in insurance agent details
5. Click **Add Subcontractor**

---

## Subcontractor Detail Page

Click any subcontractor's name to see their full profile.

### What's on This Page
- **Contact information** — Name, email, phone, address
- **Insurance agent** — The agent who manages their policies
- **W-9 status** — Whether a W-9 is on file and when it was uploaded
- **General Liability certificate** — Full details including policy number, carrier, coverage amounts, dates, and verification status
- **Workers Comp certificate** — Same details as GL
- **Linked GCs** (consultant view only) — Which GC clients use this subcontractor
- **Verification History** — Past verification requests and their status

### Special Indicators
- **Sole Proprietor** — Purple badge. Idaho sole proprietors without employees may be exempt from workers comp.
- **Ghost Policy** — Yellow warning. The WC policy provides no actual coverage. The GC should be aware.

---

## Sending Verification Requests

When you need to verify a subcontractor's insurance:

1. Go to the subcontractor's detail page
2. Click **Request Verification**
3. Choose **General Liability** or **Workers Compensation**
4. Review the agent who will receive the request
5. Click **Send Request**

The agent receives an email with a secure link. They don't need to create an account.

---

## Verifications Page

The **Verifications** page shows all verification requests.

### Status Meanings
- **Pending** (blue) — Sent to the agent, waiting for response
- **Responded** (green) — Agent has confirmed coverage or uploaded a certificate
- **Expired** (red) — The request link expired after 30 days with no response

---

## Documents Page

The **Documents** page shows all insurance certificates on file.

- Browse certificates with policy numbers, carriers, and dates
- Filter by **GL** (General Liability) or **WC** (Workers Comp)
- Search by subcontractor name, policy number, or carrier
- Download certificates using the download button

---

## Settings

### Profile
Update your name, email, company, and password.

### Notifications
Control when automated emails are sent:
- 30 days before expiration
- 14 days before expiration
- 7 days before expiration
- 1 day before expiration
- Notify GC when an agent responds
- Notify consultant when an agent responds

### Compliance Defaults
Set the minimum insurance requirements:
- **General Liability**: Per occurrence and aggregate minimums (default: $1M / $2M)
- **Workers Comp**: Employer's liability (default: $500K)

### Email Templates
Customize the automated emails sent to insurance agents.

---

## How Insurance Agents Respond

When you send a verification request, the agent receives an email with a secure link:

1. They see the subcontractor's name and your company's name
2. They see what type of insurance is needed
3. They see the coverage requirements

**For new certificate requests:** Upload a certificate file (PDF, PNG, or JPG)

**For verification requests:**
- Click **Yes, Active** to confirm coverage is current
- Click **No / Changed** if coverage has changed
- Upload a replacement certificate instead
- Indicate they are no longer that company's agent

No account or login is required. The link expires after 30 days.

---

## Common Workflows

### 1. Adding a New Subcontractor
1. Go to **My Subs**
2. Click **Add Subcontractor**
3. Fill in their details and select the GC
4. Click **Add Subcontractor**
5. Go to the new sub's detail page
6. Click **Request Verification** for both GL and WC

### 2. Checking Compliance Before a Payment
1. Go to **My Subs**
2. Click the **Expired** filter to see non-compliant subs
3. Review each one and check for pending verification requests
4. Send new verifications where needed
5. Do not process payment until status turns green

### 3. Handling an Expiration Warning
1. Amber "Expiring" badges will appear on the dashboard
2. Click the sub to see details
3. Click **Request Verification** for a renewal
4. Monitor the **Verifications** page for the response

### 4. When a Sub is Non-Compliant
1. The sub shows a red badge
2. Check the detail page for specifics
3. Send a verification request if not already pending
4. If no response in a week, call the agent directly
5. Notify the GC not to pay the sub until resolved

---

## Frequently Asked Questions

**What do the colors mean?**
Green = compliant, Amber = expiring soon, Red = expired or missing, Gray = pending.

**Can I change coverage requirements?**
Yes. Go to Settings > Compliance Defaults.

**What happens when a certificate expires?**
The status automatically changes to red. Warning emails are sent at 30, 14, 7, and 1 day before expiration.

**Can a subcontractor be linked to multiple GCs?**
Yes. The subcontractor record is shared, but each GC has their own relationship settings.

**What is a ghost policy?**
A workers' comp policy for sole proprietors with no employees. It provides no actual coverage — it just prevents audit penalties for the GC.

---

## Troubleshooting

**The page won't load**
- Clear your browser cache and refresh
- Use a modern browser (Chrome, Firefox, Safari, Edge)

**I can't log in**
- Double-check your email and password (case-sensitive)
- Try the demo credentials listed above

**Data looks wrong or subs are missing**
- Check if you have a filter active
- Clear the search box

---

## Need Help?

Contact the CoverVerifi team at **Acentra Labs**: [https://acentralabs.com](https://acentralabs.com)
