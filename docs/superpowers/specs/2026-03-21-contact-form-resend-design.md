# Contact Form — Resend Integration Design

## Overview

Integrate the existing storefront contact form with Resend to send contact inquiries directly to `office@ambalajeconstanta.ro`. Uses the storefront's `RESEND_API_KEY` via a Next.js API route — no backend changes needed.

## Architecture

### Approach: Storefront-only (Next.js API route + Resend)

The contact form doesn't need MedusaJS services, event subscribers, or order data. A direct Resend call from a Next.js API route is the simplest path.

### Data Flow

```
User submits form → contact-form.tsx → POST /api/contact → Zod validation → Resend API → office@ambalajeconstanta.ro
```

## Files

### New: `storefront/src/app/api/contact/route.ts`

- Next.js API route handler (POST only)
- Server-side Zod validation (differs from client schema: `vizita_data` uses `z.string().optional()` instead of `z.date()` since JSON serialization converts Date to ISO string; `gdpr` field omitted — it's a client-side gate only)
- Input length limits on server schema: `nume` max 100, `email` max 254, `mesaj` max 2000, `telefon` max 20
- Sends email via Resend SDK
- `to`: `office@ambalajeconstanta.ro`
- `from`: `RESEND_FROM_EMAIL` env var
- `replyTo`: customer's email address (so office can reply directly)
- `subject`: includes request type (e.g., "Solicitare nouă: Cerere de consiliere")
- Body: structured plain-text with all form fields
- Returns JSON responses:
  - `200 { success: true }` — email sent
  - `400 { error: "message" }` — validation failure (fix your input)
  - `500 { error: "message" }` — Resend API failure (try again later)
- Log Resend errors server-side via `console.error` (don't expose details to client)

### Modified: `storefront/src/app/[countryCode]/(main)/contact/contact-form.tsx`

- Replace simulated `setTimeout` with `fetch('/api/contact', { method: 'POST', body: JSON.stringify(values) })`
- Handle success/error responses from the API
- Show error message if API call fails (distinct red styling vs green success)

### New dependency: `resend` package in storefront

## Email Format

Plain-text structured email to office. No React Email template — internal notification doesn't need fancy styling.

```
Tip solicitare: Cerere de consiliere

Nume: Popescu Andrei
Email: popescu@example.com
Telefon: 0722 123 456
Companie: SC Ambalaje SRL
Oraș: Constanța

Data vizită: 25 martie 2026
Ora vizită: 10:00

Mesaj:
Aș dori să discut despre opțiunile de ambalaje...
```

Visit date/time fields only included when request type is "vizita".

## Environment Variables

- `RESEND_API_KEY` — already in `storefront/.env.local`
- `RESEND_FROM_EMAIL` — needs to be added to `storefront/.env.local` (e.g., `noreply@ambalajeconstanta.ro`). Domain must be verified in Resend dashboard.

## Error Handling

- Server-side Zod validation (don't trust client-only validation)
- Resend API errors caught and returned as 500 with generic message
- Client shows error message on form submission failure

## Out of Scope

- Rate limiting (add later if spam becomes an issue)
- Customer confirmation email (only office receives the inquiry)
- React Email templates for contact form
