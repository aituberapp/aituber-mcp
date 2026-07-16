// Hand-curated examples for the endpoint catalog, keyed by "METHOD path".
// The endpoint list itself is generated (endpoints.generated.ts); these
// examples are the only hand-maintained part. Keep them minimal and avoid
// hardcoding values that go stale (voice IDs, credit costs).

export interface EndpointExamples {
  example?: string | Record<string, unknown>;
  examples?: Record<string, Record<string, unknown>>;
}

export const EXAMPLES: Record<string, EndpointExamples> = {
  "GET /voices": {
    example: "GET /voices?gender=female&accent=British",
  },
  "POST /videos/generate": {
    examples: {
      "Idea to Video (faceless)": {
        script: "5 mind-blowing facts about black holes",
        inputType: "idea",
        expectedDurationSeconds: 60,
        imageStyleId: "cinematic",
      },
      "Script to Video (video clips)": {
        script:
          "The ocean covers over 70 percent of Earth's surface. Beneath the waves lies a world few have ever seen.",
        mediaType: "video",
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
      "Script with visual control": {
        script:
          "[A dark forest at night] The wind howled through the ancient trees. [Glowing eyes peering from the shadows] Deep in the darkness, something was watching. [A figure running through moonlight] She had to escape before it was too late.",
        imageStyleId: "cinematic",
      },
    },
  },
  "GET /videos": {
    example: "GET /videos?limit=10",
  },
  "GET /videos/{id}": {
    example: "GET /videos/{id}",
  },
  "GET /subscription": {
    example: "GET /subscription",
  },
  "POST /exports": {
    example: { videoId: "your-video-id", resolution: "1080p" },
  },
  "GET /exports/download": {
    example: "GET /exports/download?videoId=your-video-id",
  },
  "GET /channels": {
    example: "GET /channels?platform=youtube",
  },
  "POST /publications": {
    examples: {
      "Publish to YouTube": {
        videoId: "your-video-id",
        caption: "Check out this video!",
        channels: [
          {
            channelId: "your-channel-id",
            title: "5 Mind-Blowing Facts",
            tags: ["facts", "science", "education"],
            categoryId: "27",
          },
        ],
      },
      "Multi-platform publish (YouTube + TikTok + Instagram)": {
        videoId: "your-video-id",
        caption: "New video just dropped!",
        channels: [
          {
            channelId: "youtube-channel-id",
            title: "My Video Title",
            categoryId: "24",
          },
          {
            channelId: "tiktok-channel-id",
            tiktokPrivacyStatus: "public",
            isAiGenerated: true,
          },
          {
            channelId: "instagram-channel-id",
            instagramPlacement: "reels",
          },
        ],
      },
      "Schedule for later": {
        videoId: "your-video-id",
        caption: "Scheduled post",
        publishNow: false,
        scheduledAt: "2030-01-01T09:00:00Z",
        channels: [{ channelId: "your-channel-id" }],
      },
    },
  },
  "GET /publications/{publicationId}": {
    example: "GET /publications/{publicationId}",
  },
  "DELETE /publications/{publicationId}": {
    example: "DELETE /publications/{publicationId}",
  },
  "POST /ideas": {
    example: {
      prompt: "space facts for a faceless YouTube Shorts channel",
      count: 10,
    },
  },
  "POST /scripts": {
    example: {
      prompt: "5 mind-blowing facts about the deep ocean",
      duration: 60,
    },
  },
  "GET /image-styles": {
    example: "GET /image-styles",
  },
  "GET /caption-styles": {
    example: "GET /caption-styles",
  },
  "GET /voices/cloned": {
    example: "GET /voices/cloned",
  },
  "DELETE /videos/{id}": {
    example: "DELETE /videos/{id}",
  },
  "GET /clip-models": {
    example: "GET /clip-models",
  },
  "POST /clips": {
    examples: {
      "Text to clip": {
        prompt: "A golden retriever puppy running through a sunflower field, cinematic slow motion",
        modelKey: "SEEDANCE_2_FAST",
        aspectRatio: "9:16",
        durationSeconds: 5,
      },
      "Animate an image": {
        prompt: "The camera slowly zooms in while snow starts falling",
        modelKey: "SEEDANCE_2_FAST",
        firstFrameUrl: "https://example.com/your-image.jpg",
        durationSeconds: 5,
      },
    },
  },
  "GET /clips": {
    example: "GET /clips?limit=10",
  },
  "GET /clips/{id}": {
    example: "GET /clips/{id}",
  },
};
