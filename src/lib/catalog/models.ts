export type MediaCategory = "video" | "image" | "audio";
export type BadgeType = "HOT" | "NEW" | null;

export interface ToolItem {
  slug: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  category: MediaCategory;
  badge?: BadgeType;
  fromCredits: number;
  defaultModelId: string;
  previewGradient: string;
  previewImage: string;
  previewVideo?: string;
  inputType: "text" | "single-image" | "dual-frame" | "multi-reference";
}

export interface AIModelSpec {
  id: string;
  yirModelId: string;
  name: string;
  provider: string;
  category: MediaCategory;
  badge: BadgeType;
  tagline: string;
  capabilities: string[];
  supportedTools?: string[];
  baseCredits: number;
  unitLabel: string;
  maxDurationSec?: number;
  resolutions: string[];
  aspectRatios: string[];
  supportsNativeAudio?: boolean;
  speedRating: "Ultra Fast" | "Fast" | "Standard" | "Cinema Quality";
  popularInMenu?: boolean;
  previewVideo?: string;
  previewPoster?: string;
}

export interface AIEffectPreset {
  slug: string;
  name: string;
  subtitle: string;
  badge: BadgeType;
  credits: number;
  modelId: string;
  builtInPrompt: string;
  category: string;
  beforeLabel: string;
  afterLabel: string;
  gradient: string;
  previewVideo: string;
  previewPoster: string;
}

export interface VideoExampleItem {
  id: string;
  title: string;
  modelId: string;
  modelName: string;
  credits: number;
  durationSec: number;
  resolution: string;
  videoUrl: string;
  posterUrl: string;
  prompt: string;
  toolSlugs: string[];
}

export interface ImageExampleItem {
  id: string;
  title: string;
  modelId: string;
  modelName: string;
  credits: number;
  resolution: string;
  imageUrl: string;
  prompt: string;
}

// ============================================================================
// 0. Hero Background Video Pool (Randomizes on page load + manual switcher)
// ============================================================================
export const HERO_BG_VIDEOS = [
  {
    id: "hero-cyber-pagoda",
    title: "Holographic Lotus Sanctuary",
    modelId: "seedance-2.5",
    modelName: "Seedance 2.5",
    credits: 135,
    videoUrl: "/examples/seedance-2-5-train.mp4",
    posterUrl: "/examples/seedance-2-5-train.webp",
    prompt:
      "Anamorphic aerial drone orbit around a floating glass cyber-pagoda above a bioluminescent lotus lake at midnight, volumetric cyan mist, 24fps cinema grain.",
  },
  {
    id: "hero-valkyrie-aero",
    title: "Valkyrie Wind-Tunnel Telemetry",
    modelId: "kling-4.0",
    modelName: "Kling 4.0",
    credits: 226,
    videoUrl: "/examples/kling-4-chase.mp4",
    posterUrl: "/examples/kling-4-chase.webp",
    prompt:
      "Low-angle tracking shot of a matte-silver aerodynamic hypercar inside a carbon-fiber wind tunnel as luminous cyan airflow streamlines sweep over the chassis.",
  },
  {
    id: "hero-orbital-ring",
    title: "Lagrange Orbital Shipyard",
    modelId: "hailuo-2.3",
    modelName: "Hailuo 2.3",
    credits: 79,
    videoUrl: "/examples/hailuo-2-3-ballet.mp4",
    posterUrl: "/examples/hailuo-2-3-ballet.webp",
    prompt:
      "Zero-gravity cinema pan across a sunlit orbital spacecraft ring station above Earth's glowing turquoise atmospheric horizon, IMAX 70mm clarity.",
  },
  {
    id: "hero-basalt-aurora",
    title: "Obsidian Magma & Aurora",
    modelId: "wan-3.0",
    modelName: "Wan 3.0",
    credits: 58,
    videoUrl: "/examples/wan-3-forest.mp4",
    posterUrl: "/examples/wan-3-forest.webp",
    prompt:
      "Wide cinema crane shot over black hexagonal basalt cliffs in Iceland as glowing magma veins meet emerald aurora borealis reflections on wet volcanic sand.",
  },
  {
    id: "hero-acoustic-prism",
    title: "Acoustic Ferrofluid Symphony",
    modelId: "kling-2.6",
    modelName: "Kling 2.6",
    credits: 65,
    videoUrl: "/examples/kling-2-6-cat.mp4",
    posterUrl: "/examples/kling-2-6-cat.webp",
    prompt:
      "1000fps Phantom macro shot of iridescent ferrofluid sculptures levitating and rippling in mid-air to a deep sub-bass frequency under studio rim light.",
  },
];

