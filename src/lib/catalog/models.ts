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
  inputType: "text" | "single-image" | "dual-frame" | "multi-reference";
}

export interface AIModelSpec {
  id: string; // e.g. "kling-4.0"
  yirModelId: string; // e.g. "kuaishou/kling-4.0"
  name: string;
  provider: string;
  category: MediaCategory;
  badge: BadgeType;
  tagline: string;
  capabilities: string[];
  baseCredits: number;
  unitLabel: string;
  maxDurationSec?: number;
  resolutions: string[];
  aspectRatios: string[];
  supportsNativeAudio?: boolean;
  speedRating: "Ultra Fast" | "Fast" | "Standard" | "Cinema Quality";
  popularInMenu?: boolean;
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
}

// ============================================================================
// 1. FrameMux 1:1 Mega-Menu Tool Definitions + Extended Homepage Tools
// ============================================================================
export const TOOLS_CATALOG: ToolItem[] = [
  // Video Tools (Mega-Menu 4 cards + extended tools)
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
    previewImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    inputType: "text",
  },
  {
    slug: "image-to-video",
    name: "Image to video",
    shortDesc: "Animate a photo with camera motion",
    longDesc:
      "Upload any still frame, product shot, or concept art and bring it to life with realistic physics and directed camera pans.",
    category: "video",
    fromCredits: 28,
    defaultModelId: "kling-4.0",
    previewGradient: "from-cyan-500/30 via-blue-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
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
    fromCredits: 35,
    defaultModelId: "kling-4.0",
    previewGradient: "from-violet-500/30 via-fuchsia-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
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
    fromCredits: 45,
    defaultModelId: "wan-3.0",
    previewGradient: "from-amber-500/30 via-orange-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    inputType: "multi-reference",
  },
  {
    slug: "motion-control",
    name: "Motion control",
    shortDesc: "Direct exact camera trajectories and subject paths",
    longDesc:
      "Combine motion brush trajectories with 6-DoF camera presets (FPV drone, dolly zoom, orbit) for studio-grade choreography.",
    category: "video",
    fromCredits: 40,
    defaultModelId: "seedance-2.5",
    previewGradient: "from-teal-500/30 via-cyan-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    inputType: "single-image",
  },

  // Image Tools (Mega-Menu 4 cards + extended tools)
  {
    slug: "text-to-image",
    name: "Text to image",
    shortDesc: "Posters, key art and photos from a prompt",
    longDesc:
      "Generate photorealistic studio photography, typography-accurate posters, and cinematic keyframes with zero artifacts.",
    category: "image",
    badge: "HOT",
    fromCredits: 3,
    defaultModelId: "gpt-image-2.6",
    previewGradient: "from-pink-500/30 via-rose-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    inputType: "text",
  },
  {
    slug: "image-to-image",
    name: "Image to image",
    shortDesc: "Restyle or rebuild an image you own",
    longDesc:
      "Transform sketches, 3D greyboxes, or existing photos into new lighting setups, materials, and artistic aesthetics.",
    category: "image",
    fromCredits: 4,
    defaultModelId: "minimax-h3-image",
    previewGradient: "from-indigo-500/30 via-blue-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
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
    fromCredits: 8,
    defaultModelId: "nano-banana-pro",
    previewGradient: "from-yellow-500/30 via-amber-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    inputType: "text",
  },
  {
    slug: "image-to-gif",
    name: "Image to GIF",
    shortDesc: "Turn still pictures into short animations",
    longDesc:
      "Upload a static portrait or product icon and convert it into a lightweight, infinitely looping micro-animation.",
    category: "image",
    fromCredits: 10,
    defaultModelId: "flux-2-max",
    previewGradient: "from-emerald-500/30 via-green-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    inputType: "single-image",
  },
  {
    slug: "ai-photo-editor",
    name: "AI photo editor",
    shortDesc: "Inpaint, upscale, and relight with natural language",
    longDesc:
      "Edit regions, swap backgrounds, upscale to 4K, or relight portraits simply by describing the change.",
    category: "image",
    fromCredits: 5,
    defaultModelId: "nano-banana-pro",
    previewGradient: "from-purple-500/30 via-violet-600/20 to-zinc-950",
    previewImage:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
    inputType: "multi-reference",
  },

  // Audio Tools (Mega-Menu 3 cards)
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

