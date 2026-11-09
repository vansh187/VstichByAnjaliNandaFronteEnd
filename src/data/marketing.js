// Decorative homepage content with no backend equivalent yet.

export const testimonials = [
  {
    id: "t1",
    name: "Ritika Sharma",
    role: "Bridal Client, Delhi",
    quote:
      "The lehenga Anjali crafted for my wedding felt like it was made from a dream. Every thread, every mirror — pure artistry.",
  },
  {
    id: "t2",
    name: "Meera Kapoor",
    role: "Repeat Customer, Mumbai",
    quote:
      "I've ordered five sarees from VStitch and the fit, fall and finish is unmatched. This is craftsmanship you can feel.",
  },
  {
    id: "t3",
    name: "Ananya Iyer",
    role: "Verified Buyer, Bengaluru",
    quote:
      "From the first fitting call to doorstep delivery, the experience felt personal. My Anarkali is now my most-complimented outfit.",
  },
];

// video: source clip played (silently) on hover/tap, in place of the
// tile's static gradient.
export const instagramTiles = [
  { id: "ig1", tone: "from-[#9a2b2b] to-[#3a0d0d]", video: "/static/instagram/v1.mp4" },
  { id: "ig2", tone: "from-[#b1873f] to-[#5a3d17]", video: "/static/instagram/v2.mp4" },
  { id: "ig3", tone: "from-[#2f4a3e] to-[#0f1f18]", video: "/static/instagram/v3.mp4" },
  { id: "ig4", tone: "from-[#5a2f6b] to-[#1f0f2b]", video: "/static/instagram/v4.mp4" },
  { id: "ig5", tone: "from-[#1c3a52] to-[#08151f]", video: "/static/instagram/v5.mp4" },
];

// Influencer collaboration reels: listed on /influencers (newest first);
// the `featured` one is also the first slide of the home-page hero.
//
// `heroVideo` / `video` point at a self-hosted MP4 of the reel (download it
// from Instagram - VStitch is a collaborator on the post - or get it from
// the creator) placed under public/static/influencers/. The hero plays it
// full-bleed; the /influencers card autoplays it muted with a sound toggle.
// Until the file exists, the hero skips the reel slide and the card falls
// back to Instagram's embed (tap to play), so nothing looks broken.
export const influencerReels = [
  {
    id: "justpoooja-2026",
    featured: true,
    creatorHandle: "justpoooja",
    reelUrl: "https://www.instagram.com/reel/DffGKH5B-4G/",
    embedUrl: "https://www.instagram.com/reel/DffGKH5B-4G/embed/",
    eyebrow: "Just Launched · Collaboration",
    title: "VStitch × @justpoooja",
    copy: "Watch @justpoooja bring VStitch by Anjali Nanda to life in our newest collaboration - handcrafted pieces, styled her way.",
    shopHref: "/collections",
    shopLabel: "Shop the Collection",
    heroVideo: "/static/influencers/justpoooja-reel.mp4",
    video: "/static/influencers/justpoooja-reel.mp4",
    poster: null,
  },
];

export const featuredInfluencerReel = influencerReels.find((r) => r.featured) ?? null;
