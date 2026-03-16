# AITuber MCP Server

Create AI-powered videos from any MCP-compatible client. Generate videos with AI narration, visuals, and synced captions for YouTube Shorts, TikTok, Instagram Reels, and long-form content. Supports AI-generated images, video clips, stock footage, and viral templates like skeleton and character styles. AITuber handles script writing, voice synthesis, visual generation, and video rendering.

[AITuber](https://aituber.app) | [API Documentation](https://app.aituber.app/api-docs) | [Get API Key](https://app.aituber.app/dashboard/api-keys)

## What you can do

- **Generate videos from a prompt or script** - describe a topic and get a fully produced video, or provide exact narration text for precise control
- **Short-form and long-form** - create 15-second Shorts or 7-minute videos
- **1,300+ AI voices** - filter by gender, accent, age, or language
- **27+ visual styles** - photorealistic, anime, cinematic, 3D Pixar, watercolor, comic book, and more
- **Video templates** - skeleton X-ray style, character-driven stories
- **Multiple media types** - AI-generated images, AI video clips, or real stock footage
- **YouTube, TikTok, Instagram** - publish directly to your connected channels (coming soon to API)
- **Autopilot mode** - schedule automated video creation on a recurring basis (via dashboard)
- **Export to MP4** - render and download the final video
- **Check credits and plan** - monitor usage before generating

## Quick start

### 1. Get your API key

Go to [app.aituber.app/dashboard/settings](https://app.aituber.app/dashboard/api-keys) and create an API key.

### 2. Install

**Claude Desktop** - add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "aituber": {
      "command": "npx",
      "args": ["-y", "@aituber/mcp-server"],
      "env": {
        "AITUBER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add aituber -e AITUBER_API_KEY=your_api_key_here -- npx -y @aituber/mcp-server
```

**Cursor** - add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "aituber": {
      "command": "npx",
      "args": ["-y", "@aituber/mcp-server"],
      "env": {
        "AITUBER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Windsurf and other MCP clients** - same pattern. Point the MCP server command to `npx -y @aituber/mcp-server` and set the `AITUBER_API_KEY` environment variable in the config.

### 3. Start creating

Ask your AI assistant:

> "Create a 60-second video about 5 mind-blowing facts about the ocean"

> "List available British female voices for narration"

> "Check how many credits I have left"

> "Export my latest video to MP4 and give me the download link"

## How it works

This MCP server provides two tools:

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

### Example workflow

1. **Search** - find the right endpoint for creating a video
2. **Generate** - create the video with your script and settings
3. **Poll** - check video status until generation completes
4. **Export** - render the completed video to MP4
5. **Download** - get the MP4 download URL

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

## Supported video types

| Type | Description | How to create |
|------|-------------|---------------|
| **Faceless narration (images)** | AI images with Ken Burns animation, narration, and captions | Default. Just send a script or idea. |
| **Faceless narration (video clips)** | AI-generated video clips instead of images | Set `mediaType: "video"` |
| **Stock footage** | Real stock footage matched to narration | Set `mediaType: "stock"` |
| **Skeleton template** | Viral "what happens if..." X-ray style | Set `templateId: "skeleton"` |
| **Character template** | Character-driven story format | Set `templateId: "character"` |

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AITUBER_API_KEY` | Yes | - | Your API key from [AITuber dashboard](https://app.aituber.app/dashboard/api-keys) |
| `AITUBER_API_BASE_URL` | No | `https://app.aituber.app/api/v1` | API base URL (override for self-hosted or testing) |

## Links

- [AITuber](https://aituber.app) - AI video creation tool
- [API Documentation](https://app.aituber.app/api-docs) - Interactive API reference
- [Dashboard](https://app.aituber.app/dashboard) - Manage videos and billing
- [API Keys](https://app.aituber.app/dashboard/api-keys) - Create and manage your API keys

## License

MIT