// ============================================================================
// 2. AI Models Catalog (Mapped to Yir.ai Model Router IDs)
// ============================================================================
export const MODELS_CATALOG: AIModelSpec[] = [
  // Video Models (Matching FrameMux Mega-Menu right column + featured pricing)
  {
    id: "kling-4.0",
    yirModelId: "klingai/kling-4.0",
    name: "Kling 4.0",
    provider: "Kuaishou",
    category: "video",
    badge: null,
    tagline: "Up to 30s with keyframes and native audio",
    capabilities: ["Text to Video", "Image to Video", "First/Last Frame", "Native Audio", "Up to 30s"],
    baseCredits: 226,
    unitLabel: "per 5s 1080p clip",
    maxDurationSec: 30,
    resolutions: ["720p", "1080p", "2K"],
    aspectRatios: ["16:9", "9:16", "1:1", "21:9"],
    supportsNativeAudio: true,
    speedRating: "Cinema Quality",
    popularInMenu: true,
  },
  {
    id: "seedance-2.5",
    yirModelId: "bytedance/seedance-2.5",
    name: "Seedance 2.5",
    provider: "ByteDance",
    category: "video",
    badge: "HOT",
    tagline: "Multi shot scenes with native audio",
    capabilities: ["Multi-Shot Director", "Native Audio", "15 References", "Motion Control"],
    baseCredits: 135,
    unitLabel: "per 5s 1080p clip",
    maxDurationSec: 15,
    resolutions: ["480p", "720p", "1080p", "2K"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
  },
  {
    id: "veo-3.1",
    yirModelId: "google/veo-3.1-generate-001",
    name: "Veo 3.1",
    provider: "Google DeepMind",
    category: "video",
    badge: null,
    tagline: "Google video with dialogue and sound",
    capabilities: ["Synchronized Dialogue", "Foley Sound", "4K Physics", "Camera Control"],
    baseCredits: 224,
    unitLabel: "per 5s 1080p clip",
    maxDurationSec: 12,
    resolutions: ["720p", "1080p", "4K"],
    aspectRatios: ["16:9", "9:16"],
    supportsNativeAudio: true,
    speedRating: "Cinema Quality",
    popularInMenu: true,
  },
  {
    id: "minimax-h3",
    yirModelId: "minimax/minimax-h3",
    name: "MiniMax H3",
    provider: "MiniMax",
    category: "video",
    badge: "HOT",
    tagline: "Up to 2K with sound, 4 to 15s",
    capabilities: ["2K Resolution", "Native Sound", "Subject Reference", "4s–15s Clips"],
    baseCredits: 33,
    unitLabel: "from 4s 720p clip",
    maxDurationSec: 15,
    resolutions: ["720p", "1080p", "2K"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
  },
  {
    id: "hailuo-2.3",
    yirModelId: "minimax/hailuo-2.3",
    name: "Hailuo 2.3",
    provider: "MiniMax",
    category: "video",
    badge: null,
    tagline: "Expressive character acting and cinematic lighting",
    capabilities: ["Director Camera", "Character Acting", "Image to Video"],
    baseCredits: 42,
    unitLabel: "per 6s clip",
    maxDurationSec: 10,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Fast",
    popularInMenu: true,
  },
  {
    id: "wan-3.0",
    yirModelId: "alibaba/wan-3.0",
    name: "Wan 3.0",
    provider: "Alibaba",
    category: "video",
    badge: "NEW",
    tagline: "Text, image and reference to video",
    capabilities: ["Multi-Reference", "First/Last Frame", "Bilingual Typography", "Native Audio"],
    baseCredits: 58,
    unitLabel: "from 5s clip",
    maxDurationSec: 15,
    resolutions: ["480p", "720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
  },
  {
    id: "grok-imagine-video",
    yirModelId: "spacexai/grok-imagine-video",
    name: "Grok Imagine Video",
    provider: "xAI",
    category: "video",
    badge: null,
    tagline: "Fast clips from text or photo",
    capabilities: ["Ultra-Low Latency", "Text to Video", "Image to Video"],
    baseCredits: 22,
    unitLabel: "per 4s clip",
    maxDurationSec: 8,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Ultra Fast",
    popularInMenu: true,
  },
  {
    id: "flux-3-video",
    yirModelId: "bfl/flux-3-video",
    name: "FLUX 3 Video",
    provider: "Black Forest Labs",
    category: "video",
    badge: null,
    tagline: "Photorealistic texture fidelity in motion",
    capabilities: ["Photorealism", "Prompt Adherence", "Keyframe Lock"],
    baseCredits: 64,
    unitLabel: "per 5s clip",
    maxDurationSec: 10,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: false,
    speedRating: "Standard",
    popularInMenu: true,
  },
  {
    id: "heygen-video-1.0",
    yirModelId: "heygen/heygen-video-1",
    name: "HeyGen Video 1.0",
    provider: "HeyGen",
    category: "video",
    badge: null,
    tagline: "Lip-synced digital presenters and spokespersons",
    capabilities: ["Lip Sync", "Avatar Cloning", "40+ Languages"],
    baseCredits: 85,
    unitLabel: "per 15s avatar clip",
    maxDurationSec: 60,
    resolutions: ["1080p"],
    aspectRatios: ["16:9", "9:16"],
    supportsNativeAudio: true,
    speedRating: "Standard",
    popularInMenu: true,
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
    baseCredits: 95,
    unitLabel: "per 5s clip",
    maxDurationSec: 15,
    resolutions: ["720p", "1080p"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Standard",
    popularInMenu: true,
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
    baseCredits: 18,
    unitLabel: "per 5s clip",
    maxDurationSec: 30,
    resolutions: ["2K", "4K"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
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
    baseCredits: 25,
    unitLabel: "per 5s clip",
    maxDurationSec: 30,
    resolutions: ["2K", "4K"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsNativeAudio: true,
    speedRating: "Fast",
    popularInMenu: true,
  },

  // Image Models (Matching FrameMux Mega-Menu right column)
  {
    id: "minimax-h3-image",
    yirModelId: "minimax/minimax-h3-image",
    name: "MiniMax H3 Image",
    provider: "MiniMax",
    category: "image",
    badge: "NEW",
    tagline: "Cinematic lighting, character consistency and 2K output",
    capabilities: ["Text to Image", "Character Reference", "2K Native"],
    baseCredits: 4,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
  },
  {
    id: "gpt-image-2.6",
    yirModelId: "openai/gpt-image-2.6-flare",
    name: "GPT Image 2.6",
    provider: "OpenAI",
    category: "image",
    badge: "NEW",
    tagline: "Faster OpenAI images with flawless text rendering",
    capabilities: ["Exact Typography", "Multi-Turn Editing", "Transparent PNG"],
    baseCredits: 3,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
  },
  {
    id: "nano-banana-pro",
    yirModelId: "google/nano-banana-pro",
    name: "Nano Banana Pro",
    provider: "Google",
    category: "image",
    badge: "HOT",
    tagline: "14 references image editing and instant character lock",
    capabilities: ["Up to 14 References", "In-Context Relighting", "Product Placement"],
    baseCredits: 7,
    unitLabel: "per image",
    resolutions: ["1K", "2K", "4K"],
    aspectRatios: ["1:1", "16:9", "9:16", "4:3"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
  },
  {
    id: "seedream-5.0-pro",
    yirModelId: "bytedance/seedream-5.0-pro",
    name: "Seedream 5.0 Pro",
    provider: "ByteDance",
    category: "image",
    badge: null,
    tagline: "Editorial fashion, commercial photography and poster design",
    capabilities: ["Bilingual Poster Text", "Studio Skin Texture", "High Aesthetic Score"],
    baseCredits: 5,
    unitLabel: "per image",
    resolutions: ["1K", "2K", "4K"],
    aspectRatios: ["1:1", "16:9", "9:16", "3:4"],
    speedRating: "Fast",
    popularInMenu: true,
  },
  {
    id: "flux-2-max",
    yirModelId: "bfl/flux-2-max",
    name: "FLUX.2 Max",
    provider: "Black Forest Labs",
    category: "image",
    badge: null,
    tagline: "Unmatched structural realism and raw camera optics",
    capabilities: ["Raw Photography", "Complex Composition", "Style Transfer"],
    baseCredits: 6,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16", "21:9"],
    speedRating: "Fast",
    popularInMenu: true,
  },
  {
    id: "qwen-image-3.0-pro",
    yirModelId: "alibaba/qwen-image-3.0-pro",
    name: "Qwen Image 3.0 Pro",
    provider: "Alibaba",
    category: "image",
    badge: null,
    tagline: "Instruction-following layout synthesis and graphic design",
    capabilities: ["Multi-line Typography", "Infographic Layout", "Image Editing"],
    baseCredits: 4,
    unitLabel: "per image",
    resolutions: ["1K", "2K"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    speedRating: "Ultra Fast",
    popularInMenu: true,
  },

  // Audio Models (Matching FrameMux Mega-Menu right column)
  {
    id: "suno-v4.5",
    yirModelId: "suno/suno-v6",
    name: "Suno",
    provider: "Suno AI",
    category: "audio",
    badge: "HOT",
    tagline: "Full-length studio songs with vocals, lyrics and stems",
    capabilities: ["Full Song up to 4m", "Custom Lyrics", "Vocal & Instrumental Stems"],
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
    capabilities: ["32+ Languages", "Voice Cloning", "Cinematic Foley SFX"],
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
    baseCredits: 4,
    unitLabel: "per sound effect",
    resolutions: ["48kHz WAV"],
    aspectRatios: ["5s", "10s", "20s"],
    speedRating: "Ultra Fast",
    popularInMenu: false,
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
  },
  {
    slug: "animate-old-photos",
    name: "Animate old photos",
    subtitle: "Restore vintage family portraits with gentle breathing and smiles",
    badge: null,
    credits: 28,
    modelId: "kling-4.0",
    category: "Nostalgia",
    beforeLabel: "Vintage B&W or faded portrait",
    afterLabel: "Colorized, natural eye blink & warm smile",
    builtInPrompt:
      "Subtle lifelike portrait animation, gentle natural breathing, soft warm smile, realistic eye blink, film grain preservation, emotional shallow depth of field.",
    gradient: "from-amber-500/25 via-orange-500/10 to-zinc-950",
  },
  {
    slug: "ai-zombie",
    name: "AI Zombie",
    subtitle: "Transform any selfie into a cinematic thriller creature transformation",
    badge: "NEW",
    credits: 35,
    modelId: "seedance-2.5",
    category: "VFX Character",
    beforeLabel: "Standard selfie portrait",
    afterLabel: "Hollywood prosthetics & atmospheric fog VFX",
    builtInPrompt:
      "Cinematic practical VFX transformation into a dramatic post-apocalyptic zombie, eerie bioluminescent rim light, volumetric fog, thriller camera push-in with eerie sound design.",
    gradient: "from-rose-500/25 via-purple-500/10 to-zinc-950",
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
    billingNote: "once",
    credits: 990,
    perCreditCent: "1.00¢ per credit",
    highlight: false,
    estimates: [
      "990 credits, one time",
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
    billingNote: "once",
    credits: 3200,
    perCreditCent: "0.91¢ per credit",
    highlight: true,
    badge: "Most Popular",
    estimates: [
      "3,200 credits, one time",
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
    billingNote: "once",
    credits: 9500,
    perCreditCent: "0.83¢ per credit",
    highlight: false,
    estimates: [
      "9,500 credits, one time",
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
// 5. Curated Prompt Starters & Hero Live Comparison Samples
// ============================================================================
export const HERO_LIVE_SAMPLES = [
  {
    modelId: "seedance-2.5",
    modelName: "Seedance 2.5",
    badge: "HOT",
    credits: 135,
    resolution: "1080p · 5s · Native Audio",
    prompt:
      "Multi-shot cyberpunk street market in Neo-Tokyo during neon rain: Shot 1 wide tracking dolly of steam rising from ramen stalls; Shot 2 macro close-up of rain droplets splashing on a holographic visor.",
    metrics: { speed: "38s avg", audio: "Stereo Foley + Rain", consistency: "99.2%" },
    posterUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
  },
  {
    modelId: "kling-4.0",
    modelName: "Kling 4.0",
    badge: null,
    credits: 226,
    resolution: "2K · 10s · Keyframe Lock",
    prompt:
      "An astronaut in a weathered brass diving suit walking across black volcanic sand in Iceland as a massive bioluminescent whale breaches out of the misty ocean behind him, 35mm anamorphic lens.",
    metrics: { speed: "52s avg", audio: "Ocean Roar + Sub Bass", consistency: "99.5%" },
    posterUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
  },
  {
    modelId: "minimax-h3",
    modelName: "MiniMax H3",
    badge: "HOT",
    credits: 33,
    resolution: "2K · 5s · Native Sound",
    prompt:
      "Commercial macro shot of a frosted glass perfume bottle resting on dark wet obsidian rock; golden liquid swirls inside as a wave of crystal water crashes in slow motion at 120fps.",
    metrics: { speed: "19s avg", audio: "Crystal Splash SFX", consistency: "98.4%" },
    posterUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    modelId: "gpt-image-2.6",
    modelName: "GPT Image 2.6",
    badge: "NEW",
    credits: 3,
    resolution: "2K · Poster Typography",
    prompt:
      'Minimalist Swiss brutalist film festival poster titled "REELMUX 2026 — FUTURE OF MOTION", chrome 3D kinetic typography over deep obsidian carbon texture, razor-sharp kerning.',
    metrics: { speed: "4.2s avg", audio: "Still Image (2048×2048)", consistency: "100% Text" },
    posterUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
  },
];

export const PROMPT_STARTERS = [
  {
    id: "starter-1",
    title: "Luxury Watch Macro Turntable",
    toolSlug: "text-to-video",
    modelId: "minimax-h3",
    credits: 33,
    settings: "5s · 1080p · 16:9 · Native Audio",
    prompt:
      "Extreme macro commercial shot of a skeleton tourbillon mechanical watch emerging from dark liquid gold, gears ticking in crisp synchronization, dramatic rim lighting, 85mm cinema lens.",
    previewUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "starter-2",
    title: "Anime Mecha Orbital Launch",
    toolSlug: "text-to-video",
    modelId: "seedance-2.5",
    credits: 135,
    settings: "5s · 1080p · 16:9 · Multi-Shot",
    prompt:
      "Sakuga hand-drawn anime sequence: A white-and-lime orbital mecha ignites plasma thrusters on a rain-slicked launchpad, camera shakes violently as shockwaves part the clouds into starry space.",
    previewUrl:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "starter-3",
    title: "Nordic Fjord FPV Drone Dive",
    toolSlug: "image-to-video",
    modelId: "grok-imagine-video",
    credits: 22,
    settings: "4s · 720p · 16:9",
    prompt:
      "Acrobatic FPV drone diving down a vertical waterfall cliff in Norway, skimming inches above turquoise glacier water through a double rainbow, sun flare on lens.",
    previewUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "starter-4",
    title: "Editorial Cyberpunk Fashion Key Art",
    toolSlug: "text-to-image",
    modelId: "minimax-h3-image",
    credits: 4,
    settings: "2K · 3:4 Portrait",
    prompt:
      "High-fashion editorial portrait of a model wearing an iridescent translucent trench coat woven with fiber-optic threads in a rainy brutalist concrete courtyard, shot on Hasselblad medium format.",
    previewUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
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
  "Grok Imagine",
  "FLUX.2 Max",
  "HeyGen 1.0",
  "OmniHuman 2.0",
  "Topaz Proteus",
  "GPT Image 2.6",
  "Nano Banana Pro",
  "Seedream 5.0",
  "Qwen Image 3.0",
  "Recraft V3",
  "Suno v4.5",
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
