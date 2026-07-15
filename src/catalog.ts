// Shared, side-effect-free catalog logic used by BOTH MCP servers:
//   - the stdio server in this package (src/index.ts, npm @aituber/mcp-server)
//   - the remote OAuth server inside the main app (app/api/[transport]/route.ts)
// Keep this file free of process/env access and node-only imports.

import { GENERATED_ENDPOINTS } from "./endpoints.generated";
import type { GeneratedEndpoint } from "./endpoints.generated";
import { EXAMPLES } from "./examples";

export type Endpoint = GeneratedEndpoint & {
  example?: string | Record<string, unknown>;
  examples?: Record<string, Record<string, unknown>>;
};

export const ENDPOINTS: Endpoint[] = GENERATED_ENDPOINTS.map((ep) => ({
  ...ep,
  ...EXAMPLES[`${ep.method} ${ep.path}`],
}));

// ---------------------------------------------------------------------------
// Knowledge base (helps the search tool answer conceptual questions)
// ---------------------------------------------------------------------------

export const KNOWLEDGE: Record<string, string> = {
  "video types": `AITuber supports 5 video types, all created via POST /videos/generate:

1. **Faceless Narration (images)** - Default. AI generates unique images for each segment with smooth Ken Burns animation. The classic "faceless video" style used by top YouTube channels. Set mediaType: "images" (or omit, it's the default).

2. **Faceless Narration (video clips)** - AI generates short video clips instead of images. More dynamic, higher credit cost. Set mediaType: "video".

3. **Stock Footage** - Automatically finds and matches real stock footage to narration. Great for news, educational, documentary content. Set mediaType: "stock".

4. **Skeleton Template** - Viral "what happens if..." X-ray style videos. Uses a specialized AI model for skeleton/X-ray visuals. Set templateId: "skeleton". The template handles mediaType and style automatically.

5. **Character Template** - Character-driven story format with consistent characters throughout. Set templateId: "character". Only supports inputType: "idea" (AI writes the script). The template handles mediaType and style automatically.

All types support voice selection, captions, aspect ratio, and other common settings.`,

  "skeleton": `Skeleton videos are a viral video format where subjects are shown in X-ray/skeleton style. Created by setting templateId: "skeleton" in POST /videos/generate. The template automatically selects the right AI model and visual style. IMPORTANT: Do NOT send mediaType, imageStyleId, or imageQuality when using this template. The template handles all visual settings. Just send script + templateId. Example: { "script": "What happens if you eat 100 bananas", "templateId": "skeleton" }`,

  "character": `Character template creates story-driven videos with consistent AI characters throughout. Set templateId: "character" in POST /videos/generate. Important: character template only works with inputType: "idea" (the AI writes the script to maintain character consistency). You provide a topic, not a full script. IMPORTANT: Do NOT send mediaType, imageStyleId, or imageQuality when using this template. The template handles all visual settings. Example: { "script": "A detective solves a mystery in Tokyo", "templateId": "character", "inputType": "idea", "expectedDurationSeconds": 60 }`,

  "visual control": `By default, AITuber's AI automatically decides what visuals to show for each part of your narration. For more control, add visual instructions in brackets before each narration segment:

"[A dark forest at night] The wind howled through the trees. [Glowing eyes in the darkness] Something was watching from the shadows."

Each [bracketed text] tells the AI exactly what to show for that scene. The text after it is the voiceover. This works in script mode with any media type (images, video, stock). No special flag needed.`,

  "templates": `AITuber has 2 video templates that create specialized video formats:
- **skeleton** - X-ray/skeleton style viral videos ("what happens if..." format)
- **character** - Character-driven story videos with consistent characters

Set templateId in POST /videos/generate. Templates override mediaType and imageStyleId automatically. For regular faceless narration videos, don't set templateId.`,

  "publishing": `Publishing flow for AITuber videos:

1. **Connect a channel** via the AITuber dashboard (OAuth). Supported for publishing: YouTube, TikTok, Instagram.
2. **Generate a video** (POST /videos/generate) and wait until status is "completed".
3. **List your channels** (GET /channels) to find channel IDs.
4. **Publish** (POST /publications) with the videoId and per-channel settings.
5. **Poll status** (GET /publications/{publicationId}) until the upload reaches a stable state.

The API auto-exports the video to MP4 if not already exported. No need to call POST /exports first.

Requires an active paid subscription with the Publish feature (Creator plan or higher). Publishing is free (no credit cost).

Each platform accepts different settings:
- **YouTube:** title, tags, categoryId, madeForKids
- **TikTok:** tiktokPrivacyStatus, allowComment, allowDuet, allowStitch, isAiGenerated
- **Instagram:** instagramPlacement (reels/stories/timeline), shareToFeed

Scheduled publications can be canceled before they go live with DELETE /publications/{publicationId}.`,
};

// ---------------------------------------------------------------------------
// Search logic
// ---------------------------------------------------------------------------

export function searchKnowledge(query: string): string | null {
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
    "visual": "visual control",
    "bracket": "visual control",
    "image instruction": "visual control",
    "control": "visual control",
    "custom visual": "visual control",
    "publish": "publishing",
    "channel": "publishing",
    "channels": "publishing",
    "youtube": "publishing",
    "tiktok": "publishing",
    "instagram": "publishing",
    "social": "publishing",
    "schedule": "publishing",
    "publication": "publishing",
  };
  for (const [term, key] of Object.entries(termMap)) {
    if (lower.includes(term)) return KNOWLEDGE[key] ?? null;
  }
  return null;
}

export function searchEndpoints(query: string): Endpoint[] {
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

export function formatEndpoint(ep: Endpoint): string {
  const lines: string[] = [];
  lines.push(`## ${ep.method} ${ep.path}`);
  lines.push(`**${ep.summary}**`);
  lines.push("");
  lines.push(ep.description);
  lines.push("");
  lines.push(
    ep.auth
      ? "**Authentication:** Required (handled automatically)"
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

/** Build the search_api response text for a query. Returns null when nothing matched. */
export function buildSearchResponse(query: string): string | null {
  const knowledge = searchKnowledge(query);
  const results = searchEndpoints(query);

  const parts: string[] = [];
  if (knowledge) parts.push(knowledge);
  if (results.length > 0) {
    parts.push(results.map(formatEndpoint).join("\n\n---\n\n"));
  }
  if (parts.length === 0) return null;

  return (
    parts.join("\n\n---\n\n") + "\n\n**Full API docs:** https://aituber.app/api"
  );
}

/** One-line-per-endpoint listing, used when a search matches nothing. */
export function listAllEndpoints(): string {
  return ENDPOINTS.map((ep) => `- ${ep.method} ${ep.path}: ${ep.summary}`).join(
    "\n"
  );
}
