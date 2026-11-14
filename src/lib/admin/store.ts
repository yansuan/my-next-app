export interface AbuseCluster {
  id: string;
  signal: "ip" | "fingerprint";
  key: string;
  displayKey: string;
  accounts: number;
  granted: number;
  paid: number;
  sampleEmails: string[];
  extraCount: number;
  blocked: boolean;
  lastSeenAt: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  planTier: "free" | "starter" | "creator" | "studio" | "pro_monthly";
  balanceAvailable: number;
  balanceReserved: number;
  freeCreditsGranted: boolean;
  paidTotalUsd: number;
  generationsCount: number;
  signupIp: string;
  deviceFingerprint: string;
  status: "active" | "flagged" | "banned";
  createdAt: string;
}

export interface AdminGenerationRecord {
  id: string;
  upstreamJobId: string;
  userEmail: string;
  toolSlug: string;
  category: "video" | "image" | "audio" | "effect";
  modelId: string;
  modelName: string;
  prompt: string;
  resolution: string;
  durationSec?: number;
  creditsCost: number;
  status: "succeeded" | "processing" | "queued" | "failed" | "refunded";
  outputUrl?: string;
  latencySec: number;
  createdAt: string;
}

export interface AdminUploadRecord {
  id: string;
  userEmail: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  toolSlug: string;
  moderationStatus: "approved" | "flagged" | "quarantined";
  createdAt: string;
}

export interface AdminOrderRecord {
  id: string;
  orderNo: string;
  userEmail: string;
  itemType: "credit_pack" | "subscription";
  itemName: string;
  amountUsd: number;
  creditsGranted: number;
  paymentMethod: string;
  status: "paid" | "refunded" | "pending" | "disputed";
  ipAddress: string;
  createdAt: string;
}

export interface AdminAuditLogRecord {
  id: string;
  actorEmail: string;
  action: string;
  targetType: "user" | "abuse_signal" | "generation" | "upload" | "order" | "system";
  targetId: string;
  summary: string;
  ipAddress: string;
  createdAt: string;
}

