## Diagnosis (verified)

I probed the live URLs:

- `https://nbc-hrs.lovable.app/.well-known/oauth-protected-resource` → **404** (renders the app's 404 page)
- `https://nbc-hrs.lovable.app/mcp` → **500** `{"error":"Only HTML requests are supported here"}` — i.e. no MCP handler exists in the published bundle
- Same paths on the local build → **200**, returning the correct metadata:
  `{"resource":".../mcp","authorization_servers":["https://<project-ref>.supabase.co/auth/v1"],...}`

So the MCP server and its OAuth metadata are correctly implemented in the code; the **published deployment is a stale build from before agent integrations were added**. ChatGPT fetches the protected-resource metadata first, gets a 404 HTML page, and reports "does not implement OAuth".

## Fix

1. Publish the app so the current build (including `/mcp`, `/.well-known/oauth-protected-resource`, and the consent route) is live.
2. After publish, re-verify:
   - `GET /.well-known/oauth-protected-resource` returns JSON with the direct `supabase.co/auth/v1` issuer
   - `POST /mcp` without a token returns `401` with a `WWW-Authenticate` header pointing at that metadata
   - `GET /.lovable/oauth/consent?authorization_id=debug` resolves (or redirects to `/auth` preserving the URL) instead of 404
   - The Supabase authorization server's discovery document exposes a `registration_endpoint` (ChatGPT needs dynamic client registration)
3. If any of those still fail after publish, fix that specific boundary (e.g. re-run OAuth server configuration if dynamic registration is off).

No code changes are expected — this is a deployment gap, not an implementation gap.