// ============================================================================
// 1. FrameMux 1:1 Mega-Menu Tool Definitions + Extended Homepage Tools
// ============================================================================
export const TOOLS_CATALOG: ToolItem[] = [
  // Video Tools
  {
    slug: "text-to-video",
    name: "Text to video",
    shortDesc: "Turn a prompt into a cinematic clip",
    longDesc:
      "Describe camera motion, lighting, and subject action to render 4K/2K cinematic clips with synchronized native audio.",
    category: "video",
    badge: "HOT",
    fromCredits: 22,
    defaultModelId: "minimax-h3",
    previewGradient: "from-lime-500/30 via-emerald-600/20 to-zinc-950",
    previewImage: "/examples/seedance-2-night-market.webp",
    previewVideo: "/examples/seedance-2-night-market.mp4",
    inputType: "text",
  },
  {
    slug: "image-to-video",
    name: "Image to video",
    shortDesc: "Animate a photo with camera motion",
    longDesc:
      "Upload any still frame, product shot, or concept art and bring it to life with realistic physics and directed camera pans.",
    category: "video",
    fromCredits: 22,
    defaultModelId: "kling-4.0",
    previewGradient: "from-cyan-500/30 via-blue-600/20 to-zinc-950",
    previewImage: "/examples/kling-4-chase.webp",
    previewVideo: "/examples/kling-4-chase.mp4",
    inputType: "single-image",
  },
  {
    slug: "frames-to-video",
    name: "Frames to video",
    shortDesc: "Set the first and last frame, fill the middle",
    longDesc:
      "Lock your exact starting keyframe and ending keyframe; let cinema-grade video models synthesize a seamless transition.",
    category: "video",
    badge: "NEW",
    fromCredits: 29,
    defaultModelId: "seedance-2.5",
    previewGradient: "from-violet-500/30 via-fuchsia-600/20 to-zinc-950",
    previewImage: "/examples/seedance-2-5-train.webp",
    previewVideo: "/examples/seedance-2-5-train.mp4",
    inputType: "dual-frame",
  },
  {
    slug: "reference-to-video",
    name: "Reference to video",
    shortDesc: "Keep the same character across every shot",
    longDesc:
      "Upload up to 4 character, outfit, or environment reference images to maintain identity consistency across multi-shot scenes.",
    category: "video",
    badge: "HOT",
    fromCredits: 33,
    defaultModelId: "wan-3.0",
    previewGradient: "from-amber-500/30 via-orange-600/20 to-zinc-950",
    previewImage: "/examples/wan-3-robot.webp",
    previewVideo: "/examples/wan-3-robot.mp4",
    inputType: "multi-reference",
  },
  {
    slug: "motion-control",
    name: "Motion control",
    shortDesc: "Direct exact camera trajectories and subject paths",
    longDesc:
      "Combine motion brush trajectories with 6-DoF camera presets (FPV drone, dolly zoom, orbit) for studio-grade choreography.",
    category: "video",
    fromCredits: 33,
    defaultModelId: "seedance-2.5",
    previewGradient: "from-teal-500/30 via-cyan-600/20 to-zinc-950",
    previewImage: "/examples/kling-3-samurai.webp",
    previewVideo: "/examples/kling-3-samurai.mp4",
    inputType: "single-image",
  },

  // Image Tools
  {
    slug: "text-to-image",
    name: "Text to image",
    shortDesc: "Posters, key art and photos from a prompt",
    longDesc:
      "Generate photorealistic studio photography, typography-accurate posters, and cinematic keyframes with zero artifacts.",
    category: "image",
    badge: "HOT",
    fromCredits: 2,
    defaultModelId: "gpt-image-2.6",
    previewGradient: "from-pink-500/30 via-rose-600/20 to-zinc-950",
    previewImage: "/examples/gpt-image-2-6-poster.webp",
    inputType: "text",
  },
  {
    slug: "image-to-image",
    name: "Image to image",
    shortDesc: "Restyle or rebuild an image you own",
    longDesc:
      "Transform sketches, 3D greyboxes, or existing photos into new lighting setups, materials, and artistic aesthetics.",
    category: "image",
    fromCredits: 3,
    defaultModelId: "minimax-h3-image",
    previewGradient: "from-indigo-500/30 via-blue-600/20 to-zinc-950",
    previewImage: "/examples/gpt-image-2-6-sunburst-watch.webp",
    inputType: "single-image",
  },
  {
    slug: "ai-gif",
    name: "AI GIF",
    shortDesc: "Looping GIFs of characters and mascots",
    longDesc:
      "Create seamless looping stickers, brand mascots, and expressive reaction GIFs ready for Discord, Slack, and social media.",
    category: "image",
    badge: "NEW",
    fromCredits: 4,
    defaultModelId: "nano-banana-pro",
    previewGradient: "from-yellow-500/30 via-amber-600/20 to-zinc-950",
    previewImage: "/examples/gpt-image-2-6-sprite.webp",
    inputType: "text",
  },
  {
    slug: "image-to-gif",
    name: "Image to GIF",
    shortDesc: "Turn still pictures into short animations",
    longDesc:
      "Upload a static portrait or product icon and convert it into a lightweight, infinitely looping micro-animation.",
    category: "image",
    fromCredits: 6,
    defaultModelId: "flux-2-max",
    previewGradient: "from-emerald-500/30 via-green-600/20 to-zinc-950",
    previewImage: "/examples/nano-banana-2-portrait.webp",
    inputType: "single-image",
  },
  {
    slug: "ai-photo-editor",
    name: "AI photo editor",
    shortDesc: "Inpaint, upscale, and relight with natural language",
    longDesc:
      "Edit regions, swap backgrounds, upscale to 4K, or relight portraits simply by describing the change.",
    category: "image",
    fromCredits: 4,
    defaultModelId: "nano-banana-pro",
    previewGradient: "from-purple-500/30 via-violet-600/20 to-zinc-950",
    previewImage: "/examples/nano-banana-pro-food.webp",
    inputType: "multi-reference",
  },

  // Audio Tools
  {
    slug: "text-to-speech",
    name: "Text to speech",
    shortDesc: "Natural voiceovers from a script",
    longDesc:
      "Generate expressive, emotionally nuanced multilingual voiceovers and character dialogue in 32+ languages.",
    category: "audio",
    fromCredits: 5,
    defaultModelId: "elevenlabs-v3",
    previewGradient: "from-sky-500/30 via-cyan-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    inputType: "text",
  },
  {
    slug: "ai-music",
    name: "AI music",
    shortDesc: "Full songs with lyrics and arrangement",
    longDesc:
      "Compose broadcast-ready full-length tracks with vocals, custom lyrics, and studio mastering across any genre.",
    category: "audio",
    badge: "HOT",
    fromCredits: 15,
    defaultModelId: "suno-v4.5",
    previewGradient: "from-rose-500/30 via-pink-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    inputType: "text",
  },
  {
    slug: "sound-effects",
    name: "Sound effects",
    shortDesc: "Foley, ambiences and UI sounds",
    longDesc:
      "Design custom cinematic risers, footsteps, sci-fi weapons, and ambient soundscapes synchronized to your video cuts.",
    category: "audio",
    fromCredits: 4,
    defaultModelId: "elevenlabs-sfx",
    previewGradient: "from-amber-500/30 via-yellow-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    inputType: "text",
  },
];

const ALL_VIDEO_CORE_TOOLS = [
  "text-to-video",
  "image-to-video",
  "frames-to-video",
  "reference-to-video",
  "motion-control",
];

const VIDEO_NO_FRAMES_TOOLS = ["text-to-video", "image-to-video", "reference-to-video", "motion-control"];

const ALL_IMAGE_TOOLS = [
  "text-to-image",
  "image-to-image",
  "ai-gif",
  "image-to-gif",
  "ai-photo-editor",
];