const INITIAL_ABUSE_CLUSTERS: AbuseCluster[] = [
  {
    id: "ab-ip-1",
    signal: "ip",
    key: "102.182.207.15",
    displayKey: "102.182.207.15",
    accounts: 6,
    granted: 2,
    paid: 0,
    sampleEmails: [
      "hanojones21@gmail.com",
      "hanojones20@gmail.com",
      "hanojones19@gmail.com",
    ],
    extraCount: 3,
    blocked: false,
    lastSeenAt: "2026-11-14 08:42 UTC",
  },
  {
    id: "ab-ip-2",
    signal: "ip",
    key: "2001:4c4e:1610:4900:298e:a3ac:a52f:708",
    displayKey: "2001:4c4e:1610:4900:298e:a3ac:a52f:708",
    accounts: 5,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "misiartika@gmail.com",
      "madamaskus7@gmail.com",
      "szilviamezei472@gmail.com",
    ],
    extraCount: 2,
    blocked: false,
    lastSeenAt: "2026-11-14 08:19 UTC",
  },
  {
    id: "ab-ip-3",
    signal: "ip",
    key: "185.106.30.201",
    displayKey: "185.106.30.201",
    accounts: 4,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "iraqmarket59@gmail.com",
      "68uk@bk.ru",
      "lomez.cloud@bk.ru",
    ],
    extraCount: 1,
    blocked: false,
    lastSeenAt: "2026-11-14 07:55 UTC",
  },
  {
    id: "ab-ip-4",
    signal: "ip",
    key: "212.237.123.101",
    displayKey: "212.237.123.101",
    accounts: 4,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "hassan.alkurdi27@gmail.com",
      "mirna7mounzer@gmail.com",
      "dpqpsp@gmail.com",
    ],
    extraCount: 1,
    blocked: false,
    lastSeenAt: "2026-11-14 07:31 UTC",
  },
  {
    id: "ab-ip-5",
    signal: "ip",
    key: "2001:4c4e:1610:4900:3186:3db8:d96c:20eb",
    displayKey: "2001:4c4e:1610:4900:3186:3db8:d96c:20eb",
    accounts: 3,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "martimihaly523@gmail.com",
      "michael.adam8877@gmail.com",
      "mihalyadam752@gmail.com",
    ],
    extraCount: 0,
    blocked: false,
    lastSeenAt: "2026-11-14 06:48 UTC",
  },
  {
    id: "ab-ip-6",
    signal: "ip",
    key: "46.55.0.117",
    displayKey: "46.55.0.117",
    accounts: 3,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "anad2123321@gmail.com",
      "olicica2123@gmail.com",
      "valeriaorhoian123@gmail.com",
    ],
    extraCount: 0,
    blocked: false,
    lastSeenAt: "2026-11-14 06:12 UTC",
  },
  {
    id: "ab-ip-7",
    signal: "ip",
    key: "188.71.231.179",
    displayKey: "188.71.231.179",
    accounts: 2,
    granted: 1,
    paid: 0,
    sampleEmails: ["ddkjdjsjssf@gmail.com", "hshdjdjs485@gmail.com"],
    extraCount: 0,
    blocked: false,
    lastSeenAt: "2026-11-14 05:39 UTC",
  },
  {
    id: "ab-ip-8",
    signal: "ip",
    key: "2a02:a03f:c199:6400:55ae:6269:f142:bec0",
    displayKey: "2a02:a03f:c199:6400:55ae:6269:f142:bec0",
    accounts: 2,
    granted: 1,
    paid: 0,
    sampleEmails: ["omni1975ai@gmail.com", "kdesignsprl9@gmail.com"],
    extraCount: 0,
    blocked: false,
    lastSeenAt: "2026-11-14 05:10 UTC",
  },
  {
    id: "ab-ip-9",
    signal: "ip",
    key: "152.207.211.121",
    displayKey: "152.207.211.121",
    accounts: 2,
    granted: 1,
    paid: 0,
    sampleEmails: ["kraros19851@gmail.com", "torinorevel@gmail.com"],
    extraCount: 0,
    blocked: false,
    lastSeenAt: "2026-11-14 04:44 UTC",
  },
  {
    id: "ab-fp-1",
    signal: "fingerprint",
    key: "38ad47dbbcafa734e91c82b04d12a98f",
    displayKey: "38ad47dbbcafa734...",
    accounts: 5,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "hassan.alkurdi27@gmail.com",
      "iraqmarket59@gmail.com",
      "68uk@bk.ru",
    ],
    extraCount: 2,
    blocked: false,
    lastSeenAt: "2026-11-14 08:30 UTC",
  },
  {
    id: "ab-fp-2",
    signal: "fingerprint",
    key: "59a7a3b8824daf5a109c77e3b19044d2",
    displayKey: "59a7a3b8824daf5a...",
    accounts: 5,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "hanojones20@gmail.com",
      "hanojones19@gmail.com",
      "hanojones18@gmail.com",
    ],
    extraCount: 2,
    blocked: false,
    lastSeenAt: "2026-11-14 08:21 UTC",
  },
  {
    id: "ab-fp-3",
    signal: "fingerprint",
    key: "a261385813a8eb8a9f023c45d7812e11",
    displayKey: "a261385813a8eb8a...",
    accounts: 4,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "mihalyadam465@gmail.com",
      "martimihaly523@gmail.com",
      "michael.adam8877@gmail.com",
    ],
    extraCount: 1,
    blocked: false,
    lastSeenAt: "2026-11-14 07:45 UTC",
  },
  {
    id: "ab-fp-4",
    signal: "fingerprint",
    key: "dd9f58b153107d3184ab90e12c3481a0",
    displayKey: "dd9f58b153107d31...",
    accounts: 4,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "sscsvw@gmail.com",
      "whsjjs5997@gmail.com",
      "ddkjdjsjssf@gmail.com",
    ],
    extraCount: 1,
    blocked: false,
    lastSeenAt: "2026-11-14 07:10 UTC",
  },
  {
    id: "ab-fp-5",
    signal: "fingerprint",
    key: "130eecda9c7a2bb45901f23c89ab012e",
    displayKey: "130eecda9c7a2bb4...",
    accounts: 4,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "armadadigital5@gmail.com",
      "rincondelasalsa891@gmail.com",
      "aguaje402@gmail.com",
    ],
    extraCount: 1,
    blocked: false,
    lastSeenAt: "2026-11-14 06:35 UTC",
  },
  {
    id: "ab-fp-6",
    signal: "fingerprint",
    key: "2cc4a36e6417242c9012ab44e891023f",
    displayKey: "2cc4a36e6417242c...",
    accounts: 3,
    granted: 1,
    paid: 0,
    sampleEmails: [
      "anad2123321@gmail.com",
      "olicica2123@gmail.com",
      "valeriaorhoian123@gmail.com",
    ],
    extraCount: 0,
    blocked: false,
    lastSeenAt: "2026-11-14 06:11 UTC",
  },
];

