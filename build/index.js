import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const API_KEY = process.env.AITUBER_API_KEY;
const BASE_URL = process.env.AITUBER_API_BASE_URL ?? "https://app.aituber.app/api/v1";
if (!API_KEY) {
    console.error("AITUBER_API_KEY is required. Get your key at https://app.aituber.app/dashboard/settings");
    process.exit(1);
}
const ENDPOINTS = [
    {
        method: "GET",
        path: "/voices",
        summary: "List available voices",
        description: "Returns all available AI voices for video narration. All voices are multilingual and work across any language. Filter by gender, accent, or search by name. No authentication required.",
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
                description: "Filter by use case: conversational, narration, characters, etc.",
            },
        ],
        auth: false,
        example: "GET /voices?gender=female&accent=British",
    },
    {
        method: "POST",
        path: "/videos/generate",
        summary: "Create a new video",
        description: "Starts generating a new AI video from a script or idea. Returns a videoId to poll for status. Typical generation takes 1-3 minutes. Two modes: provide a full narration script, or provide a short topic and let AI write the script.",
        params: [
            {
                name: "script",
                in: "body",
                type: "string",
                required: true,
                description: "The narration text (script mode) or topic description (idea mode)",
            },
            {
                name: "inputType",
                in: "body",
                type: "string",
                description: 'How to use the script field. "script" (default): text is spoken word-for-word. "idea": AI writes a full script from your topic.',
            },
            {
                name: "mediaType",
                in: "body",
                type: "string",
                description: 'Visual type. "images" (default, cheapest): AI images with Ken Burns animation. "video": AI video clips. "stock": real stock footage.',
            },
            {
                name: "voiceId",
                in: "body",
                type: "string",
                description: "Voice ID from GET /voices. Default: Adam (deep American male).",
            },
            {
                name: "voiceSpeed",
                in: "body",
                type: "number",
                description: "Narration speed: 0.7 (slower) to 1.2 (faster). Default: 1.0.",
            },
            {
                name: "aspectRatio",
                in: "body",
                type: "string",
                description: '"9:16" (default, vertical, Shorts/TikTok/Reels), "16:9" (horizontal, YouTube), "1:1" (square, Instagram).',
            },
            {
                name: "imageQuality",
                in: "body",
                type: "string",
                description: 'For images mediaType. "basic" (1 credit/image), "good" (3), "premium" (9), "max" (45).',
            },
            {
                name: "imageStyleId",
                in: "body",
                type: "string",
                description: 'Visual art style: "photorealistic" (default), "cinematic", "anime", "3d-pixar", "watercolor", "comic-book", "oil-painting", "pencil-sketch", etc.',
            },
            {
                name: "title",
                in: "body",
                type: "string",
                description: "Custom video title (max 80 chars). Auto-generated if omitted.",
            },
            {
                name: "expectedDurationSeconds",
                in: "body",
                type: "number",
                description: "Target video duration in seconds. Required when inputType is idea. E.g., 60 for 1-minute video.",
            },
            {
                name: "captionStyleId",
                in: "body",
                type: "string",
                description: 'Caption style: "wrap-1" (default, MrBeast-style), "classic", "karaoke", "box", "minimal", "handwritten", "neon".',
            },
            {
                name: "captionsEnabled",
                in: "body",
                type: "boolean",
                description: "Show captions. Default: true. Recommended for engagement.",
            },
        ],
        auth: true,
        example: {
            script: "5 mind-blowing facts about black holes",
            inputType: "idea",
            expectedDurationSeconds: 60,
            imageStyleId: "cinematic",
        },
    },
    {
        method: "GET",
        path: "/videos",
        summary: "List your videos",
        description: "Returns all videos sorted newest first. Each video includes generation status, title, duration, media type, and export status.",
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
        description: "Returns video details including generation status and export status. Poll this after creating a video until status is completed or failed.",
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
        description: "Returns your current plan name, credit balance, monthly credit allowance, billing interval, and when credits reset.",
        params: [],
        auth: true,
        example: "GET /subscription",
    },
    {
        method: "POST",
        path: "/exports",
        summary: "Export a video to MP4",
        description: "Starts rendering a completed video into a downloadable MP4. Free (credits already consumed during generation). Requires a paid subscription. Poll GET /videos/{id} and check exportStatus until completed.",
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
        description: "Returns a temporary signed URL (expires in 2 minutes) to download the rendered MP4. Pass a videoId to automatically find the latest completed export.",
        params: [
            {
                name: "videoId",
                in: "query",
                type: "string",
                description: "Video ID. Finds the latest completed export automatically.",
            },
        ],
        auth: true,
        example: "GET /exports/download?videoId=your-video-id",
    },
];
// ---------------------------------------------------------------------------
// Search logic
// ---------------------------------------------------------------------------
function searchEndpoints(query) {
    const q = query.toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    // Score each endpoint by how many terms match
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
            if (searchable.includes(term))
                score++;
        }
        return { ep, score };
    });
    // Return endpoints that match at least one term, sorted by score
    return scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((s) => s.ep);
}
function formatEndpoint(ep) {
    const lines = [];
    lines.push(`## ${ep.method} ${ep.path}`);
    lines.push(`**${ep.summary}**`);
    lines.push("");
    lines.push(ep.description);
    lines.push("");
    if (ep.auth) {
        lines.push("**Authentication:** Required (Bearer token)");
        lines.push("");
    }
    else {
        lines.push("**Authentication:** Not required");
        lines.push("");
    }
    if (ep.params.length > 0) {
        lines.push("**Parameters:**");
        for (const p of ep.params) {
            const req = p.required ? " (required)" : "";
            lines.push(`- \`${p.name}\` (${p.type}, ${p.in}${req}): ${p.description}`);
        }
        lines.push("");
    }
    lines.push("**Example:**");
    if (typeof ep.example === "string") {
        lines.push(`\`${ep.example}\``);
    }
    else {
        lines.push("```json");
        lines.push(JSON.stringify(ep.example, null, 2));
        lines.push("```");
    }
    return lines.join("\n");
}
// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------
async function apiRequest(method, path, options) {
    // Substitute path parameters
    let resolvedPath = path;
    if (options?.pathParams) {
        for (const [key, value] of Object.entries(options.pathParams)) {
            resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(value));
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
    const headers = {
        "Content-Type": "application/json",
    };
    // Add auth for all endpoints except voices
    if (resolvedPath !== "/voices") {
        headers["Authorization"] = `Bearer ${API_KEY}`;
    }
    const response = await fetch(url.toString(), {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
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
server.tool("search_api", "Search the AITuber API to find endpoints for creating AI videos, checking credits, exporting to MP4, and more. Returns matching endpoints with parameters and examples. Use this before execute_api to find the right endpoint and understand its parameters.", {
    query: z
        .string()
        .describe('What you want to do, e.g. "create a video", "list voices", "check credits", "download mp4", "export video"'),
}, async ({ query }) => {
    const results = searchEndpoints(query);
    if (results.length === 0) {
        // Return all endpoints as a fallback
        const allEndpoints = ENDPOINTS.map((ep) => `- ${ep.method} ${ep.path}: ${ep.summary}`).join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: `No endpoints matched "${query}". Here are all available endpoints:\n\n${allEndpoints}\n\nTry searching with different terms.`,
                },
            ],
        };
    }
    const formatted = results.map(formatEndpoint).join("\n\n---\n\n");
    return {
        content: [
            {
                type: "text",
                text: `Found ${results.length} matching endpoint${results.length > 1 ? "s" : ""}:\n\n${formatted}`,
            },
        ],
    };
});
// Tool 2: Execute an API call
server.tool("execute_api", "Execute a request against the AITuber API. Use search_api first to find the right endpoint and parameters. Handles authentication automatically.", {
    method: z
        .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
        .describe("HTTP method"),
    path: z
        .string()
        .describe("API endpoint path, e.g. /videos, /videos/generate, /voices, /subscription"),
    query: z
        .record(z.string())
        .optional()
        .describe('Query parameters as key-value pairs, e.g. { "limit": "10", "gender": "female" }'),
    body: z
        .record(z.unknown())
        .optional()
        .describe('Request body (for POST/PUT), e.g. { "script": "...", "mediaType": "images" }'),
    pathParams: z
        .record(z.string())
        .optional()
        .describe('Path parameter substitutions, e.g. { "id": "abc-123" } for /videos/{id}'),
}, async ({ method, path, query, body, pathParams }) => {
    try {
        const result = await apiRequest(method, path, {
            query,
            body,
            pathParams,
        });
        // Try to pretty-print JSON responses
        let formattedBody = result.body;
        try {
            const parsed = JSON.parse(result.body);
            formattedBody = JSON.stringify(parsed, null, 2);
        }
        catch {
            // Not JSON, use raw body
        }
        const isError = result.status >= 400;
        return {
            content: [
                {
                    type: "text",
                    text: `${result.status} ${result.statusText}\n\n${formattedBody}`,
                },
            ],
            isError,
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
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
