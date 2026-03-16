#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_KEY = process.env.AITUBER_API_KEY;
const BASE_URL =
  process.env.AITUBER_API_BASE_URL ?? "https://app.aituber.app/api/v1";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_LENGTH = 50_000;

if (!API_KEY) {
  console.error(
    "AITUBER_API_KEY is required. Get your key at https://app.aituber.app/dashboard/api-keys"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Endpoint catalog (single source of truth for the search tool)
// ---------------------------------------------------------------------------

interface EndpointParam {
  name: string;
  in: "query" | "path" | "body";
  type: string;
  required?: boolean;
  description: string;
}

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  params: EndpointParam[];
  auth: boolean;
  example?: string | Record<string, unknown>;
  examples?: Record<string, Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Knowledge base (helps the search tool answer conceptual questions)
// ---------------------------------------------------------------------------

const KNOWLEDGE: Record<string, string> = {
  "video types": `AITuber supports 5 video types, all created via POST /videos/generate:

1. **Faceless Narration (images)** - Default. AI generates unique images for each segment with smooth Ken Burns animation. The classic "faceless video" style used by top YouTube channels. Set mediaType: "images" (or omit, it's the default).

2. **Faceless Narration (video clips)** - AI generates short video clips instead of images. More dynamic, higher credit cost. Set mediaType: "video".

3. **Stock Footage** - Automatically finds and matches real stock footage to narration. Great for news, educational, documentary content. Set mediaType: "stock".

4. **Skeleton Template** - Viral "what happens if..." X-ray style videos. Uses a specialized AI model for skeleton/X-ray visuals. Set templateId: "skeleton". The template handles mediaType and style automatically.

5. **Character Template** - Character-driven story format with consistent characters throughout. Set templateId: "character". Only supports inputType: "idea" (AI writes the script). The template handles mediaType and style automatically.

All types support voice selection, captions, aspect ratio, and other common settings.`,

  "skeleton": `Skeleton videos are a viral video format where subjects are shown in X-ray/skeleton style. Created by setting templateId: "skeleton" in POST /videos/generate. The template automatically selects the right AI model and visual style. You provide a script or idea, and the template handles the rest. Example: { "script": "What happens if you eat 100 bananas", "templateId": "skeleton" }`,

  "character": `Character template creates story-driven videos with consistent AI characters throughout. Set templateId: "character" in POST /videos/generate. Important: character template only works with inputType: "idea" (the AI writes the script to maintain character consistency). You provide a topic, not a full script. Example: { "script": "A detective solves a mystery in Tokyo", "templateId": "character", "inputType": "idea", "expectedDurationSeconds": 60 }`,

  "templates": `AITuber has 2 video templates that create specialized video formats:
- **skeleton** - X-ray/skeleton style viral videos ("what happens if..." format)
- **character** - Character-driven story videos with consistent characters

Set templateId in POST /videos/generate. Templates override mediaType and imageStyleId automatically. For regular faceless narration videos, don't set templateId.`,
};

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/voices",
    summary: "List available voices",
    description:
      "Returns all available AI voices for video narration. All voices are multilingual and work across any language. Filter by gender, accent, or search by name. No authentication required.",
    params: [
      {
        name: "gender",
        in: "query",
        type: "string",
        description: "Filter by gender: male or female",
      },
      {
        name: "accent",
        in: "query",
        type: "string",
        description: "Filter by accent: American, British, Australian, etc.",
      },
      {
        name: "search",
        in: "query",
        type: "string",
        description: "Search voices by name",
      },
      {
        name: "useCase",
        in: "query",
        type: "string",
        description:
          "Filter by use case: conversational, narration, characters, etc.",
      },
    ],
    auth: false,
    example: "GET /voices?gender=female&accent=British",
  },
  {
    method: "POST",
    path: "/videos/generate",
    summary: "Create a new video",
    description:
      "Starts generating a new AI video from a script or idea. Returns a videoId to poll for status. Typical generation takes 1-3 minutes. Two modes: provide a full narration script, or provide a short topic and let AI write the script.",
    params: [
      {
        name: "script",
        in: "body",
        type: "string",
        required: true,
        description:
          "The narration text (script mode) or topic description (idea mode)",
      },
      {
        name: "inputType",
        in: "body",
        type: "string",
        description:
          'How to use the script field. "script" (default): text is spoken word-for-word. "idea": AI writes a full script from your topic.',
      },
      {
        name: "mediaType",
        in: "body",
        type: "string",
        description:
          'Visual type. "images" (default, cheapest): AI images with Ken Burns animation. "video": AI video clips. "stock": real stock footage.',
      },
      {
        name: "voiceId",
        in: "body",
        type: "string",
        description:
          "Voice ID from GET /voices. Default: Adam (deep American male).",
      },
      {
        name: "voiceSpeed",
        in: "body",
        type: "number",
        description:
          "Narration speed: 0.7 (slower) to 1.2 (faster). Default: 1.0.",
      },
      {
        name: "aspectRatio",
        in: "body",
        type: "string",
        description:
          '"9:16" (default, vertical, Shorts/TikTok/Reels), "16:9" (horizontal, YouTube), "1:1" (square, Instagram).',
      },
      {
        name: "imageQuality",
        in: "body",
        type: "string",
        description:
          'For images mediaType. "basic" (1 credit/image), "good" (3), "premium" (9), "max" (45).',
      },
      {
        name: "imageStyleId",
        in: "body",
        type: "string",
        description:
          'Visual art style: "photorealistic" (default), "cinematic", "anime", "3d-pixar", "watercolor", "comic-book", "oil-painting", "pencil-sketch", etc.',
      },
      {
        name: "expectedDurationSeconds",
        in: "body",
        type: "number",
        description:
          "Target video duration in seconds (15-420). Required when inputType is idea. E.g., 60 for 1-minute, 180 for 3-minute, 420 for 7-minute video.",
      },
      {
        name: "captionStyleId",
        in: "body",
        type: "string",
        description:
          'Caption style: "wrap-1" (default, word highlight with 2-word groups), "hormozi" (bold uppercase yellow highlight), "classic" (white text, black outline), "karaoke" (words pop in one by one), "box" (single word in solid box), "minimal" (subtle highlight), "handwritten" (handwritten font), "neon" (glowing neon text).',
      },
      {
        name: "captionsEnabled",
        in: "body",
        type: "boolean",
        description: "Show captions. Default: true. Recommended for engagement.",
      },
      {
        name: "captionPosition",
        in: "body",
        type: "string",
        description:
          'Where to position captions on the video. "bottom" (default), "center", or "top".',
      },
      {
        name: "templateId",
        in: "body",
        type: "string",
        description:
          'Specialized video template. "skeleton": viral X-ray/skeleton style ("what happens if..." format). "character": character-driven story (requires inputType "idea"). Leave empty for standard faceless narration videos. Templates override mediaType and imageStyleId automatically.',
      },
      {
        name: "videoQuality",
        in: "body",
        type: "string",
        description:
          'For video mediaType only. "basic": fastest, lower quality. "good" (default): balanced. "premium": highest quality, slower.',
      },
    ],
    auth: true,
    examples: {
      "Idea to Video (faceless)": {
        script: "5 mind-blowing facts about black holes",
        inputType: "idea",
        expectedDurationSeconds: 60,
        imageStyleId: "cinematic",
      },
      "Script to Video (video clips)": {
        script: "The ocean covers over 70 percent of Earth's surface. Beneath the waves lies a world few have ever seen.",
        mediaType: "video",
        voiceId: "CwhRBWXzGAHq8TQ4Fs17",
      },
      "Skeleton template": {
        script: "What happens if you eat 100 bananas in one day",
        templateId: "skeleton",
      },
      "Character template": {
        script: "A detective solves a mystery in a haunted mansion",
        templateId: "character",
        inputType: "idea",
        expectedDurationSeconds: 90,
      },
    },
  },
  {
    method: "GET",
    path: "/videos",
    summary: "List your videos",
    description:
      "Returns all videos sorted newest first. Each video includes generation status, title, duration, media type, and export status.",
    params: [
      {
        name: "limit",
        in: "query",
        type: "number",
        description: "Max videos to return. Default: 50, max: 100.",
      },
    ],
    auth: true,
    example: "GET /videos?limit=10",
  },
  {
    method: "GET",
    path: "/videos/{id}",
    summary: "Get a video by ID",
    description:
      "Returns video details including generation status and export status. Poll this after creating a video until status is completed or failed.",
    params: [
      {
        name: "id",
        in: "path",
        type: "string",
        required: true,
        description: "Video ID from POST /videos/generate or GET /videos.",
      },
    ],
    auth: true,
    example: "GET /videos/{id}",
  },
  {
    method: "GET",
    path: "/subscription",
    summary: "Check plan and credit balance",
    description:
      "Returns your current plan name, credit balance, monthly credit allowance, billing interval, and when credits reset. To upgrade your plan or purchase additional credits, go to https://app.aituber.app/dashboard/billing",
    params: [],
    auth: true,
    example: "GET /subscription",
  },
  {
    method: "POST",
    path: "/exports",
    summary: "Export a video to MP4",
    description:
      "Starts rendering a completed video into a downloadable MP4. Free (credits already consumed during generation). Requires a paid subscription. Poll GET /videos/{id} and check exportStatus until completed.",
    params: [
      {
        name: "videoId",
        in: "body",
        type: "string",
        required: true,
        description: 'ID of the completed video (status must be "completed").',
      },
      {
        name: "resolution",
        in: "body",
        type: "string",
        description: '"1080p" (default, Full HD) or "4k" (Ultra HD, slower).',
      },
    ],
    auth: true,
    example: { videoId: "your-video-id", resolution: "1080p" },
  },
  {
    method: "GET",
    path: "/exports/download",
    summary: "Get MP4 download URL",
    description:
      "Returns a temporary signed URL (expires in 2 minutes) to download the rendered MP4. Pass a videoId to automatically find the latest completed export.",
    params: [
      {
        name: "videoId",
        in: "query",
        type: "string",
        description:
          "Video ID. Finds the latest completed export automatically.",
      },
    ],
    auth: true,
    example: "GET /exports/download?videoId=your-video-id",
  },
];