// ============================================================================
// 2. Full AI Models Catalog (With Tool Compatibility & Live Video Previews)
// ============================================================================
export const MODELS_CATALOG: AIModelSpec[] = [
  // --- VIDEO MODELS ---
  {
    id: "seedance-2.5",
    yirModelId: "bytedance/seedance-2.5",
    name: "Seedance 2.5",
    provider: "ByteDance",
    category: "video",
    badge: "HOT",
    tagline: "Multi shot scenes with native audio",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "15 References", "Native Audio"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 135,
    unitLabel: "per 5s 1080p clip",
    maxDurationSec: 15,
    resolutions: ["480p", "720p", "1080p", "2K"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
    previewVideo: "/examples/seedance-2-5-train.mp4",
    previewPoster: "/examples/seedance-2-5-train.webp",
  },
  {
    id: "kling-4.0",
    yirModelId: "klingai/kling-4.0",
    name: "Kling 4.0",
    provider: "Kuaishou",
    category: "video",
    badge: null,
    tagline: "Up to 30s with keyframes and native audio",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Native Audio", "Up to 30s"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 226,
    unitLabel: "per 5s 1080p clip",
    maxDurationSec: 30,
    resolutions: ["720p", "1080p", "2K"],
    aspectRatios: ["16:9", "9:16", "1:1", "21:9"],
    supportsNativeAudio: true,
    speedRating: "Cinema Quality",
    popularInMenu: true,
    previewVideo: "/examples/kling-4-chase.mp4",
    previewPoster: "/examples/kling-4-chase.webp",
  },
  {
    id: "minimax-h3",
    yirModelId: "minimax/minimax-h3",
    name: "MiniMax H3",
    provider: "MiniMax",
    category: "video",
    badge: "HOT",
    tagline: "Up to 2K with sound, 4 to 15s",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "2K Resolution", "Native Sound"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 33,
    unitLabel: "from 4s 720p clip",
    maxDurationSec: 15,
    resolutions: ["720p", "1080p", "2K"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
    previewVideo: "/examples/minimax-h3-concert.mp4",
    previewPoster: "/examples/minimax-h3-concert.webp",
  },
  {
    id: "wan-3.0",
    yirModelId: "alibaba/wan-3.0",
    name: "Wan 3.0",
    provider: "Alibaba",
    category: "video",
    badge: "NEW",
    tagline: "Text, image and reference to video",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Multi-Reference", "Native Audio"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 58,
    unitLabel: "from 5s clip",
    maxDurationSec: 15,
    resolutions: ["480p", "720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
    previewVideo: "/examples/wan-3-forest.mp4",
    previewPoster: "/examples/wan-3-forest.webp",
  },
  {
    id: "veo-3.1",
    yirModelId: "google/veo-3.1-generate-001",
    name: "Veo 3.1",
    provider: "Google DeepMind",
    category: "video",
    badge: null,
    tagline: "Google video with dialogue and sound",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Synchronized Dialogue", "4K Physics"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 224,
    unitLabel: "per 5s 1080p clip",
    maxDurationSec: 12,
    resolutions: ["720p", "1080p", "4K"],
    aspectRatios: ["16:9", "9:16"],
    supportsNativeAudio: true,
    speedRating: "Cinema Quality",
    popularInMenu: true,
    previewVideo: "/examples/seedance-2-5-surf.mp4",
    previewPoster: "/examples/seedance-2-5-surf.webp",
  },
  {
    id: "veo-3.1-fast",
    yirModelId: "google/veo-3.1-generate-001",
    name: "Veo 3.1 Fast",
    provider: "Google DeepMind",
    category: "video",
    badge: null,
    tagline: "Low-latency Google video with synchronized audio",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Native Audio"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 49,
    unitLabel: "per 5s clip",
    maxDurationSec: 8,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16"],
    supportsNativeAudio: true,
    speedRating: "Ultra Fast",
    popularInMenu: false,
    previewVideo: "/examples/seedance-2-5-surf.mp4",
    previewPoster: "/examples/seedance-2-5-surf.webp",
  },
  {
    id: "hailuo-2.3",
    yirModelId: "minimax/hailuo-2.3",
    name: "Hailuo 2.3",
    provider: "MiniMax",
    category: "video",
    badge: null,
    tagline: "Expressive character acting and cinematic lighting",
    capabilities: ["Text to Video", "Image to Video", "Director Camera", "Character Acting"],
    supportedTools: VIDEO_NO_FRAMES_TOOLS,
    baseCredits: 79,
    unitLabel: "per 6s clip",
    maxDurationSec: 10,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Fast",
    popularInMenu: true,
    previewVideo: "/examples/hailuo-2-3-ballet.mp4",
    previewPoster: "/examples/hailuo-2-3-ballet.webp",
  },
  {
    id: "grok-imagine-video-1.5",
    yirModelId: "spacexai/grok-imagine-video",
    name: "Grok Imagine Video 1.5",
    provider: "xAI",
    category: "video",
    badge: "NEW",
    tagline: "High-motion cinematic clips with first/last frame support",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Ultra-Low Latency"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 34,
    unitLabel: "per 5s clip",
    maxDurationSec: 10,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Ultra Fast",
    popularInMenu: false,
    previewVideo: "/examples/grok-video-astronaut.mp4",
    previewPoster: "/examples/grok-video-astronaut.webp",
  },
  {
    id: "grok-imagine-video",
    yirModelId: "spacexai/grok-imagine-video",
    name: "Grok Imagine Video",
    provider: "xAI",
    category: "video",
    badge: null,
    tagline: "Fast clips from text or photo",
    capabilities: ["Text to Video", "Image to Video", "Ultra-Low Latency"],
    supportedTools: VIDEO_NO_FRAMES_TOOLS,
    baseCredits: 22,
    unitLabel: "per 4s clip",
    maxDurationSec: 8,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Ultra Fast",
    popularInMenu: true,
    previewVideo: "/examples/grok-video-street.mp4",
    previewPoster: "/examples/grok-video-street.webp",
  },
  {
    id: "kling-3.0",
    yirModelId: "klingai/kling-4.0",
    name: "Kling 3.0",
    provider: "Kuaishou",
    category: "video",
    badge: null,
    tagline: "Balanced cinema motion and keyframe control",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Motion Brush"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 118,
    unitLabel: "per 5s clip",
    maxDurationSec: 15,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: false,
    previewVideo: "/examples/kling-3-samurai.mp4",
    previewPoster: "/examples/kling-3-samurai.webp",
  },
  {
    id: "kling-2.6",
    yirModelId: "klingai/kling-4.0",
    name: "Kling 2.6",
    provider: "Kuaishou",
    category: "video",
    badge: null,
    tagline: "Cost-effective realistic motion for social clips",
    capabilities: ["Text to Video", "Image to Video", "Natural Physics"],
    supportedTools: VIDEO_NO_FRAMES_TOOLS,
    baseCredits: 65,
    unitLabel: "per 5s clip",
    maxDurationSec: 10,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Fast",
    popularInMenu: false,
    previewVideo: "/examples/kling-2-6-cat.mp4",
    previewPoster: "/examples/kling-2-6-cat.webp",
  },
  {
    id: "seedance-2.0",
    yirModelId: "bytedance/seedance-2.5",
    name: "Seedance 2.0",
    provider: "ByteDance",
    category: "video",
    badge: null,
    tagline: "Fluid camera choreography and character consistency",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Multi-Reference"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 93,
    unitLabel: "per 5s clip",
    maxDurationSec: 10,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: false,
    previewVideo: "/examples/seedance-2-night-market.mp4",
    previewPoster: "/examples/seedance-2-night-market.webp",
  },
  {
    id: "seedance-2.0-mini",
    yirModelId: "bytedance/seedance-2.5",
    name: "Seedance 2.0 Mini",
    provider: "ByteDance",
    category: "video",
    badge: null,
    tagline: "Rapid storyboarding and keyframe interpolation",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Rapid Draft"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 32,
    unitLabel: "per 5s clip",
    maxDurationSec: 10,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Ultra Fast",
    popularInMenu: false,
    previewVideo: "/examples/seedance-2-skater.mp4",
    previewPoster: "/examples/seedance-2-skater.webp",
  },
  {
    id: "flux-3-video",
    yirModelId: "bfl/flux-3-video",
    name: "FLUX 3 Video",
    provider: "Black Forest Labs",
    category: "video",
    badge: null,
    tagline: "Photorealistic texture fidelity in motion",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Photorealism"],
    supportedTools: ALL_VIDEO_CORE_TOOLS,
    baseCredits: 149,
    unitLabel: "per 5s clip",
    maxDurationSec: 10,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Standard",
    popularInMenu: true,
    previewVideo: "/examples/kling-4-fox.mp4",
    previewPoster: "/examples/kling-4-fox.webp",
  },
  {
    id: "heygen-video-1.0",
    yirModelId: "heygen/heygen-video-1",
    name: "HeyGen Video 1.0",
    provider: "HeyGen",
    category: "video",
    badge: null,
    tagline: "Lip-synced digital presenters and spokespersons",
    capabilities: ["Text to Video", "Image to Video", "Lip Sync", "40+ Languages"],
    supportedTools: ["text-to-video", "image-to-video", "reference-to-video"],
    baseCredits: 32,
    unitLabel: "per 15s avatar clip",
    maxDurationSec: 60,
    resolutions: ["1080p"],
    aspectRatios: ["16:9", "9:16"],
    supportsNativeAudio: true,
    speedRating: "Standard",
    popularInMenu: true,
    previewVideo: "/examples/kling-4-dancer.mp4",
    previewPoster: "/examples/kling-4-dancer.webp",
  },
  {
    id: "omnihuman-2.0",
    yirModelId: "bytedance/omnihuman-2.0",
    name: "OmniHuman 2.0",
    provider: "ByteDance",
    category: "video",
    badge: null,
    tagline: "Full-body human performance from a single photo + audio",
    capabilities: ["Single Photo to Performance", "Gesture Synthesis", "Singing & Speech"],
    supportedTools: ["image-to-video"],
    baseCredits: 95,
    unitLabel: "per 5s clip",
    maxDurationSec: 15,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Standard",
    popularInMenu: true,
    previewVideo: "/examples/kling-4-dancer.mp4",
    previewPoster: "/examples/kling-4-dancer.webp",
  },
  {
    id: "bytedance-upscaler",
    yirModelId: "bytedance/video-upscaler",
    name: "ByteDance Video Upscaler",
    provider: "ByteDance",
    category: "video",
    badge: null,
    tagline: "60fps frame interpolation and 4K detail restoration",
    capabilities: ["4K Upscale", "60fps Smoothing", "Denoise"],
    supportedTools: ["motion-control"],
    baseCredits: 18,
    unitLabel: "per 5s clip",
    maxDurationSec: 30,
    resolutions: ["2K", "4K"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
    previewVideo: "/examples/kling-3-city.mp4",
    previewPoster: "/examples/kling-3-city.webp",
  },
  {
    id: "topaz-proteus",
    yirModelId: "topaz/proteus",
    name: "Topaz Proteus",
    provider: "Topaz Labs",
    category: "video",
    badge: null,
    tagline: "Cinema-grade sharpening and compression artifact removal",
    capabilities: ["De-halo", "Detail Recovery", "4K Mastering"],
    supportedTools: ["motion-control"],
    baseCredits: 25,
    unitLabel: "per 5s clip",
    maxDurationSec: 30,
    resolutions: ["2K", "4K"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
    previewVideo: "/examples/hailuo-2-3-whale.mp4",
    previewPoster: "/examples/hailuo-2-3-whale.webp",
  },

  // --- IMAGE MODELS ---
  {
    id: "minimax-h3-image",
    yirModelId: "minimax/minimax-h3-image",
    name: "MiniMax H3 Image",
    provider: "MiniMax",
    category: "image",
    badge: "NEW",
    tagline: "Cinematic lighting, character consistency and 2K output",
    capabilities: ["Text to Image", "Image to Image", "Character Reference", "2K Native"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 4,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
    previewPoster: "/examples/gpt-image-2-6-sunburst-ramen.webp",
  },
  {
    id: "gpt-image-2.6",
    yirModelId: "openai/gpt-image-2.6-flare",
    name: "GPT Image 2.6",
    provider: "OpenAI",
    category: "image",
    badge: "NEW",
    tagline: "Faster OpenAI images with flawless text rendering",
    capabilities: ["Text to Image", "Image to Image", "Exact Typography", "Transparent PNG"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 3,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
    previewPoster: "/examples/gpt-image-2-6-poster.webp",
  },
  {
    id: "gpt-image-2.6-sunburst",
    yirModelId: "openai/gpt-image-2.6-flare",
    name: "GPT Image 2.6 Sunburst",
    provider: "OpenAI",
    category: "image",
    badge: null,
    tagline: "High-contrast commercial product photography and studio lighting",
    capabilities: ["Text to Image", "Product Studio", "Macro Detail"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 3,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    speedRating: "Ultra Fast",
    popularInMenu: false,
    previewPoster: "/examples/gpt-image-2-6-sunburst-watch.webp",
  },
  {
    id: "nano-banana-pro",
    yirModelId: "google/nano-banana-pro",
    name: "Nano Banana Pro",
    provider: "Google",
    category: "image",
    badge: "HOT",
    tagline: "14 references image editing and instant character lock",
    capabilities: ["Text to Image", "Up to 14 References", "In-Context Relighting", "AI Photo Editor"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 7,
    unitLabel: "per image",
    resolutions: ["1K", "2K", "4K"],
    aspectRatios: ["1:1", "16:9", "9:16", "4:3"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
    previewPoster: "/examples/nano-banana-pro-food.webp",
  },
  {
    id: "nano-banana-2.1",
    yirModelId: "google/nano-banana-pro",
    name: "Nano Banana 2.1",
    provider: "Google",
    category: "image",
    badge: "NEW",
    tagline: "Fast multi-reference character and infographic generation",
    capabilities: ["Text to Image", "Image to Image", "Infographics"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 5,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16", "4:3"],
    speedRating: "Ultra Fast",
    popularInMenu: false,
    previewPoster: "/examples/nano-banana-2-infographic.webp",
  },
  {
    id: "seedream-5.0-pro",
    yirModelId: "bytedance/seedream-5.0-pro",
    name: "Seedream 5.0 Pro",
    provider: "ByteDance",
    category: "image",
    badge: null,
    tagline: "Editorial fashion, commercial photography and poster design",
    capabilities: ["Text to Image", "Image to Image", "Bilingual Poster Text", "Studio Skin Texture"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 11,
    unitLabel: "per image",
    resolutions: ["1K", "2K", "4K"],
    aspectRatios: ["1:1", "16:9", "9:16", "3:4"],
    speedRating: "Fast",
    popularInMenu: true,
    previewPoster: "/examples/nano-banana-2-portrait.webp",
  },
  {
    id: "flux-2-max",
    yirModelId: "bfl/flux-2-max",
    name: "FLUX.2 Max",
    provider: "Black Forest Labs",
    category: "image",
    badge: null,
    tagline: "Unmatched structural realism and raw camera optics",
    capabilities: ["Text to Image", "Image to Image", "Raw Photography", "Style Transfer"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 20,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16", "21:9"],
    speedRating: "Fast",
    popularInMenu: true,
    previewPoster: "/examples/gpt-image-2-5-sneaker.webp",
  },
  {
    id: "flux-kontext-pro",
    yirModelId: "bfl/flux-2-max",
    name: "FLUX Kontext Pro",
    provider: "Black Forest Labs",
    category: "image",
    badge: null,
    tagline: "Context-aware inpainting, restyling, and object preservation",
    capabilities: ["Image to Image", "AI Photo Editor", "Object Lock"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 12,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    speedRating: "Fast",
    popularInMenu: false,
    previewPoster: "/examples/gpt-image-2-room.webp",
  },
  {
    id: "qwen-image-3.0-pro",
    yirModelId: "alibaba/qwen-image-3.0-pro",
    name: "Qwen Image 3.0 Pro",
    provider: "Alibaba",
    category: "image",
    badge: null,
    tagline: "Instruction-following layout synthesis and graphic design",
    capabilities: ["Text to Image", "Multi-line Typography", "Infographic Layout"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 10,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
    previewPoster: "/examples/gpt-image-2-5-menu.webp",
  },
  {
    id: "recraft-v3",
    yirModelId: "bfl/flux-2-max",
    name: "Recraft V3",
    provider: "Recraft",
    category: "image",
    badge: null,
    tagline: "Vector art, brand icons, sticker sheets and design mockups",
    capabilities: ["Text to Image", "Vector & Icons", "Brand Consistency"],
    supportedTools: ALL_IMAGE_TOOLS,
    baseCredits: 13,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    speedRating: "Fast",
    popularInMenu: false,
    previewPoster: "/examples/gpt-image-2-6-sprite.webp",
  },

  // --- AUDIO MODELS ---
  {
    id: "suno-v4.5",
    yirModelId: "suno/suno-v6",
    name: "Suno",
    provider: "Suno AI",
    category: "audio",
    badge: "HOT",
    tagline: "Full-length studio songs with vocals, lyrics and stems",
    capabilities: ["Full Song up to 4m", "Custom Lyrics", "Vocal & Instrumental Stems"],
    supportedTools: ["ai-music"],
    baseCredits: 15,
    unitLabel: "per full track",
    resolutions: ["44.1kHz Stereo", "48kHz WAV"],
    aspectRatios: ["2:00", "4:00"],
    speedRating: "Fast",
    popularInMenu: true,
  },
  {
    id: "elevenlabs-v3",
    yirModelId: "elevenlabs/eleven-v3",
    name: "ElevenLabs",
    provider: "ElevenLabs",
    category: "audio",
    badge: null,
    tagline: "Ultra-realistic voiceovers, emotional acting and sound effects",
    capabilities: ["32+ Languages", "Voice Cloning", "Cinematic Voiceover"],
    supportedTools: ["text-to-speech"],
    baseCredits: 5,
    unitLabel: "per 30s voiceover",
    resolutions: ["44.1kHz MP3", "48kHz PCM"],
    aspectRatios: ["15s", "30s", "60s"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
  },
  {
    id: "elevenlabs-sfx",
    yirModelId: "elevenlabs/sound-effects-v2",
    name: "ElevenLabs SFX",
    provider: "ElevenLabs",
    category: "audio",
    badge: "NEW",
    tagline: "Prompt-driven foley, risers, ambiences and game audio",
    capabilities: ["Foley", "Ambient Loops", "UI & Sci-Fi SFX"],
    supportedTools: ["sound-effects"],
    baseCredits: 4,
    unitLabel: "per sound effect",
    resolutions: ["48kHz WAV"],
    aspectRatios: ["5s", "10s", "20s"],
    speedRating: "Ultra Fast",
    popularInMenu: false,
  },
];

export function getModelsForTool(toolSlug: string, category: MediaCategory): AIModelSpec[] {
  const exact = MODELS_CATALOG.filter(
    (m) => m.category === category && (!m.supportedTools || m.supportedTools.includes(toolSlug))
  );
  return exact.length > 0
    ? exact
    : MODELS_CATALOG.filter((m) => m.category === category);
}

// ============================================================================
// 2B. Authentic Video & Image Example Galleries (Self-Hosted in /public/examples)
// ============================================================================
export const VIDEO_EXAMPLES_GALLERY: VideoExampleItem[] = [
  {
    id: "vex-1",
    title: "Cyber-Pagoda Rain Orbit",
    modelId: "seedance-2.0",
    modelName: "Seedance 2.0",
    credits: 93,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/seedance-2-night-market.mp4",
    posterUrl: "/examples/seedance-2-night-market.webp",
    prompt:
      "Holographic cyan lanterns floating around a glass cyber-pavilion during a midnight rainstorm, neon reflections rippling across wet obsidian tiles.",
    toolSlugs: ["text-to-video", "reference-to-video"],
  },
  {
    id: "vex-2",
    title: "Holographic Lotus Sanctuary",
    modelId: "seedance-2.5",
    modelName: "Seedance 2.5",
    credits: 135,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/seedance-2-5-train.mp4",
    posterUrl: "/examples/seedance-2-5-train.webp",
    prompt:
      "Anamorphic aerial drone orbit around a floating glass cyber-pagoda above a bioluminescent lotus lake at midnight, synchronized ambient synth chimes.",
    toolSlugs: ["text-to-video", "image-to-video", "frames-to-video"],
  },
  {
    id: "vex-3",
    title: "Valkyrie Wind-Tunnel Telemetry",
    modelId: "kling-4.0",
    modelName: "Kling 4.0",
    credits: 226,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/kling-4-chase.mp4",
    posterUrl: "/examples/kling-4-chase.webp",
    prompt:
      "Low-angle tracking shot of a matte-silver aerodynamic hypercar inside a dark wind tunnel as glowing cyan airflow streamlines sweep over the carbon chassis.",
    toolSlugs: ["text-to-video", "image-to-video", "frames-to-video", "motion-control"],
  },
  {
    id: "vex-4",
    title: "Lagrange Orbital Shipyard",
    modelId: "hailuo-2.3",
    modelName: "Hailuo 2.3",
    credits: 79,
    durationSec: 6,
    resolution: "1080p",
    videoUrl: "/examples/hailuo-2-3-ballet.mp4",
    posterUrl: "/examples/hailuo-2-3-ballet.webp",
    prompt:
      "Zero-gravity cinema pan across a sunlit orbital spacecraft ring above Earth's glowing turquoise terminator line, solar arrays unfolding.",
    toolSlugs: ["text-to-video", "image-to-video"],
  },
  {
    id: "vex-5",
    title: "Obsidian Magma & Aurora",
    modelId: "wan-3.0",
    modelName: "Wan 3.0",
    credits: 58,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/wan-3-forest.mp4",
    posterUrl: "/examples/wan-3-forest.webp",
    prompt:
      "Wide crane shot over black hexagonal basalt cliffs in Iceland as glowing magma veins meet emerald aurora borealis reflections.",
    toolSlugs: ["text-to-video", "image-to-video", "frames-to-video", "reference-to-video"],
  },
  {
    id: "vex-6",
    title: "Modular Synth Laser Stage",
    modelId: "minimax-h3",
    modelName: "MiniMax H3",
    credits: 33,
    durationSec: 5,
    resolution: "2K",
    videoUrl: "/examples/minimax-h3-concert.mp4",
    posterUrl: "/examples/minimax-h3-concert.webp",
    prompt:
      "Electronic musician performing on a bespoke analog modular synthesizer surrounded by volumetric emerald laser beams and atmospheric club haze.",
    toolSlugs: ["text-to-video", "image-to-video", "frames-to-video"],
  },
  {
    id: "vex-7",
    title: "Valkyrie Mech Hangar",
    modelId: "kling-3.0",
    modelName: "Kling 3.0",
    credits: 118,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/kling-3-samurai.mp4",
    posterUrl: "/examples/kling-3-samurai.webp",
    prompt:
      "Robotic gantry arms welding titanium armor plates onto an orbital exosuit inside a subterranean hangar, sparks cascading in slow motion.",
    toolSlugs: ["text-to-video", "frames-to-video", "motion-control"],
  },
  {
    id: "vex-8",
    title: "Acoustic Ferrofluid Symphony",
    modelId: "kling-2.6",
    modelName: "Kling 2.6",
    credits: 65,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/kling-2-6-cat.mp4",
    posterUrl: "/examples/kling-2-6-cat.webp",
    prompt:
      "1000fps Phantom macro shot of iridescent ferrofluid sculptures levitating and rippling in mid-air under studio strobe illumination.",
    toolSlugs: ["text-to-video", "image-to-video"],
  },
  {
    id: "vex-9",
    title: "Molecular Gastronomy Nitrogen",
    modelId: "seedance-2.0",
    modelName: "Seedance 2.0",
    credits: 93,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/seedance-2-chef.mp4",
    posterUrl: "/examples/seedance-2-chef.webp",
    prompt:
      "High-speed macro shot of liquid nitrogen vapor cascading over a crystalline sugar sphere on black slate in an avant-garde Michelin kitchen.",
    toolSlugs: ["text-to-video", "image-to-video"],
  },
  {
    id: "vex-10",
    title: "Bioluminescent Glacial Cavern",
    modelId: "kling-4.0",
    modelName: "Kling 4.0",
    credits: 226,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/kling-4-fox.mp4",
    posterUrl: "/examples/kling-4-fox.webp",
    prompt:
      " Gliding steadicam through a translucent blue ice cave in Vatnajökull illuminated by glowing sub-surface bioluminescent micro-organisms.",
    toolSlugs: ["text-to-video", "image-to-video", "reference-to-video"],
  },
  {
    id: "vex-11",
    title: "Abyssal Manta Ray Fleet",
    modelId: "hailuo-2.3",
    modelName: "Hailuo 2.3",
    credits: 79,
    durationSec: 6,
    resolution: "1080p",
    videoUrl: "/examples/hailuo-2-3-whale.mp4",
    posterUrl: "/examples/hailuo-2-3-whale.webp",
    prompt:
      "A squadron of giant oceanic manta rays gliding gracefully through sun-dappled cobalt ocean currents, volumetric caustic light rays.",
    toolSlugs: ["text-to-video", "image-to-video"],
  },
  {
    id: "vex-12",
    title: "Android Watchmaker Atelier",
    modelId: "wan-3.0",
    modelName: "Wan 3.0",
    credits: 58,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/wan-3-robot.mp4",
    posterUrl: "/examples/wan-3-robot.webp",
    prompt:
      "Porcelain-and-brass precision automaton assembling a tourbillon mechanical watch movement under a jeweler's loupe, shallow macro depth of field.",
    toolSlugs: ["text-to-video", "reference-to-video", "frames-to-video"],
  },
  {
    id: "vex-13",
    title: "Titan Methane Sea Horizon",
    modelId: "grok-imagine-video-1.5",
    modelName: "Grok Imagine Video 1.5",
    credits: 34,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/grok-video-astronaut.mp4",
    posterUrl: "/examples/grok-video-astronaut.webp",
    prompt:
      "Deep-space explorer standing on the shoreline of Titan's liquid methane sea as Saturn's golden rings arch across the amber sky.",
    toolSlugs: ["text-to-video", "frames-to-video"],
  },
  {
    id: "vex-14",
    title: "Hydrofoil Racing Yacht",
    modelId: "seedance-2.5",
    modelName: "Seedance 2.5",
    credits: 135,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/seedance-2-5-surf.mp4",
    posterUrl: "/examples/seedance-2-5-surf.webp",
    prompt:
      "Low-level chase helicopter shot of a carbon-fiber America's Cup hydrofoil yacht skimming above turquoise water at 50 knots, rooster-tail spray.",
    toolSlugs: ["text-to-video", "frames-to-video", "motion-control"],
  },
  {
    id: "vex-15",
    title: "Cyber-Grid Skybridge",
    modelId: "kling-3.0",
    modelName: "Kling 3.0",
    credits: 118,
    durationSec: 5,
    resolution: "1080p",
    videoUrl: "/examples/kling-3-city.mp4",
    posterUrl: "/examples/kling-3-city.webp",
    prompt:
      "FPV drone dive between glass skybridges connecting supertall megastructures at twilight, autonomous air-taxis banking through light trails.",
    toolSlugs: ["text-to-video", "motion-control"],
  },
  {
    id: "vex-16",
    title: "North Sea Offshore Vortex",
    modelId: "minimax-h3",
    modelName: "MiniMax H3",
    credits: 33,
    durationSec: 5,
    resolution: "2K",
    videoUrl: "/examples/minimax-h3-storm.mp4",
    posterUrl: "/examples/minimax-h3-storm.webp",
    prompt:
      "Dramatic aerial orbit around an illuminated offshore wind turbine standing firm against towering emerald North Sea storm swells at dusk.",
    toolSlugs: ["text-to-video", "image-to-video"],
  },
];

export const IMAGE_EXAMPLES_GALLERY: ImageExampleItem[] = [
  {
    id: "iex-1",
    title: "Iridescent Prism Sculpture",
    modelId: "gpt-image-2.6",
    modelName: "GPT Image 2.6",
    credits: 3,
    resolution: "2K",
    imageUrl: "/examples/gpt-image-2-6-poster.webp",
    prompt:
      "Abstract 3D dichroic glass sculpture refracting cyan and signal-lime laser beams on a matte obsidian pedestal, octane render studio key art.",
  },
  {
    id: "iex-2",
    title: "Haute-Couture Botanical Flacon",
    modelId: "gpt-image-2.6-sunburst",
    modelName: "GPT Image 2.6 Sunburst",
    credits: 3,
    resolution: "2K",
    imageUrl: "/examples/gpt-image-2-6-sunburst-watch.webp",
    prompt:
      "Luxury perfume campaign still life with sculpted crystal flacon surrounded by dew-kissed black orchids and golden caustic light rays.",
  },
  {
    id: "iex-3",
    title: "Neon Izakaya Cyber-Alley",
    modelId: "minimax-h3-image",
    modelName: "MiniMax H3 Image",
    credits: 4,
    resolution: "2K",
    imageUrl: "/examples/gpt-image-2-6-sunburst-ramen.webp",
    prompt:
      "Atmospheric architectural photography of a futuristic glass culinary pavilion glowing in twilight rain, warm tungsten interior contrasting with cyan neon.",
  },
  {
    id: "iex-4",
    title: "Nordic Fire-Roasted Platter",
    modelId: "nano-banana-pro",
    modelName: "Nano Banana Pro",
    credits: 7,
    resolution: "2K",
    imageUrl: "/examples/nano-banana-pro-food.webp",
    prompt:
      "Editorial culinary photograph of cedar-smoked wild salmon and charred botanicals on hand-thrown basalt ceramic tableware, moody daylight.",
  },
  {
    id: "iex-5",
    title: "Holographic Neural Core",
    modelId: "recraft-v3",
    modelName: "Recraft V3",
    credits: 13,
    resolution: "2K",
    imageUrl: "/examples/gpt-image-2-6-sprite.webp",
    prompt:
      "Isometric technical illustration of a quantum photonic processor core with glowing fiber-optic conduits and translucent sapphire housing.",
  },
  {
    id: "iex-6",
    title: "Aero-Weave Carbon Runner",
    modelId: "flux-2-max",
    modelName: "FLUX.2 Max",
    credits: 20,
    resolution: "2K",
    imageUrl: "/examples/gpt-image-2-5-sneaker.webp",
    prompt:
      "Commercial studio hero shot of a 3D-printed lattice running shoe suspended in zero gravity with dramatic cyan and lime rim lighting.",
  },
  {
    id: "iex-7",
    title: "Anamorphic Cinema Portrait",
    modelId: "seedream-5.0-pro",
    modelName: "Seedream 5.0 Pro",
    credits: 11,
    resolution: "4K",
    imageUrl: "/examples/nano-banana-2-portrait.webp",
    prompt:
      "65mm medium-format studio portrait with dual-tone cyan and warm amber split lighting, ultra-fine skin texture, shallow depth of field.",
  },
  {
    id: "iex-8",
    title: "Orbital Cartography Atlas",
    modelId: "nano-banana-2.1",
    modelName: "Nano Banana 2.1",
    credits: 5,
    resolution: "2K",
    imageUrl: "/examples/nano-banana-pro-map.webp",
    prompt:
      "Detailed topographic globe visualization with glowing elevation contours, maritime shipping routes, and crisp telemetry typography.",
  },
];

// ============================================================================
// 3. One-Click AI Video Effects ("One photo in, a finished clip out")
// ============================================================================
export const AI_EFFECTS_CATALOG: AIEffectPreset[] = [
  {
    slug: "360-product-spin",
    name: "360° product spin",
    subtitle: "Turn a single e-commerce photo into a studio turntable showcase",
    badge: "HOT",
    credits: 33,
    modelId: "minimax-h3",
    category: "E-Commerce",
    beforeLabel: "Single static product photo",
    afterLabel: "Smooth 360° studio rim-lit orbit video",
    builtInPrompt:
      "Smooth 360-degree motorized studio turntable rotation around the centered subject, soft rim lighting reflections, crisp commercial macro lens, 60fps.",
    gradient: "from-lime-500/25 via-emerald-500/10 to-zinc-950",
    previewVideo: "/examples/kling-3-coffee.mp4",
    previewPoster: "/examples/kling-3-coffee.webp",
  },
  {
    slug: "earth-zoom-out",
    name: "Earth zoom out",
    subtitle: "Pull back from a street portrait all the way into orbital space",
    badge: "HOT",
    credits: 58,
    modelId: "wan-3.0",
    category: "Viral Social",
    beforeLabel: "Outdoor portrait or landmark",
    afterLabel: "Continuous cosmic pullback through clouds to orbit",
    builtInPrompt:
      "Extreme continuous hyper-zoom pullback starting from close-up subject, accelerating vertically through volumetric clouds into low Earth orbit, seamless scale transition.",
    gradient: "from-cyan-500/25 via-blue-500/10 to-zinc-950",
    previewVideo: "/examples/grok-video-astronaut.mp4",
    previewPoster: "/examples/grok-video-astronaut.webp",
  },
  {
    slug: "animate-old-photos",
    name: "Animate old photos",
    subtitle: "Restore vintage family portraits with gentle breathing and smiles",
    badge: null,
    credits: 65,
    modelId: "kling-2.6",
    category: "Nostalgia",
    beforeLabel: "Vintage B&W or faded portrait",
    afterLabel: "Colorized, natural eye blink & warm smile",
    builtInPrompt:
      "Subtle lifelike portrait animation, gentle natural breathing, soft warm smile, realistic eye blink, film grain preservation, emotional shallow depth of field.",
    gradient: "from-amber-500/25 via-orange-500/10 to-zinc-950",
    previewVideo: "/examples/seedance-2-5-train.mp4",
    previewPoster: "/examples/seedance-2-5-train.webp",
  },
  {
    slug: "ai-zombie",
    name: "AI Thriller VFX",
    subtitle: "Transform any portrait into a cinematic creature or action sequence",
    badge: "NEW",
    credits: 135,
    modelId: "seedance-2.5",
    category: "VFX Character",
    beforeLabel: "Standard portrait",
    afterLabel: "Hollywood prosthetics & atmospheric fog VFX",
    builtInPrompt:
      "Cinematic practical VFX transformation with eerie bioluminescent rim light, volumetric fog, thriller camera push-in with synchronized sound design.",
    gradient: "from-rose-500/25 via-purple-500/10 to-zinc-950",
    previewVideo: "/examples/kling-3-samurai.mp4",
    previewPoster: "/examples/kling-3-samurai.webp",
  },
  {
    slug: "liquid-chrome-reveal",
    name: "Liquid chrome morph",
    subtitle: "Melt logos or sneakers into mercury metal and reform in 2K",
    badge: "NEW",
    credits: 33,
    modelId: "minimax-h3",
    category: "Brand Reveal",
    beforeLabel: "Logo or sneaker image",
    afterLabel: "Reflective liquid metal morphing sequence",
    builtInPrompt:
      "Subject dissolves into hyper-reflective liquid mercury droplets floating in zero gravity and reforms seamlessly, raytraced studio reflections, deep bass whoosh.",
    gradient: "from-indigo-500/25 via-violet-500/10 to-zinc-950",
    previewVideo: "/examples/wan-3-robot.mp4",
    previewPoster: "/examples/wan-3-robot.webp",
  },
  {
    slug: "fpv-drone-dive",
    name: "FPV canyon dive",
    subtitle: "Launch the camera from your landscape photo into an FPV flight",
    badge: null,
    credits: 22,
    modelId: "grok-imagine-video",
    category: "Camera Motion",
    beforeLabel: "Architecture or landscape photo",
    afterLabel: "High-speed acrobatic FPV drone flythrough",
    builtInPrompt:
      "High-speed FPV racing drone camera diving forward through the scene with dynamic banking turns, motion blur on edges, crisp golden hour sunlight.",
    gradient: "from-teal-500/25 via-emerald-500/10 to-zinc-950",
    previewVideo: "/examples/kling-4-chase.mp4",
    previewPoster: "/examples/kling-4-chase.webp",
  },
];

// ============================================================================
// 4. Pricing Plans (Credit Packs + Recurring Subscriptions)
// ============================================================================
export const CREDIT_PACKS = [
  {
    id: "starter-pack",
    name: "Starter",
    priceUsd: "$9.90",
    amountUsd: 9.9,
    billingNote: "once",
    credits: 990,
    perCreditCent: "1.00¢ per credit",
    highlight: false,
    estimates: [
      "990 credits, one time (never expire)",
      "1.00¢ per credit",
      "About 330 GPT Image 2.6 images or 30 MiniMax H3 clips",
      "Every video, image and audio model",
      "Commercial use of your results",
    ],
  },
  {
    id: "creator-pack",
    name: "Creator",
    priceUsd: "$29",
    amountUsd: 29,
    billingNote: "once",
    credits: 3200,
    perCreditCent: "0.91¢ per credit",
    highlight: true,
    badge: "Most Popular",
    estimates: [
      "3,200 credits, one time (never expire)",
      "0.91¢ per credit",
      "About 1,066 GPT Image 2.6 images or 96 MiniMax H3 clips",
      "Every video, image and audio model",
      "Priority high-throughput generation queue",
      "Commercial use of your results",
    ],
  },
  {
    id: "studio-pack",
    name: "Studio",
    priceUsd: "$79",
    amountUsd: 79,
    billingNote: "once",
    credits: 9500,
    perCreditCent: "0.83¢ per credit",
    highlight: false,
    estimates: [
      "9,500 credits, one time (never expire)",
      "0.83¢ per credit",
      "About 3,166 GPT Image 2.6 images or 287 MiniMax H3 clips",
      "Every video, image and audio model",
      "Private persistent cloud asset library",
      "Commercial use & API key access",
    ],
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "pro-monthly",
    name: "Pro Monthly",
    priceUsd: "$19.90",
    amountUsd: 19.9,
    period: "/month",
    creditsPerMonth: 2200,
    perCreditCent: "0.90¢ per credit",
    badge: "Flexible",
    features: [
      "2,200 fresh credits every month",
      "0.90¢ per credit",
      "Access all 73+ video, image & audio models",
      "Automatic instant refund on failed jobs",
      "Cancel anytime in one click",
    ],
  },
  {
    id: "pro-yearly",
    name: "Pro Yearly",
    priceUsd: "$199",
    amountUsd: 199,
    period: "/year",
    creditsPerMonth: 2200,
    totalYearCredits: 26400,
    perCreditCent: "0.75¢ per credit",
    badge: "Best Value · Save 17%",
    highlight: true,
    features: [
      "26,400 credits per year (2,200/mo)",
      "Lowest rate: 0.75¢ per credit",
      "Priority queue on Kling 4.0, Seedance 2.5 & Veo 3.1",
      "Watermark-free 4K/2K commercial downloads",
      "Agent API & MCP token included",
    ],
  },
];

// ============================================================================
// 5. Curated Prompt Starters & Hero Live Comparison Samples (With Real MP4 Video)
// ============================================================================
export const HERO_LIVE_SAMPLES = [
  {
    modelId: "seedance-2.5",
    modelName: "Seedance 2.5",
    badge: "HOT",
    credits: 135,
    resolution: "1080p · 5s · Native Audio",
    prompt:
      "Anamorphic aerial drone orbit around a floating glass cyber-pagoda above a bioluminescent lotus lake at midnight, synchronized ambient synth chimes.",
    metrics: { speed: "27s avg", audio: "Stereo Synth + Rain Ambience", consistency: "99.4%" },
    videoUrl: "/examples/seedance-2-5-train.mp4",
    posterUrl: "/examples/seedance-2-5-train.webp",
  },
  {
    modelId: "kling-4.0",
    modelName: "Kling 4.0",
    badge: null,
    credits: 226,
    resolution: "2K · 10s · Keyframe Lock",
    prompt:
      "Low-angle tracking shot of a matte-silver aerodynamic hypercar inside a dark wind tunnel as glowing cyan airflow streamlines sweep over the carbon chassis.",
    metrics: { speed: "38s avg", audio: "Turbine Whoosh + Sub-Bass", consistency: "99.6%" },
    videoUrl: "/examples/kling-4-chase.mp4",
    posterUrl: "/examples/kling-4-chase.webp",
  },
  {
    modelId: "hailuo-2.3",
    modelName: "Hailuo 2.3",
    badge: null,
    credits: 79,
    resolution: "1080p · 6s · Director Camera",
    prompt:
      "Zero-gravity cinema pan across a sunlit orbital spacecraft ring above Earth's glowing turquoise atmospheric horizon, IMAX 70mm look.",
    metrics: { speed: "23s avg", audio: "Orbital Telemetry Hum", consistency: "99.1%" },
    videoUrl: "/examples/hailuo-2-3-ballet.mp4",
    posterUrl: "/examples/hailuo-2-3-ballet.webp",
  },
  {
    modelId: "minimax-h3",
    modelName: "MiniMax H3",
    badge: "HOT",
    credits: 33,
    resolution: "2K · 5s · Native Sound",
    prompt:
      "Electronic musician performing on a bespoke analog modular synthesizer surrounded by volumetric emerald laser beams and atmospheric club haze.",
    metrics: { speed: "18s avg", audio: "128 BPM Analog Modular Arp", consistency: "98.9%" },
    videoUrl: "/examples/minimax-h3-concert.mp4",
    posterUrl: "/examples/minimax-h3-concert.webp",
  },
  {
    modelId: "wan-3.0",
    modelName: "Wan 3.0",
    badge: "NEW",
    credits: 58,
    resolution: "1080p · 5s · Multi-Reference",
    prompt:
      "Wide cinema crane shot over black hexagonal basalt cliffs in Iceland as glowing magma veins meet emerald aurora borealis reflections.",
    metrics: { speed: "21s avg", audio: "Volcanic Rumble + Arctic Wind", consistency: "99.2%" },
    videoUrl: "/examples/wan-3-forest.mp4",
    posterUrl: "/examples/wan-3-forest.webp",
  },
  {
    modelId: "gpt-image-2.6",
    modelName: "GPT Image 2.6",
    badge: "NEW",
    credits: 3,
    resolution: "2K · Keyframe Art",
    prompt:
      "Abstract 3D dichroic glass sculpture refracting cyan and signal-lime laser beams on a matte obsidian pedestal, octane render studio key art.",
    metrics: { speed: "3.9s avg", audio: "Still Image (2048×2048)", consistency: "100% Text" },
    posterUrl: "/examples/gpt-image-2-6-poster.webp",
  },
];

export const PROMPT_STARTERS = [
  {
    id: "starter-1",
    title: "Holographic Lotus Sanctuary",
    toolSlug: "text-to-video",
    modelId: "seedance-2.5",
    credits: 135,
    settings: "5s · 1080p · 16:9 · Native Audio",
    prompt:
      "Anamorphic aerial drone orbit around a floating glass cyber-pagoda above a bioluminescent lotus lake at midnight, synchronized ambient synth chimes.",
    previewUrl: "/examples/seedance-2-5-train.webp",
    videoUrl: "/examples/seedance-2-5-train.mp4",
  },
  {
    id: "starter-2",
    title: "Valkyrie Wind-Tunnel Telemetry",
    toolSlug: "text-to-video",
    modelId: "kling-4.0",
    credits: 226,
    settings: "5s · 1080p · 16:9 · Keyframe Lock",
    prompt:
      "Low-angle tracking shot of a matte-silver aerodynamic hypercar inside a dark wind tunnel as glowing cyan airflow streamlines sweep over the carbon chassis.",
    previewUrl: "/examples/kling-4-chase.webp",
    videoUrl: "/examples/kling-4-chase.mp4",
  },
  {
    id: "starter-3",
    title: "Modular Synth Laser Stage",
    toolSlug: "text-to-video",
    modelId: "minimax-h3",
    credits: 33,
    settings: "5s · 2K · 16:9 · Native Sound",
    prompt:
      "Electronic musician performing on a bespoke analog modular synthesizer surrounded by volumetric emerald laser beams and atmospheric club haze.",
    previewUrl: "/examples/minimax-h3-concert.webp",
    videoUrl: "/examples/minimax-h3-concert.mp4",
  },
  {
    id: "starter-4",
    title: "Obsidian Magma & Aurora",
    toolSlug: "reference-to-video",
    modelId: "wan-3.0",
    credits: 58,
    settings: "5s · 1080p · 16:9 · Reference Lock",
    prompt:
      "Wide cinema crane shot over black hexagonal basalt cliffs in Iceland as glowing magma veins meet emerald aurora borealis reflections.",
    previewUrl: "/examples/wan-3-forest.webp",
    videoUrl: "/examples/wan-3-forest.mp4",
  },
];

export const BRAND_MARQUEE_LIST = [
  "Kling 4.0",
  "Seedance 2.5",
  "Google Veo 3.1",
  "Gemini Omni",
  "MiniMax H3",
  "Hailuo 2.3",
  "Alibaba Wan 3.0",
  "Grok Imagine 1.5",
  "FLUX.2 Max",
  "HeyGen 1.0",
  "OmniHuman 2.0",
  "Topaz Proteus",
  "GPT Image 2.6",
  "Nano Banana Pro",
  "Seedream 5.0",
  "Qwen Image 3.0",
  "Recraft V3",
  "Suno v6",
  "ElevenLabs v3",
];

// Dynamic credit calculator based on model + resolution + duration + audio
export function calculateJobCredits(params: {
  modelId: string;
  resolution?: string;
  durationSec?: number;
  withAudio?: boolean;
  count?: number;
}): number {
  const model = MODELS_CATALOG.find((m) => m.id === params.modelId) ?? MODELS_CATALOG[0];
  let cost = model.baseCredits;

  if (model.category === "video") {
    const duration = params.durationSec ?? 5;
    const durationFactor = duration / 5;
    const resFactor =
      params.resolution === "4K"
        ? 1.8
        : params.resolution === "2K"
          ? 1.35
          : params.resolution === "1080p"
            ? 1.0
            : 0.7;
    const audioAddon = params.withAudio && model.supportsNativeAudio ? 8 : 0;
    cost = Math.max(10, Math.round(cost * durationFactor * resFactor + audioAddon));
  } else if (model.category === "image") {
    const resFactor = params.resolution === "4K" ? 2.0 : params.resolution === "2K" ? 1.25 : 1.0;
    cost = Math.max(2, Math.round(cost * resFactor * (params.count ?? 1)));
  }

  return cost;
}