const INITIAL_USERS: AdminUserRecord[] = [
  {
    id: "usr-001",
    email: "firefish.a6@gmail.com",
    displayName: "Firefish Studio (Admin)",
    planTier: "studio",
    balanceAvailable: 14820,
    balanceReserved: 0,
    freeCreditsGranted: true,
    paidTotalUsd: 169,
    generationsCount: 84,
    signupIp: "103.149.28.11",
    deviceFingerprint: "9f81c20b4e77a12d8890c123f45a6789",
    status: "active",
    createdAt: "2026-11-08 10:15 UTC",
  },
  {
    id: "usr-002",
    email: "elena.vance@voxcinema.io",
    displayName: "Elena Vance",
    planTier: "creator",
    balanceAvailable: 4210,
    balanceReserved: 143,
    freeCreditsGranted: true,
    paidTotalUsd: 78,
    generationsCount: 41,
    signupIp: "172.56.21.89",
    deviceFingerprint: "71bc9023e451a89012f34c56d78e9012",
    status: "active",
    createdAt: "2026-11-10 14:22 UTC",
  },
  {
    id: "usr-003",
    email: "marcus.chen@hyperloop.design",
    displayName: "Marcus Chen",
    planTier: "pro_monthly",
    balanceAvailable: 2680,
    balanceReserved: 0,
    freeCreditsGranted: true,
    paidTotalUsd: 29,
    generationsCount: 29,
    signupIp: "64.233.160.42",
    deviceFingerprint: "44ae8910b234c567d890e123f456a789",
    status: "active",
    createdAt: "2026-11-11 19:04 UTC",
  },
  {
    id: "usr-004",
    email: "omni1975ai@gmail.com",
    displayName: "Omni1975",
    planTier: "free",
    balanceAvailable: 59,
    balanceReserved: 0,
    freeCreditsGranted: true,
    paidTotalUsd: 0,
    generationsCount: 2,
    signupIp: "2a02:a03f:c199:6400:55ae:6269:f142:bec0",
    deviceFingerprint: "88b123c456d789e012f345a678b901c2",
    status: "flagged",
    createdAt: "2026-11-14 05:08 UTC",
  },
  {
    id: "usr-005",
    email: "kdesignsprl9@gmail.com",
    displayName: "KDesign SPRL",
    planTier: "free",
    balanceAvailable: 0,
    balanceReserved: 0,
    freeCreditsGranted: false,
    paidTotalUsd: 0,
    generationsCount: 0,
    signupIp: "2a02:a03f:c199:6400:55ae:6269:f142:bec0",
    deviceFingerprint: "88b123c456d789e012f345a678b901c2",
    status: "flagged",
    createdAt: "2026-11-14 05:10 UTC",
  },
  {
    id: "usr-006",
    email: "hanojones21@gmail.com",
    displayName: "Hano Jones 21",
    planTier: "free",
    balanceAvailable: 0,
    balanceReserved: 0,
    freeCreditsGranted: false,
    paidTotalUsd: 0,
    generationsCount: 0,
    signupIp: "102.182.207.15",
    deviceFingerprint: "59a7a3b8824daf5a109c77e3b19044d2",
    status: "flagged",
    createdAt: "2026-11-14 08:42 UTC",
  },
  {
    id: "usr-007",
    email: "hanojones20@gmail.com",
    displayName: "Hano Jones 20",
    planTier: "free",
    balanceAvailable: 18,
    balanceReserved: 0,
    freeCreditsGranted: true,
    paidTotalUsd: 0,
    generationsCount: 3,
    signupIp: "102.182.207.15",
    deviceFingerprint: "59a7a3b8824daf5a109c77e3b19044d2",
    status: "flagged",
    createdAt: "2026-11-14 08:21 UTC",
  },
  {
    id: "usr-008",
    email: "hassan.alkurdi27@gmail.com",
    displayName: "Hassan Alkurdi",
    planTier: "free",
    balanceAvailable: 0,
    balanceReserved: 0,
    freeCreditsGranted: false,
    paidTotalUsd: 0,
    generationsCount: 0,
    signupIp: "212.237.123.101",
    deviceFingerprint: "38ad47dbbcafa734e91c82b04d12a98f",
    status: "flagged",
    createdAt: "2026-11-14 07:31 UTC",
  },
  {
    id: "usr-009",
    email: "iraqmarket59@gmail.com",
    displayName: "Iraq Market 59",
    planTier: "free",
    balanceAvailable: 100,
    balanceReserved: 0,
    freeCreditsGranted: true,
    paidTotalUsd: 0,
    generationsCount: 0,
    signupIp: "185.106.30.201",
    deviceFingerprint: "38ad47dbbcafa734e91c82b04d12a98f",
    status: "flagged",
    createdAt: "2026-11-14 07:55 UTC",
  },
  {
    id: "usr-010",
    email: "misiartika@gmail.com",
    displayName: "Misi Artika",
    planTier: "free",
    balanceAvailable: 67,
    balanceReserved: 0,
    freeCreditsGranted: true,
    paidTotalUsd: 0,
    generationsCount: 1,
    signupIp: "2001:4c4e:1610:4900:298e:a3ac:a52f:708",
    deviceFingerprint: "62f190a8bc34d56e78901234abcd5678",
    status: "flagged",
    createdAt: "2026-11-14 08:19 UTC",
  },
];

