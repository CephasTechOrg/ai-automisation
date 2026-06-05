# AI.md — DeepSeek Model Strategy and AI Automation Rules

Project: LeadFlow Pro  
Backend: FastAPI + Supabase + Resend + DeepSeek  
Purpose: Document which DeepSeek model we should use, why we should change from deprecated model names, and how AI should behave inside the system.

---

## 1. Current Issue

The original FastAPI backend starter used:

```env
DEEPSEEK_MODEL=deepseek-chat
```

and some backend code stored AI output using:

```python
model="deepseek-chat"
```

This should be changed.

DeepSeek has listed the newer models:

```text
deepseek-v4-flash
deepseek-v4-pro
```

The older model names are scheduled for deprecation:

```text
deepseek-chat      -> deprecated on 2026/07/24 15:59 UTC
deepseek-reasoner  -> deprecated on 2026/07/24 15:59 UTC
```

For compatibility:

```text
deepseek-chat      = non-thinking mode of deepseek-v4-flash
deepseek-reasoner  = thinking mode of deepseek-v4-flash
```

So we should stop building the system around `deepseek-chat`.

---

## 2. Recommended Default Model

Use this as the default model:

```env
DEEPSEEK_MODEL=deepseek-v4-flash
```

Why:

- Faster for normal automation
- Better for frequent API calls
- Better cost/performance for MVP
- Good enough for lead summaries, reply drafts, intent detection, urgency scoring, and dashboard insights
- Replaces the older `deepseek-chat` behavior

---

## 3. Recommended Advanced Model

Use this later for deeper reasoning workflows:

```env
DEEPSEEK_REASONING_MODEL=deepseek-v4-pro
```

Use `deepseek-v4-pro` only for heavier tasks such as:

- Deep business reports
- Complex automation planning
- Multi-step agent workflows
- Advanced lead analysis
- Higher-value customer reasoning
- Admin-level intelligence reports

Do not use `deepseek-v4-pro` for every small lead submission unless the cost and latency are acceptable.

---

## 4. Environment Variables To Use

Update `.env.example` and production environment variables.

Recommended:

```env
DEEPSEEK_API_KEY=sk-xxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_REASONING_MODEL=deepseek-v4-pro
```

Optional later:

```env
DEEPSEEK_ENABLE_THINKING=false
DEEPSEEK_TIMEOUT_SECONDS=20
DEEPSEEK_MAX_RETRIES=2
DEEPSEEK_PROMPT_VERSION=v1
```

---

## 5. Backend Code Change Required

In `app/core/config.py`, add:

```python
DEEPSEEK_MODEL: str = "deepseek-v4-flash"
DEEPSEEK_REASONING_MODEL: str = "deepseek-v4-pro"
```

In `.env.example`, change:

```env
DEEPSEEK_MODEL=deepseek-chat
```

to:

```env
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_REASONING_MODEL=deepseek-v4-pro
```

---

## 6. Important Code Fix In `lead_service.py`

Do not hardcode the model name like this:

```python
model="deepseek-chat",
```

Instead, import settings:

```python
from app.core.config import settings
```

Then store the actual configured model:

```python
model=settings.DEEPSEEK_MODEL,
```

Correct example:

```python
await self.ai_repo.create_output(
    business_id=business.id,
    lead_id=lead.id,
    output_type=AIOutputType.LEAD_SUMMARY,
    model=settings.DEEPSEEK_MODEL,
    structured_output=ai_result,
    raw_output=None,
)
```

This prevents the database from storing the wrong or deprecated model name.

---

## 7. AI Service Model Usage

In `app/services/ai_service.py`, the model should come from settings:

```python
json={
    "model": settings.DEEPSEEK_MODEL,
    "messages": [
        {"role": "system", "content": "Return strict JSON only. No markdown."},
        prompt,
    ],
    "temperature": 0.2,
}
```

For future deeper reasoning tasks:

```python
json={
    "model": settings.DEEPSEEK_REASONING_MODEL,
    "messages": messages,
    "temperature": 0.2,
    "reasoning_effort": "high",
    "extra_body": {"thinking": {"type": "enabled"}},
}
```

Only use reasoning mode for tasks that actually need deeper reasoning.

---

## 8. AI Behavior Rules For LeadFlow Pro

The AI should assist the business owner, not secretly take over the conversation.

For MVP:

```text
AI can auto-send simple acknowledgement emails.
AI should draft important replies.
The owner should approve, edit, or send AI replies.
```

Recommended MVP behavior:

```text
Customer submits public form
→ Lead is saved
→ Customer receives simple acknowledgement email
→ Owner receives new lead alert
→ DeepSeek generates lead summary
→ DeepSeek generates suggested reply
→ Owner reviews suggested reply in dashboard
→ Owner approves/edits/sends reply
```

Do not allow AI to automatically send full sales replies until the business explicitly enables that setting.

---

## 9. AI Outputs To Store

Store every AI output in the `ai_outputs` table.

Recommended fields:

```text
business_id
lead_id
output_type
model
prompt_version
raw_output
structured_output
created_at
```

For lead summaries, store structured JSON like:

```json
{
  "summary": "Customer needs a roof inspection after a storm.",
  "urgency": "normal",
  "intent": "high",
  "suggested_reply": "Hi Jessica, thanks for reaching out...",
  "next_step": "Offer two appointment times this week.",
  "tags": ["roof inspection", "storm damage", "high intent"]
}
```

---

## 10. Prompt Safety Rules

All AI prompts should include these rules:

```text
Do not invent facts.
Do not promise availability unless the business provided it.
Do not give legal, medical, or financial advice.
Keep replies short and professional.
Return valid JSON only when structured output is required.
If information is missing, ask a clear follow-up question.
```

For customer-facing replies, AI should avoid:

```text
false guarantees
fake appointment confirmation
pricing claims not provided by the business
medical/legal/financial advice
overly long replies
aggressive sales language
```

---

## 11. Model Provider Abstraction

The backend should not be locked to DeepSeek forever.

Use a service abstraction like:

```text
AIService
├── DeepSeekProvider
├── OpenAIProvider later
├── AnthropicProvider later
└── GeminiProvider later
```

The rest of the app should call:

```python
self.ai.summarize_lead(...)
self.ai.generate_suggested_reply(...)
self.ai.generate_dashboard_insight(...)
```

The rest of the app should not care which AI provider is being used.

This makes it easy to switch models later.

---

## 12. Final Decision

Default model for LeadFlow Pro:

```text
deepseek-v4-flash
```

Advanced/reasoning model for later:

```text
deepseek-v4-pro
```

Do not continue using:

```text
deepseek-chat
deepseek-reasoner
```

because they are scheduled for deprecation.

---

## 13. Backend TODO Reminder

Update these files:

```text
.env.example
app/core/config.py
app/services/ai_service.py
app/services/lead_service.py
docs/AI.md
```

Required changes:

```text
1. Change default model from deepseek-chat to deepseek-v4-flash.
2. Add DEEPSEEK_REASONING_MODEL=deepseek-v4-pro.
3. Stop hardcoding model names in services.
4. Store settings.DEEPSEEK_MODEL in ai_outputs.
5. Use deepseek-v4-pro only for heavier reasoning tasks.
```

---

## 14. Important Reminder

Before production launch, check the current DeepSeek API documentation again.

Model names, pricing, and deprecation timelines can change.

Do not assume old model names are still safe.
