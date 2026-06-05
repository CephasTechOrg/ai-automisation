# Email and AI Automation

## Goal

The platform should automate the parts of customer communication that small businesses often miss:

- Instant confirmation to customers
- New-lead alerts to owners
- AI summaries
- Follow-up reminders
- Later: suggested replies and campaign-style follow-ups

## Providers

### Email provider

Use **Resend**.

Resend should send:

- Customer confirmation emails
- Owner new-lead alerts
- Follow-up emails
- Admin notifications

### AI provider

Use **DeepSeek** first.

The system should be designed so DeepSeek can be replaced or extended later.

Possible future providers:

- OpenAI
- Claude
- Gemini
- Local models

## Email flow: customer confirmation

Triggered when a customer submits a form.

Flow:

```text
1. Customer submits public form
2. Lead is saved
3. System generates confirmation email
4. Resend sends email to customer
5. email_events row is saved
6. messages row is saved
7. lead_events row is saved
```

Example message:

```text
Hi Ama,

Thanks for contacting Bright Cleaning Services. We received your request about deep cleaning for a 3-bedroom home. The business owner will review your request and contact you shortly.

Thank you.
```

## Email flow: owner new-lead alert

Triggered when a lead is created.

Flow:

```text
1. Lead is saved
2. AI summary is generated
3. Owner notification email is created
4. Resend sends email to owner
5. email_events row is saved
6. messages row is saved
7. lead_events row is saved
```

Example owner alert:

```text
New lead for Bright Cleaning Services

Customer: Ama Boateng
Phone: 704-xxx-xxxx
Email: ama@example.com
Service: Deep cleaning
Preferred time: Saturday afternoon

AI Summary:
Customer wants a 3-bedroom deep cleaning this weekend and is likely looking for pricing and availability.

Suggested next action:
Reply quickly with available times and a price range.
```

## AI flow: lead summary

Input:

```json
{
  "business": {
    "name": "Bright Cleaning Services",
    "industry": "Cleaning"
  },
  "lead": {
    "customer_name": "Ama Boateng",
    "service_needed": "Deep cleaning",
    "preferred_time": "Saturday afternoon",
    "message": "I need a 3-bedroom house cleaned this weekend. How much?"
  }
}
```

Output:

```json
{
  "summary": "Customer wants a 3-bedroom deep cleaning this weekend and is asking for pricing.",
  "priority": "medium",
  "intent": "quote_request",
  "suggested_next_action": "Reply with weekend availability and price range.",
  "customer_reply_draft": "Thanks for reaching out. We received your request for a 3-bedroom deep cleaning this weekend. The team will confirm availability and pricing shortly."
}
```

## AI provider abstraction

Do not call DeepSeek directly everywhere.

Create a provider layer:

```text
/lib/ai
  provider.ts
  deepseek-provider.ts
  prompts.ts
  types.ts
```

Example interface:

```ts
export interface AIProvider {
  summarizeLead(input: LeadSummaryInput): Promise<LeadSummaryOutput>;
  draftCustomerReply(input: CustomerReplyInput): Promise<CustomerReplyOutput>;
}
```

Then implement:

```ts
export class DeepSeekProvider implements AIProvider {
  async summarizeLead(input: LeadSummaryInput) {
    // Call DeepSeek API here
  }
}
```

Why this matters:

- You can switch AI providers later
- You can test the system without real AI calls
- You avoid vendor lock-in
- You centralize prompts

## Prompt versioning

Every AI output should store:

```text
provider
model
prompt_version
input_snapshot
output
status
error_message
```

Why?

- You can debug bad summaries
- You can improve prompts later
- You can compare versions
- You know exactly what the model saw

## Recommended AI guardrails

The AI should not pretend to be the business owner.

It should:

- Summarize customer request
- Suggest next action
- Draft a polite reply
- Avoid making promises the business did not approve
- Avoid quoting exact prices unless configured
- Avoid legal, medical, or financial claims

For MVP, customer auto-replies should be simple confirmations, not complex AI-generated commitments.

Safer customer reply:

```text
We received your request. The business will contact you shortly.
```

Riskier customer reply:

```text
We can definitely do it for $150 tomorrow.
```

Avoid risky promises unless the business configured them.

## Email sending rules

### Server-side only

Resend API key must be used only on the server.

### Log every email

Every email attempt should create an `email_events` record.

Status examples:

```text
queued
sent
failed
bounced
opened
clicked
```

MVP can support:

```text
sent
failed
```

### Do not silently fail

If email fails:

- Save error in `email_events`
- Save lead anyway
- Show admin warning later

Lead creation should not be lost just because an email failed.

## Follow-up automation

MVP follow-up rule:

```text
If lead is still new/contacted after 24 hours, create/send follow-up.
```

However, for the earliest version, you can make follow-up manual:

- Owner clicks “Send follow-up”
- System sends email through Resend
- System logs event

Then add automatic scheduled follow-ups later.

## Recommended automation events

```text
lead.created
ai.summary.requested
ai.summary.completed
email.customer_confirmation.requested
email.customer_confirmation.sent
email.owner_notification.requested
email.owner_notification.sent
follow_up.scheduled
follow_up.sent
lead.status_changed
```

This event mindset makes the system easier to scale.

## Error handling

AI failure should not break lead capture.

If AI fails:

```text
1. Save lead
2. Save ai_outputs failure row
3. Send owner notification without AI summary
4. Show fallback summary: "AI summary unavailable"
```

Email failure should not delete the lead.

If email fails:

```text
1. Save lead
2. Log failed email event
3. Show alert in admin system later
```

## MVP automation order

Build in this order:

1. Lead submission
2. Save lead
3. Owner email notification
4. Customer confirmation email
5. AI summary
6. Store AI output
7. Follow-up table
8. Manual follow-up
9. Scheduled follow-up
