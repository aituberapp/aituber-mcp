# AITuber MCP Server

MCP server for the AITuber API. Create AI videos, check credits, export to MP4, and more from any MCP-compatible client.

## Installation

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

### Claude Code

```bash
claude mcp add aituber -- npx -y @aituber/mcp-server
```

Then set the environment variable:
```bash
export AITUBER_API_KEY=your_api_key_here
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AITUBER_API_KEY` | Yes | | Your API key from [AITuber dashboard](https://app.aituber.app/dashboard/settings) |
| `AITUBER_API_BASE_URL` | No | `https://app.aituber.app/api/v1` | API base URL (override for testing) |

## Tools

### search_api

Search the AITuber API to find the right endpoint for your task.

**Example:** "I want to create a video about space"

Returns matching endpoints with parameters, descriptions, and examples.

### execute_api

Execute a request against the AITuber API. Use `search_api` first to find the right endpoint.

**Example workflow:**

```
1. search_api("create a video")
   -> Shows POST /videos/generate with all parameters

2. execute_api(method: "POST", path: "/videos/generate", body: {
     "script": "5 amazing facts about the deep ocean",
     "inputType": "idea",
     "expectedDurationSeconds": 60
   })
   -> Returns { videoId: "abc-123", status: "pending" }

3. execute_api(method: "GET", path: "/videos/{id}", pathParams: { "id": "abc-123" })
   -> Returns video details with status

4. execute_api(method: "POST", path: "/exports", body: { "videoId": "abc-123" })
   -> Starts MP4 export

5. execute_api(method: "GET", path: "/exports/download", query: { "videoId": "abc-123" })
   -> Returns download URL
```

## API Coverage

| Endpoint | Description |
|----------|-------------|
| `GET /voices` | Browse 1,300+ AI voices (no auth required) |
| `POST /videos/generate` | Create a video from script or idea |
| `GET /videos` | List your videos |
| `GET /videos/{id}` | Get video status and details |
| `GET /subscription` | Check plan and credits |
| `POST /exports` | Export video to MP4 |
| `GET /exports/download` | Get MP4 download URL |

## Get Your API Key

1. Go to [app.aituber.app/dashboard/settings](https://app.aituber.app/dashboard/settings)
2. Create an API key
3. Add it to your MCP client config