const INITIAL_GENERATIONS: AdminGenerationRecord[] = [
  {
    id: "gen-9941",
    upstreamJobId: "job_kling4_88291a",
    userEmail: "elena.vance@voxcinema.io",
    toolSlug: "text-to-video",
    category: "video",
    modelId: "kling-4.0",
    modelName: "Kling 4.0",
    prompt:
      "35mm anamorphic tracking shot through rain-soaked Tokyo alleyway at midnight, neon reflections on wet asphalt, cinematic volumetric fog.",
    resolution: "1080p · 16:9",
    durationSec: 10,
    creditsCost: 82,
    status: "succeeded",
    outputUrl: "/examples/kling-4-chase.mp4",
    latencySec: 38.4,
    createdAt: "2026-11-14 08:58 UTC",
  },
  {
    id: "gen-9940",
    upstreamJobId: "job_seedance25_77102b",
    userEmail: "firefish.a6@gmail.com",
    toolSlug: "reference-to-video",
    category: "video",
    modelId: "seedance-2.5",
    modelName: "Seedance 2.5",
    prompt:
      "Multi-shot sequence: heroine turns toward camera on windswept cliffside, coat billowing, synchronized orchestral swell and ocean wind.",
    resolution: "1080p · 16:9",
    durationSec: 5,
    creditsCost: 143,
    status: "succeeded",
    outputUrl: "/examples/seedance-2-5-train.mp4",
    latencySec: 29.1,
    createdAt: "2026-11-14 08:45 UTC",
  },
  {
    id: "gen-9939",
    upstreamJobId: "job_veo31_66419c",
    userEmail: "marcus.chen@hyperloop.design",
    toolSlug: "image-to-video",
    category: "video",
    modelId: "veo-3.1",
    modelName: "Google Veo 3.1",
    prompt:
      "Close-up macro product reveal of brushed titanium chronograph watch emerging from liquid mercury, studio rim lighting, 4K.",
    resolution: "4K · 16:9",
    durationSec: 8,
    creditsCost: 230,
    status: "processing",
    latencySec: 14.0,
    createdAt: "2026-11-14 08:41 UTC",
  },
  {
    id: "gen-9938",
    upstreamJobId: "job_flux2max_55108d",
    userEmail: "omni1975ai@gmail.com",
    toolSlug: "text-to-image",
    category: "image",
    modelId: "flux-2-max",
    modelName: "FLUX.2 Max",
    prompt:
      "Editorial fashion portrait shot on medium format Hasselblad, golden hour desert dunes, crisp micro-skin texture.",
    resolution: "2K · 4:5",
    creditsCost: 18,
    status: "succeeded",
    outputUrl: "/examples/flux-2-max-portrait.webp",
    latencySec: 6.2,
    createdAt: "2026-11-14 05:14 UTC",
  },
  {
    id: "gen-9937",
    upstreamJobId: "job_wan30_44912e",
    userEmail: "hanojones20@gmail.com",
    toolSlug: "text-to-video",
    category: "video",
    modelId: "wan-3.0",
    modelName: "Wan 3.0",
    prompt:
      "Cyberpunk samurai drawing glowing katana under cherry blossom storm, dynamic camera orbit.",
    resolution: "1080p · 16:9",
    durationSec: 5,
    creditsCost: 82,
    status: "refunded",
    latencySec: 11.5,
    createdAt: "2026-11-14 08:25 UTC",
  },
  {
    id: "gen-9936",
    upstreamJobId: "job_suno6_33801f",
    userEmail: "elena.vance@voxcinema.io",
    toolSlug: "ai-music",
    category: "audio",
    modelId: "suno-v6",
    modelName: "Suno v6",
    prompt:
      "Cinematic synthwave trailer score with deep analog bassline, choir swells, and punchy gated drums, 124 BPM.",
    resolution: "48kHz Stereo",
    durationSec: 120,
    creditsCost: 20,
    status: "succeeded",
    latencySec: 18.7,
    createdAt: "2026-11-14 07:12 UTC",
  },
];

