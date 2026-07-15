# AITuber MCP Server

Create AI-powered videos from your AI assistant. Generate videos with AI narration, visuals, and synced captions for YouTube Shorts, TikTok, Instagram Reels, and long-form content. Supports AI-generated images, video clips, stock footage, and viral templates like skeleton and character styles. AITuber handles script writing, voice synthesis, visual generation, and video rendering.

One server, one URL:

```
https://mcp.aituber.app
```

[AITuber](https://aituber.app) | [Setup Guide](https://aituber.app/mcp) | [API Documentation](https://aituber.app/api)

## Set up your client

### claude.ai and Claude Desktop

Open Settings, go to Connectors, click "Add custom connector", and paste `https://mcp.aituber.app`. A browser window opens to sign in with your AITuber account. Done.

### Claude Code

```bash
claude mcp add --transport http aituber https://mcp.aituber.app
```

Your browser opens once to sign in and approve access.

### ChatGPT

Open Settings, go to Connectors, then Advanced, and turn on Developer mode (required for custom connectors). Add a new connector with the URL `https://mcp.aituber.app` and sign in with your AITuber account.

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aituber": {
      "url": "https://mcp.aituber.app"
    }
  }
}
```

### Codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.aituber]
url = "https://mcp.aituber.app"
```

### OpenClaw and other MCP clients

Add a remote MCP server with the URL `https://mcp.aituber.app`. If your client supports OAuth, sign in when prompted. If it asks for credentials instead, use an API key (next section).

## Two ways to sign in

**1. Your AITuber login (default).** Apps like Claude, ChatGPT, and Cursor open a browser window where you sign in and approve access. No key to copy, nothing to store.

