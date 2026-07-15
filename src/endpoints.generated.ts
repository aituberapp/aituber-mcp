// AUTO-GENERATED FILE - DO NOT EDIT.
// Regenerate with `pnpm docs:generate` in the main repo.
// Source: oRPC routers -> OpenAPI spec -> this catalog.

export interface GeneratedParam {
  name: string;
  in: "query" | "path" | "body";
  type: string;
  required?: boolean;
  description: string;
}

export interface GeneratedEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  auth: boolean;
  params: GeneratedParam[];
}

export const GENERATED_ENDPOINTS: GeneratedEndpoint[] = [
  {
    "method": "GET",
    "path": "/voices",
    "summary": "List available voices",
    "description": "Returns all available AI voices for video narration, sorted by popularity. Use the voice `id` as the `voiceId` parameter when generating a video.\n\n**No authentication required.** This is a public endpoint.\n\n**Multilingual support:** All voices are multilingual and work across any language. Set the `language` parameter when generating a video and the voice will speak naturally in that language. The `optimizedFor` field lists languages where the voice has been specifically fine-tuned for best pronunciation and natural delivery.\n\n**Filtering:** Use query parameters to narrow down voices by gender, accent, age, or use case. Combine multiple filters to find the perfect voice.\n\n**For full details and interactive testing, refer to the [API documentation](https://app.aituber.app/api-docs).**",
    "auth": false,
    "params": [
      {
        "name": "gender",
        "in": "query",
        "type": "string",
        "description": "Filter by voice gender. Values: \"male\", \"female\", \"neutral\"."
      },
      {
        "name": "accent",
        "in": "query",
        "type": "string",
        "description": "Filter by accent (case-insensitive). Examples: \"American\", \"British\", \"Australian\", \"Indian\"."
      },
      {
        "name": "age",
        "in": "query",
        "type": "string",
        "description": "Filter by age group. Values: \"young\", \"middle_aged\", \"old\"."
      },
      {
        "name": "useCase",
        "in": "query",
        "type": "string",
        "description": "Filter by recommended use case (case-insensitive). Examples: \"narration\", \"conversational\", \"news\", \"audiobook\", \"social_media\"."
      },
      {
        "name": "language",
        "in": "query",
        "type": "string",
        "description": "Filter to voices optimized for a specific language (ISO 639-1 code). Examples: \"en\", \"es\", \"fr\", \"hi\", \"zh\"."
      },
      {
        "name": "search",
        "in": "query",
        "type": "string",
        "description": "Search voices by name or description (case-insensitive). Examples: \"roger\", \"energetic\", \"calm\"."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/videos/generate",
    "summary": "Create a new video",
    "description": "Starts generating a new AI video from a script or idea. The video is created in the background and typically takes 1-3 minutes depending on length and media type.\n\n**Two ways to create a video:**\n\n**1. From a script** (you write the narration):\n```json\n{\n  \"script\": \"The human brain is the most complex organ in the body. It contains roughly 86 billion neurons, each connected to thousands of others. Every thought, memory, and emotion is the result of electrical signals racing through this incredible network.\",\n  \"voiceId\": \"nPczCjzI2devNBz1zQrb\",\n  \"imageStyleId\": \"cinematic\"\n}\n```\n\n**2. From an idea** (AI writes the script for you):\n```json\n{\n  \"script\": \"5 mind-blowing facts about black holes\",\n  \"inputType\": \"idea\",\n  \"expectedDurationSeconds\": 60\n}\n```\n\n**Workflow after calling this endpoint:**\n1. You receive a `videoId` with `status: \"pending\"`.\n2. Poll `GET /videos/{videoId}` every 5-10 seconds.\n3. When `status` changes to `completed`, the video is ready.\n4. Call `POST /exports` to render the MP4, then `GET /exports/download` to get the file.\n\n**Credit cost:** Depends on media type, duration, and quality tier. A typical 60-second video with basic quality costs ~75 credits. Check your balance with `GET /subscription` before generating.",
    "auth": true,
    "params": [
      {
        "name": "script",
        "in": "body",
        "type": "string",
        "required": true,
        "description": "The content for your video. How this field is used depends on `inputType`.\n\n**Script mode** (`inputType: \"script\"`, default): Provide the exact narration text. This is what the voice will speak word-for-word. Must be at least 5 words. Max 30,000 characters (enough for a 20-minute video at normal voice speed). The AI automatically splits it into visual segments and generates matching visuals.\n\n**Visual control:** By default, the AI decides what visuals to show for each part of your narration. For more control, add visual instructions in brackets before each narration segment:\n\n`[A dark forest at night] The wind howled through the trees. [Glowing eyes peering from shadows] Something was watching.`\n\nEach `[bracketed text]` tells the AI exactly what to show for that scene. The text after it is the voiceover.\n\n**Idea mode** (`inputType: \"idea\"`): Provide a short topic or concept. The AI writes a full narration script for you. Keep it under 800 characters. Pair with `expectedDurationSeconds` to control video length.\n\nSupports any language. The voice will speak naturally in whatever language the text is written in."
      },
      {
        "name": "inputType",
        "in": "body",
        "type": "`script` \\| `idea`",
        "required": false,
        "description": "How to interpret the `script` field.\n\n- `script` (default): Your text is the exact narration. You control every word that is spoken.\n- `idea`: You provide a topic and the AI writes an engaging narration script for you. Use `expectedDurationSeconds` to control the target length."
      },
      {
        "name": "mediaType",
        "in": "body",
        "type": "`images` \\| `video` \\| `stock`",
        "required": false,
        "description": "The type of visuals for your video. Each produces a different look and feel.\n\n- `images` (default): AI generates a unique image for each segment, displayed with smooth Ken Burns pan/zoom animation. This is the classic \"faceless narration video\" style used by top YouTube channels. Most popular and cheapest option. Control the look with `imageQuality` and `imageStyleId`.\n- `video`: AI generates short video clips for each segment. More dynamic and cinematic than images, but costs more credits. Also used internally by the `skeleton` and `character` templates.\n- `stock`: Automatically finds and matches real stock footage to each segment. Great for news, educational, and documentary-style content.\n\n**For most use cases, leave this as default (`images`) unless you are using a template.** When using `templateId`, the template automatically selects the best media type for you, so you do not need to set `mediaType` separately."
      },
      {
        "name": "voiceId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "The voice ID for narration. Browse all 1,300+ available voices and listen to previews at `GET /voices`.\n\nIf omitted, defaults to \"Adam\", a deep, natural American male voice.\n\nFilter voices by gender, accent, or use case using the `GET /voices` endpoint query parameters. Use the `previewUrl` from each voice to hear a sample before selecting."
      },
      {
        "name": "voiceSpeed",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "Narration speed multiplier. Range: 0.7 to 1.2.\n\n- `0.7`: 30% slower. Great for educational, meditation, or non-native audiences.\n- `1.0` (default): Natural speed.\n- `1.2`: 20% faster. Great for energetic, hype, or fast-paced content.\n\nMost creators use values between 0.9 and 1.1."
      },
      {
        "name": "aspectRatio",
        "in": "body",
        "type": "`9:16` \\| `16:9` \\| `1:1`",
        "required": false,
        "description": "Video dimensions. Choose based on where you plan to publish.\n\n- `9:16` (default): Vertical/portrait. Best for YouTube Shorts, TikTok, and Instagram Reels.\n- `16:9`: Horizontal/landscape. Best for standard YouTube videos and presentations.\n- `1:1`: Square. Best for Instagram feed posts and LinkedIn."
      },
      {
        "name": "expectedDurationSeconds",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "Target video duration in seconds. **Required when `inputType` is `\"idea\"`** so the AI knows how long a script to write.\n\nExamples: `30` for a 30-second Short, `60` for a 1-minute video, `180` for a 3-minute video, `600` for a 10-minute video, `1200` for a 20-minute video.\n\n**Max varies by template:**\n- Default faceless template (no `templateId`): **1200 seconds (20 minutes)**\n- `templateId: \"skeleton\"` or `templateId: \"character\"`: **420 seconds (7 minutes)** (these templates have different cost profiles and are not designed for long-form content)\n\nPassing a value above the template-specific cap returns a 400 error. Ignored when `inputType` is `\"script\"` because the duration is determined by the word count."
      },
      {
        "name": "imageQuality",
        "in": "body",
        "type": "`basic` \\| `good` \\| `premium` \\| `max`",
        "required": false,
        "description": "Image generation quality tier. Only applies when `mediaType` is `\"images\"`. Higher quality produces more detailed, accurate images but costs more credits per image.\n\n- `basic` (default): 1 credit/image. Fast generation. Good for testing and drafts.\n- `good`: 6 credits/image. Better detail and accuracy. Good for most published content.\n- `premium`: 16 credits/image. High detail, very accurate to the script. Great for professional content.\n- `max`: 30 credits/image. Maximum quality. Best for high-production content.\n\nA typical 60-second video has 15-18 images (one every 3-5 seconds), so factor that into credit calculations."
      },
      {
        "name": "imageStyleId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Visual art style for AI-generated images. Only applies when `mediaType` is `\"images\"`. Each style applies a consistent aesthetic across all images in your video.\n\n**Realistic:**\n- `photorealistic` (default): Hyperrealistic photography, DSLR quality.\n- `cinematic`: 35mm film look, dramatic lighting, movie still aesthetic.\n- `vintage-retro`: 1980s VHS aesthetic, neon colors, synthwave vibes.\n- `noir`: Classic black and white film noir, dramatic shadows.\n\n**Illustrated:**\n- `3d-pixar`: 3D Pixar-style cartoon, smooth rounded shapes.\n- `anime`: Japanese anime/manga style, cel-shaded, vibrant colors.\n- `digital-art`: Professional concept art, Artstation quality.\n- `comic-book`: American comic book, bold outlines, halftone shading.\n\n**Artistic:**\n- `pencil-sketch`: Detailed graphite pencil drawing on textured paper.\n- `oil-painting`: Classical oil painting with visible brushstrokes.\n- `watercolor`: Soft watercolor with translucent color washes.\n- `pop-art`: Andy Warhol style, bold primary colors.\n\n**Modern:**\n- `kurzgesagt`: Flat vector educational style (like the YouTube channel).\n- `pixel-art`: Retro 16-bit video game aesthetic.\n- `minimalist`: Clean, simple, lots of white space.\n- `claymation`: Stop-motion clay animation, Aardman-inspired.\n\nAnd 11 more styles. Combine with `imageStyleCustom` for fine-tuning."
      },
      {
        "name": "captionStyleId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Caption (subtitle) visual style. Captions are rendered directly onto the video with word-by-word timing sync.\n\n**Built-in styles:**\n- `wrap-1` (default): Active word highlight with 2-word groups. Most popular style.\n- `hormozi`: Bold uppercase with yellow highlight on black pill. Alex Hormozi inspired.\n- `beast`: Bold Bangers font with letter-spacing bounce animation. MrBeast inspired.\n- `noah`: Bold italic Oswald with colored highlight.\n- `handwritten`: Organic casual style with handwriting font. Personal and authentic.\n- `subtitle`: Clean streaming-style subtitles on a dark bar. Professional and readable.\n- `impact`: Massive bold text, one word at a time. Maximum emphasis.\n- `pop`: Playful spring animation with bouncy words. Fun and energetic.\n- `chronicle`: Ancient serif for history, mythology, and epic stories.\n- `cyber`: Futuristic neon style for sci-fi, tech, and cyberpunk content.\n- `grit`: Raw marker style for true crime, street, and intense stories.\n- `luxe`: Elegant serif for luxury, fashion, and celebrity content.\n- `terminal`: Monospace style for tech, hacker, and AI content.\n\nYou can also create custom caption styles with your own fonts, colors, and animations via the [AITuber dashboard](https://app.aituber.app/dashboard). Use the custom style ID here."
      },
      {
        "name": "captionsEnabled",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Whether to show captions (subtitles) on the video. Default: `true`.\n\nCaptions are auto-synced word-by-word to the narration. We strongly recommend keeping captions on as they significantly boost engagement, accessibility, and watch time. Set to `false` only for music-only or ambient videos."
      },
      {
        "name": "captionPosition",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Vertical position of captions on the video.\n\n- `bottom` (default): Captions at the bottom of the screen.\n- `center`: Captions in the middle of the screen.\n- `top`: Captions at the top of the screen."
      },
      {
        "name": "videoQuality",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Video clip generation quality. Only applies when `mediaType` is `\"video\"`.\n\n- `basic`: Fastest generation, lower visual quality.\n- `good` (default): Good balance of quality and speed.\n- `premium`: Highest quality video clips. Slower generation."
      },
      {
        "name": "templateId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Specialized video template that applies a specific visual format and style. Leave empty for standard faceless narration videos (the default).\n\n**Available templates:**\n- `skeleton`: \"What happens if...\" style educational videos with skeleton/X-ray visuals. Uses AI video generation internally. Popular viral format on YouTube Shorts. Example script: `\"What happens if you eat only ice cream for 30 days\"`.\n- `character`: Character-driven animated videos. AI generates a consistent character across all scenes and animates them. Uses AI video generation internally. Example script: `\"A robot learns what friendship means on its first day at school\"`.\n\n**Important:** When you set a template, it automatically handles `mediaType` and visual settings for you. You do not need to set `mediaType`, `imageQuality`, or `imageStyleId` separately. Just provide your `script` (or `inputType: \"idea\"` with a topic) and the template takes care of the rest."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/videos",
    "summary": "List your videos",
    "description": "Returns all videos for your organization, sorted newest first. Use this to browse your video library, check generation statuses, or find a video to export/publish.\n\n**Polling for generation status:** After calling `POST /generate`, poll this endpoint or `GET /videos/{id}` until `status` changes from `processing` to `completed` or `failed`. Typical generation takes 1-3 minutes.",
    "auth": true,
    "params": [
      {
        "name": "limit",
        "in": "query",
        "type": "number",
        "description": "Maximum number of videos to return. Default: 50, max: 100."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/videos/{id}",
    "summary": "Get a video by ID",
    "description": "Returns details for a single video. Use this to check generation status after creating a video.\n\n**Polling pattern:** After `POST /generate`, poll this endpoint every 5-10 seconds until `status` is `completed` or `failed`. Typical generation takes 1-3 minutes depending on video length and media type.",
    "auth": true,
    "params": [
      {
        "name": "id",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "The video ID returned from `POST /generate` or `GET /videos`."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/exports",
    "summary": "Export a video to MP4",
    "description": "Starts rendering a completed video into a downloadable MP4 file. The rendering runs in the background and typically takes 30 seconds to 5 minutes depending on video length.\n\n**Cost:** Free. All credits were already consumed during video generation.\n\n**Requires:** A prior paid subscription.\n\n**After exporting:**\n1. Poll `GET /videos/{id}` and check the `exportStatus` field until it is `completed`.\n2. Then call `GET /exports/download?videoId={id}` to get the download URL.",
    "auth": true,
    "params": [
      {
        "name": "videoId",
        "in": "body",
        "type": "string (uuid)",
        "required": true,
        "description": "The ID of the video to export. The video must have `status: completed`."
      },
      {
        "name": "resolution",
        "in": "body",
        "type": "`1080p` \\| `4k`",
        "required": false,
        "description": "Export resolution.\n\n- `1080p` (default): Full HD (1920x1080 or 1080x1920 for vertical). Fast rendering.\n- `4k`: Ultra HD (3840x2160 or 2160x3840 for vertical). Slower rendering, larger file."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/exports/download",
    "summary": "Get MP4 download URL",
    "description": "Returns a temporary signed URL to download the rendered MP4 file for a video. Automatically finds the latest completed export for the given video.\n\n**URL expires in 2 minutes.** Start your download immediately after receiving the URL.\n\nYou can pass either a `videoId` (recommended, finds the latest export automatically) or an `exportId` (if you need a specific export).",
    "auth": true,
    "params": [
      {
        "name": "videoId",
        "in": "query",
        "type": "string (uuid)",
        "description": "The video ID. Finds the latest completed export for this video."
      },
      {
        "name": "exportId",
        "in": "query",
        "type": "string (uuid)",
        "description": "A specific export ID, returned from `POST /exports`. Usually not needed since `videoId` automatically finds the latest export."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/channels",
    "summary": "List connected social media channels",
    "description": "Returns all connected social media channels (YouTube, TikTok, and Instagram) for your organization.\n\n**Note:** Channels must be connected via the AITuber dashboard (OAuth flow). This endpoint is read-only; use it to discover channel IDs for publishing.\n\n**After listing channels:**\nUse the channel `id` values when calling `POST /publications` to publish a video.",
    "auth": true,
    "params": [
      {
        "name": "platform",
        "in": "query",
        "type": "`youtube` \\| `tiktok` \\| `instagram` \\| `all`",
        "description": "Filter by platform. Use \"all\" or omit to list all connected channels."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/publications",
    "summary": "Publish a video to social media",
    "description": "Publishes a completed video to one or more connected social media channels (YouTube, TikTok, and Instagram).\n\n**Prerequisites:**\n1. Connect channels via the AITuber dashboard (cannot be done via API).\n2. Video must have `status: completed` (check via `GET /videos/{id}`).\n3. Active paid subscription with the Publish feature (Creator plan or higher).\n\n**How it works:**\n1. If the video has not been exported to MP4 yet, an export is automatically started.\n2. Once the MP4 is ready, it is uploaded to each selected platform.\n3. Each channel gets its own publication with independent status tracking.\n\n**After publishing:**\nPoll `GET /publications/{publicationId}` for each publication ID until it reaches a terminal state.\nImmediate publishes typically end in `published` or `failed`. Scheduled publishes may enter `scheduled` first, depending on platform behavior.\nTypical time: 2-10 minutes (longer if export is needed first).\n\n**Platform-specific settings:**\nEach entry in the `channels` array can include platform-specific metadata. Only include settings relevant to the channel's platform.\n\n**Cost:** Free. Publishing does not consume credits.",
    "auth": true,
    "params": [
      {
        "name": "videoId",
        "in": "body",
        "type": "string (uuid)",
        "required": true,
        "description": "The video to publish. Must have `status: completed`."
      },
      {
        "name": "sceneExportId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "Optional export ID if the video has already been exported. If omitted, an export is triggered automatically."
      },
      {
        "name": "caption",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Description/caption shared across all platforms. Used as YouTube description and Instagram caption. Max 2200 characters."
      },
      {
        "name": "addMadeWithCaption",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Add \"Made with AITuber, the AI video generator: aituber.app\" at the end of the caption. Default: true. The caption is shortened if needed so the total stays within 2200 characters."
      },
      {
        "name": "publishNow",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Set to `true` (default) to publish immediately. Set to `false` and provide `scheduledAt` to schedule."
      },
      {
        "name": "scheduledAt",
        "in": "body",
        "type": "datetime (ISO 8601)",
        "required": false,
        "description": "ISO 8601 datetime to schedule publication. Must be in the future. Only used when `publishNow` is `false`."
      },
      {
        "name": "channels",
        "in": "body",
        "type": "array of objects",
        "required": true,
        "description": "One or more channels to publish to. Each entry can include platform-specific settings."
      },
      {
        "name": "channels[].channelId",
        "in": "body",
        "type": "string (uuid)",
        "required": true,
        "description": "Channel ID from `GET /channels`. Must have `status: connected`."
      },
      {
        "name": "channels[].title",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Video title (YouTube). Max 100 characters. Defaults to the video title from generation."
      },
      {
        "name": "channels[].tags",
        "in": "body",
        "type": "array of string",
        "required": false,
        "description": "YouTube tags for search discovery. Max 30 tags, each up to 100 characters."
      },
      {
        "name": "channels[].categoryId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "YouTube category ID. Default: \"22\" (People & Blogs). Common: \"24\" Entertainment, \"27\" Education, \"26\" Howto & Style, \"28\" Science & Technology, \"20\" Gaming, \"10\" Music, \"17\" Sports, \"1\" Film & Animation, \"23\" Comedy."
      },
      {
        "name": "channels[].madeForKids",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "YouTube COPPA compliance flag. Default: false."
      },
      {
        "name": "channels[].tiktokPrivacyStatus",
        "in": "body",
        "type": "`public` \\| `friends` \\| `private`",
        "required": false,
        "description": "Privacy setting. Default: \"public\"."
      },
      {
        "name": "channels[].allowComment",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Allow comments. Default: true."
      },
      {
        "name": "channels[].allowDuet",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Allow duets. Default: true."
      },
      {
        "name": "channels[].allowStitch",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Allow stitches. Default: true."
      },
      {
        "name": "channels[].isAiGenerated",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Label video as AI-generated on TikTok. Default: false."
      },
      {
        "name": "channels[].instagramPlacement",
        "in": "body",
        "type": "`reels` \\| `stories` \\| `timeline`",
        "required": false,
        "description": "Instagram: where to post. Default: \"reels\"."
      },
      {
        "name": "channels[].shareToFeed",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Instagram: also share Reel to feed. Default: true."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/publications/{publicationId}",
    "summary": "Get publication status",
    "description": "Returns the current status of a publication. Poll this after `POST /publications` to track progress.\n\n**Status flow:** Immediate publishes typically move `exporting` -> `uploading` -> `published` (or `failed` at any stage).\nScheduled publishes may move into `scheduled` first, depending on platform behavior.\n\n**Polling recommendation:** Check every 10-15 seconds until the upload reaches a stable state such as `published`, `scheduled`, or `failed`.",
    "auth": true,
    "params": [
      {
        "name": "publicationId",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "Publication ID from `POST /publications`."
      }
    ]
  },
  {
    "method": "DELETE",
    "path": "/publications/{publicationId}",
    "summary": "Cancel a scheduled publication",
    "description": "Cancels a future scheduled publication before it goes live. Already live posts cannot be canceled through this endpoint.",
    "auth": true,
    "params": [
      {
        "name": "publicationId",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "Publication ID to cancel."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/subscription",
    "summary": "Get plan and credit balance",
    "description": "Returns your current plan and credit balance. Call this before generating videos to check you have enough credits.\n\nPaid plans add credits each billing cycle (monthly or yearly). Credits never expire.\n\n**Upgrading:** To upgrade your plan or purchase additional credits, go to https://app.aituber.app/dashboard/billing",
    "auth": true,
    "params": []
  }
];