const INITIAL_UPLOADS: AdminUploadRecord[] = [
  {
    id: "upl-501",
    userEmail: "elena.vance@voxcinema.io",
    fileName: "heroine-ref-sheet-01.png",
    mimeType: "image/png",
    sizeBytes: 4_821_900,
    storageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    toolSlug: "reference-to-video",
    moderationStatus: "approved",
    createdAt: "2026-11-14 08:43 UTC",
  },
  {
    id: "upl-502",
    userEmail: "marcus.chen@hyperloop.design",
    fileName: "chronograph-cad-keyframe-start.webp",
    mimeType: "image/webp",
    sizeBytes: 2_190_400,
    storageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    toolSlug: "frames-to-video",
    moderationStatus: "approved",
    createdAt: "2026-11-14 08:39 UTC",
  },
  {
    id: "upl-503",
    userEmail: "firefish.a6@gmail.com",
    fileName: "tokyo-neon-plate-4k.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 6_412_000,
    storageUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    toolSlug: "image-to-video",
    moderationStatus: "approved",
    createdAt: "2026-11-14 08:10 UTC",
  },
  {
    id: "upl-504",
    userEmail: "hanojones20@gmail.com",
    fileName: "test_scrape_batch_09.png",
    mimeType: "image/png",
    sizeBytes: 1_104_220,
    storageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    toolSlug: "image-to-image",
    moderationStatus: "flagged",
    createdAt: "2026-11-14 08:23 UTC",
  },
];