// ---------------------------------------------------------------------------
// Search logic
// ---------------------------------------------------------------------------

function searchKnowledge(query: string): string | null {
  const lower = query.toLowerCase();
  for (const [key, value] of Object.entries(KNOWLEDGE)) {
    if (lower.includes(key)) return value;
  }
  // Check for related terms
  const termMap: Record<string, string> = {
    "skeleton": "skeleton",
    "x-ray": "skeleton",
    "xray": "skeleton",
    "character": "character",
    "story": "character",
    "template": "templates",
    "video type": "video types",
    "media type": "video types",
    "faceless": "video types",
    "stock": "video types",
  };
  for (const [term, key] of Object.entries(termMap)) {
    if (lower.includes(term)) return KNOWLEDGE[key] ?? null;
  }
  return null;
}

function searchEndpoints(query: string): Endpoint[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = ENDPOINTS.map((ep) => {
    const searchable = [
      ep.method,
      ep.path,
      ep.summary,
      ep.description,
      ...ep.params.map((p) => `${p.name} ${p.description}`),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (searchable.includes(term)) score++;
    }
    return { ep, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.ep);
}

function formatEndpoint(ep: Endpoint): string {
  const lines: string[] = [];
  lines.push(`## ${ep.method} ${ep.path}`);
  lines.push(`**${ep.summary}**`);
  lines.push("");
  lines.push(ep.description);
  lines.push("");
  lines.push(
    ep.auth
      ? "**Authentication:** Required (Bearer token)"
      : "**Authentication:** Not required"
  );
  lines.push("");

  if (ep.params.length > 0) {
    lines.push("**Parameters:**");
    for (const p of ep.params) {
      const req = p.required ? " (required)" : "";
      lines.push(
        `- \`${p.name}\` (${p.type}, ${p.in}${req}): ${p.description}`
      );
    }
    lines.push("");
  }

  if (ep.examples) {
    lines.push("**Examples:**");
    for (const [label, body] of Object.entries(ep.examples)) {
      lines.push(`\n*${label}:*`);
      lines.push("```json");
      lines.push(JSON.stringify(body, null, 2));
      lines.push("```");
    }
  } else if (ep.example) {
    lines.push("**Example:**");
    if (typeof ep.example === "string") {
      lines.push(`\`${ep.example}\``);
    } else {
      lines.push("```json");
      lines.push(JSON.stringify(ep.example, null, 2));
      lines.push("```");
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------

async function apiRequest(
  method: string,
  path: string,
  options?: {
    query?: Record<string, string>;
    body?: unknown;
    pathParams?: Record<string, string>;
  }
): Promise<{ status: number; statusText: string; body: string }> {
  let resolvedPath = path;
  if (options?.pathParams) {
    for (const [key, value] of Object.entries(options.pathParams)) {
      resolvedPath = resolvedPath.replace(
        `{${key}}`,
        encodeURIComponent(value)
      );
    }
  }

  const url = new URL(BASE_URL + resolvedPath);

  if (options?.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== "") {
        url.searchParams.set(k, v);
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (resolvedPath !== "/voices") {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const responseBody = await response.text();
  return {
    status: response.status,
    statusText: response.statusText,
    body: responseBody,
  };
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "aituber",
  version: "1.0.0",
});

// Tool 1: Search the API
server.tool(
  "search_api",
  "Search the AITuber API to find endpoints for creating AI videos, checking credits, exporting to MP4, and more. Returns matching endpoints with parameters and examples. Use this before execute_api to find the right endpoint.",
  {
    query: z
      .string()
      .describe(
        'What you want to do, e.g. "create a video", "list voices", "check credits", "download mp4", "export video"'
      ),
  },
  async ({ query }) => {
    const knowledge = searchKnowledge(query);
    const results = searchEndpoints(query);

    const parts: string[] = [];

    if (knowledge) {
      parts.push(knowledge);
    }

    if (results.length > 0) {
      const formatted = results.map(formatEndpoint).join("\n\n---\n\n");
      parts.push(formatted);
    }

    if (parts.length === 0) {
      const allEndpoints = ENDPOINTS.map(
        (ep) => `- ${ep.method} ${ep.path}: ${ep.summary}`
      ).join("\n");

      return {
        content: [
          {
            type: "text" as const,
            text: `No endpoints matched "${query}". Here are all available endpoints:\n\n${allEndpoints}\n\nTry searching with different terms.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: parts.join("\n\n---\n\n") + "\n\n**Full API docs:** https://app.aituber.app/api-docs",
        },
      ],
    };
  }
);

// Tool 2: Execute an API call
server.tool(
  "execute_api",
  "Execute a request against the AITuber API. Use search_api first to find the right endpoint and parameters. Handles authentication automatically.",
  {
    method: z
      .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
      .describe("HTTP method"),
    path: z
      .string()
      .describe(
        "API endpoint path, e.g. /videos, /videos/generate, /voices, /subscription"
      ),
    query: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        'Query parameters as key-value pairs, e.g. { "limit": "10", "gender": "female" }'
      ),
    body: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'Request body (for POST/PUT), e.g. { "script": "...", "mediaType": "images" }'
      ),
    pathParams: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        'Path parameter substitutions, e.g. { "id": "abc-123" } for /videos/{id}'
      ),
  },
  async ({ method, path, query, body, pathParams }) => {
    try {
      const result = await apiRequest(method, path, {
        query: query as Record<string, string> | undefined,
        body,
        pathParams: pathParams as Record<string, string> | undefined,
      });

      let formattedBody = result.body;
      try {
        const parsed = JSON.parse(result.body);
        formattedBody = JSON.stringify(parsed, null, 2);
      } catch {
        // Not JSON, use raw body
      }

      // Truncate very large responses to avoid overwhelming the LLM context
      if (formattedBody.length > MAX_RESPONSE_LENGTH) {
        formattedBody =
          formattedBody.substring(0, MAX_RESPONSE_LENGTH) +
          "\n\n... (response truncated. Use query filters to narrow results)";
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `${result.status} ${result.statusText}\n\n${formattedBody}`,
          },
        ],
        isError: result.status >= 400,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      const isTimeout = message.includes("abort") || message.includes("timeout");

      return {
        content: [
          {
            type: "text" as const,
            text: isTimeout
              ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. The API may be under heavy load. Try again.`
              : `Request failed: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AITuber MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