**2. An API key (servers, CI, automation).** Where a browser sign-in is not practical (a VPS, CI pipeline, n8n, cron), create a key at [app.aituber.app/dashboard/api-keys](https://app.aituber.app/dashboard/api-keys) (starts with `ak_`) and send it as a bearer token to the same URL:

```bash
claude mcp add --transport http aituber https://mcp.aituber.app \
  --header "Authorization: Bearer ak_your_key_here"
```

```json
{
  "mcpServers": {
    "aituber": {
      "url": "https://mcp.aituber.app",
      "headers": {
        "Authorization": "Bearer ak_your_key_here"
      }
    }
  }
}
```

API keys are long-lived and revocable from the dashboard, so they fit unattended automation better than OAuth tokens.

## What you can do

- **Generate videos from a prompt or script** - describe a topic and get a fully produced video, or provide exact narration text for precise control
- **Short-form and long-form** - create 15-second Shorts or 20-minute videos
- **1,300+ AI voices** - filter by gender, accent, age, or language
- **27+ visual styles** - photorealistic, anime, cinematic, 3D Pixar, watercolor, comic book, and more
- **Video templates** - skeleton X-ray style, character-driven stories
- **Multiple media types** - AI-generated images, AI video clips, or real stock footage
- **YouTube, TikTok, and Instagram** - publish directly to your connected channels
- **Export to MP4** - render and download the final video
- **Check credits and plan** - monitor usage before generating

## Start creating

Ask your AI assistant:

> "Create a 60-second video about 5 mind-blowing facts about the ocean"

> "List available British female voices for narration"

> "Check how many credits I have left"

> "Export my latest video to MP4 and give me the download link"

> "List my connected channels and publish my finished video to YouTube, TikTok, and Instagram"

## How it works

The server provides two tools:

### `search_api`

Finds the right AITuber API endpoint for your task. Describe what you want in natural language.

```
search_api("create a video about cats")
-> Returns: POST /videos/generate with all parameters and examples
```

### `execute_api`

Calls the AITuber API. Use after `search_api` to know which endpoint and parameters to use.

```
execute_api(method: "POST", path: "/videos/generate", body: {
  "script": "5 amazing facts about the deep ocean",
  "inputType": "idea",
  "expectedDurationSeconds": 60
})
-> Returns: { videoId: "abc-123", status: "pending" }
```

### Example workflows

**Generate and download MP4**

1. **Search** - find the right endpoint for creating a video
2. **Generate** - create the video with your script and settings
3. **Poll** - check video status until generation completes
4. **Export** - render the completed video to MP4
5. **Download** - get the MP4 download URL

**Generate and publish**

1. **Generate** - create the video with your script and settings
2. **Poll** - wait until the video status is `completed`
3. **List channels** - call `GET /channels` to find connected channel IDs
4. **Publish** - call `POST /publications` with the `videoId` and per-channel settings
5. **Poll publication** - call `GET /publications/{publicationId}` until it reaches `published`, `scheduled`, or `failed`

Publishing requires channels to already be connected through the AITuber dashboard and an active paid plan with the Publish feature. If the video is not exported yet, the API starts the export automatically.

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /voices` | Browse 1,300+ AI voices with filters (public, no auth required) |
| `POST /videos/generate` | Create a video from a script or idea |
| `GET /videos` | List all your videos |
| `GET /videos/{id}` | Get video details and generation status |
| `GET /subscription` | Check your plan, credits, and billing info |
| `POST /exports` | Start rendering a video to MP4 |
| `GET /exports/download` | Get a temporary download URL for the MP4 |
| `GET /channels` | List connected YouTube, TikTok, and Instagram channels |
| `POST /publications` | Publish a completed video to one or more connected channels |
| `GET /publications/{publicationId}` | Check publication status after publishing |
| `DELETE /publications/{publicationId}` | Cancel a scheduled publication before it goes live |

## Supported video types

| Type | Description | How to create |
|------|-------------|---------------|
| **Faceless narration (images)** | AI images with Ken Burns animation, narration, and captions | Default. Just send a script or idea. |
| **Faceless narration (video clips)** | AI-generated video clips instead of images | Set `mediaType: "video"` |
| **Stock footage** | Real stock footage matched to narration | Set `mediaType: "stock"` |
| **Skeleton template** | Viral "what happens if..." X-ray style | Set `templateId: "skeleton"` |
| **Character template** | Character-driven story format | Set `templateId: "character"` |

## About this repo (how the server works)

The server at `https://mcp.aituber.app` is a Cloudflare Worker (`src/remote.ts`). It is a thin, stateless proxy: it verifies your AITuber sign-in (Clerk OAuth token) or API key, exposes the `search_api` and `execute_api` tools, and forwards each call to the AITuber API with your own credential. There is no storage, no sessions, and no analytics. The endpoint catalog (`src/endpoints.generated.ts`) is generated from the API's OpenAPI definition, so the tools always match the live API.

**Local dev:**

```bash
pnpm install
# Create mcp/.dev.vars (gitignored) with:
#   CLERK_PUBLISHABLE_KEY="pk_test_..."   (dev key)
#   AITUBER_API_BASE_URL="https://app.aituber.app/api/v1"
#   CLERK_SECRET_KEY="sk_test_..."        (dev secret)
pnpm dev:remote        # runs wrangler dev
```

Quick checks against a running dev server:

```bash
curl http://localhost:8787/health                                  # {"ok":true}
curl http://localhost:8787/.well-known/oauth-protected-resource    # RFC 9728 metadata
```

**Deploy:**

```bash
# Set the production Clerk secret once (stored as a Worker secret, never committed):
pnpm exec wrangler secret put CLERK_SECRET_KEY
pnpm deploy:remote     # runs wrangler deploy
```

`CLERK_PUBLISHABLE_KEY` and `AITUBER_API_BASE_URL` live in `wrangler.toml` under `[vars]` (public). `CLERK_SECRET_KEY` is a secret. Type-check both entry points with `pnpm typecheck`.

## Links

- [AITuber](https://aituber.app) - AI video creation tool
- [Setup Guide](https://aituber.app/mcp) - Connect from any client
- [API Documentation](https://aituber.app/api) - Interactive API reference
- [Dashboard](https://app.aituber.app/dashboard) - Manage videos and billing
- [API Keys](https://app.aituber.app/dashboard/api-keys) - Create and manage your API keys

## License

MIT
