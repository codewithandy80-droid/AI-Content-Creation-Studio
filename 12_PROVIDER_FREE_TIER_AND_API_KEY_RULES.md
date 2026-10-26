# 12. Provider, Free-Tier & API-Key Rules

## Product constraint
The app must be designed for free-tier-only operation. This is a requirement, not a guarantee that third-party providers will remain free. Do not mandate paid subscriptions, silently enable billing, create paid resources, or automatically switch to a paid model.

## Provider manager requirements
- Provider integrations may include OpenRouter, Groq, Gemini, and compatible custom endpoints, only after current compatibility, terms, and free-tier eligibility are verified.
- Allow model assignment separately for Source Analysis, Script, Flow Prompt, Thumbnail Prompt, SEO, and Research.
- Provide simple and advanced settings.
- Allow manual provider priority and automatic selection only among eligible free options.
- Show provider/model connection and test status.
- Fetch model lists only when provider API supports it; otherwise make selection constraints clear.
- Show quota/usage only when provider data is actually available; do not invent exact remaining quota.
- Separate search-provider availability from AI-model availability.
- Unknown pricing models are excluded by default.
- Multiple keys per provider may be supported only where allowed by provider terms. Key rotation must not evade quotas or restrictions.
- Use bounded retries, timeouts, cooldowns, and actionable error messages.
- If all eligible free choices fail or quota is exhausted, pause the task and allow manual resume.

## Auto Free Mode
A toggle may automatically select an eligible free model for a function. It must:
- Consider only models with verified free eligibility at the time of use.
- Respect provider quotas, rate limits, and terms.
- Avoid models with unknown pricing.
- Never select a paid model as fallback.
- Explain when a function is paused because no eligible free model is available.

## API-key handling
- Store secrets server-side or in a protected secret store where the selected architecture supports it.
- Never embed keys in frontend bundles, client-side source, URLs, browser console output, analytics, logs, prompts, generated content, exports, backups, or version history.
- Mask keys in the UI; allow replace/delete.
- Restrict access to secrets and redact them from errors.
- Use HTTPS for network communications where applicable.
- Do not export credentials.
- Test invalid-key handling, permission boundaries, and secret redaction.
- If the chosen architecture cannot adequately protect keys, do not ship that provider integration.

## Authentication and data isolation
- Email/password and Google Sign-In are conditional on a suitable free-tier authentication service.
- Use authenticated sessions, logout, session-expiry handling, and per-user project isolation if accounts are implemented.
- Verify data handling and terms of chosen providers before release.
- Do not claim absolute privacy/security beyond the actual architecture and service terms.

## Failure behaviour
| Failure | Required response |
|---|---|
| Invalid key | Flag invalid credentials; redact secret; do not log raw key |
| Timeout | Bounded retry, then clear error/pause |
| Provider outage | Try verified eligible free fallback if configured; otherwise pause |
| Free quota exhausted | Save partial progress where feasible; pause; manual resume |
| Unknown pricing | Exclude by default |
| Provider becomes paid-only | Disable/pause that route unless user explicitly authorizes a change |
| All free models unavailable | Pause, preserve progress, show options; no paid fallback |

## Hinglish
Provider manager mein har function ke liye alag model select ho sakega. Free eligibility aur quota actual provider terms se verify honge. API keys server-side protected rahengi; key rotate karke quota bypass karna allowed nahi.