const INITIAL_ORDERS: AdminOrderRecord[] = [
  {
    id: "ord-8001",
    orderNo: "RMX-20261114-8001",
    userEmail: "firefish.a6@gmail.com",
    itemType: "credit_pack",
    itemName: "Studio Pack (15,000 credits)",
    amountUsd: 169,
    creditsGranted: 15000,
    paymentMethod: "Visa •••• 4242",
    status: "paid",
    ipAddress: "103.149.28.11",
    createdAt: "2026-11-14 02:14 UTC",
  },
  {
    id: "ord-8002",
    orderNo: "RMX-20261113-8002",
    userEmail: "elena.vance@voxcinema.io",
    itemType: "credit_pack",
    itemName: "Creator Pack (3,500 credits)",
    amountUsd: 39,
    creditsGranted: 3500,
    paymentMethod: "Mastercard •••• 8819",
    status: "paid",
    ipAddress: "172.56.21.89",
    createdAt: "2026-11-13 19:45 UTC",
  },
  {
    id: "ord-8003",
    orderNo: "RMX-20261113-8003",
    userEmail: "elena.vance@voxcinema.io",
    itemType: "credit_pack",
    itemName: "Creator Pack (3,500 credits)",
    amountUsd: 39,
    creditsGranted: 3500,
    paymentMethod: "Mastercard •••• 8819",
    status: "paid",
    ipAddress: "172.56.21.89",
    createdAt: "2026-11-12 11:20 UTC",
  },
  {
    id: "ord-8004",
    orderNo: "RMX-20261111-8004",
    userEmail: "marcus.chen@hyperloop.design",
    itemType: "subscription",
    itemName: "Creator Pro Monthly (3,000 credits/mo)",
    amountUsd: 29,
    creditsGranted: 3000,
    paymentMethod: "Apple Pay",
    status: "paid",
    ipAddress: "64.233.160.42",
    createdAt: "2026-11-11 19:06 UTC",
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLogRecord[] = [
  {
    id: "aud-101",
    actorEmail: "system@reelmux.com",
    action: "signup.grant_withheld_abuse",
    targetType: "user",
    targetId: "hanojones21@gmail.com",
    summary:
      "Withheld 100 free signup credits: IP 102.182.207.15 & fingerprint 59a7a3b8824daf5a... exceeded 7d grant cap (6 accounts).",
    ipAddress: "102.182.207.15",
    createdAt: "2026-11-14 08:42 UTC",
  },
  {
    id: "aud-102",
    actorEmail: "system@reelmux.com",
    action: "job.auto_refund",
    targetType: "generation",
    targetId: "gen-9937",
    summary:
      "Automatically refunded 82 reserved credits to hanojones20@gmail.com after upstream timeout on wan-3.0.",
    ipAddress: "102.182.207.15",
    createdAt: "2026-11-14 08:25 UTC",
  },
  {
    id: "aud-103",
    actorEmail: "system@reelmux.com",
    action: "signup.grant_withheld_abuse",
    targetType: "user",
    targetId: "hassan.alkurdi27@gmail.com",
    summary:
      "Withheld 100 free signup credits: shared device fingerprint 38ad47dbbcafa734... (5 accounts in 7d).",
    ipAddress: "212.237.123.101",
    createdAt: "2026-11-14 07:31 UTC",
  },
  {
    id: "aud-104",
    actorEmail: "firefish.a6@gmail.com",
    action: "order.completed",
    targetType: "order",
    targetId: "RMX-20261114-8001",
    summary: "Purchased Studio Pack (+15,000 credits, $169.00 USD).",
    ipAddress: "103.149.28.11",
    createdAt: "2026-11-14 02:14 UTC",
  },
];

// Global singleton store for immediate interactive persistence across API calls
const globalForAdmin = globalThis as unknown as {
  reelmuxAdminStore?: {
    abuseClusters: AbuseCluster[];
    users: AdminUserRecord[];
    generations: AdminGenerationRecord[];
    uploads: AdminUploadRecord[];
    orders: AdminOrderRecord[];
    auditLogs: AdminAuditLogRecord[];
  };
};

export function getAdminStore() {
  if (!globalForAdmin.reelmuxAdminStore) {
    globalForAdmin.reelmuxAdminStore = {
      abuseClusters: [...INITIAL_ABUSE_CLUSTERS],
      users: [...INITIAL_USERS],
      generations: [...INITIAL_GENERATIONS],
      uploads: [...INITIAL_UPLOADS],
      orders: [...INITIAL_ORDERS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
    };
  }
  return globalForAdmin.reelmuxAdminStore;
}
