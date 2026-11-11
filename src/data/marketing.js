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
// Media is self-hosted under public/static/influencers/ (downloaded from the
// public posts - VStitch is credited on each - or got from the creator):
//   video   MP4 of the reel. Cards play it on hover (tap on phones); the
//           hero plays `heroVideo` full-bleed.
//   poster  still shown until the card is hovered (also lets the MP4 load
//           only on hover).
//   images  photos of a carousel post, cycled on hover instead of a video.
// Instagram's own embeds can't be used: Instagram now refuses to be shown
// inside other sites (X-Frame-Options: DENY). A card with no media shows a
// "Watch on Instagram" tile; the hero skips a featured reel whose MP4 fails.
//
// `onProductPages: true` also shows the reel on product detail pages
// ("Styled by Creators", below the product). `productIds: [12, 34]` ties it
// to those products; leave it empty to show it on every product. A product
// with reels tied to it shows only those, not the every-product ones.
const MEDIA = "/static/influencers";

export const influencerReels = [
  {
    id: "forevergorgeousbypoojapal-2026",
    creatorHandle: "forevergorgeousbypoojapal",
    reelUrl: "https://www.instagram.com/reel/DfmFsNNANg4/",
    eyebrow: "Shaadi Preps · Collaboration",
    title: "VStitch × @forevergorgeousbypoojapal",
    copy: "Delhi makeup artist @forevergorgeousbypoojapal gets shaadi-ready in VStitch by Anjali Nanda - handcrafted pieces, styled her way.",
    shopHref: "/collections",
    shopLabel: "Shop the Collection",
    video: `${MEDIA}/forevergorgeousbypoojapal-reel.mp4`,
    poster: `${MEDIA}/forevergorgeousbypoojapal-reel.jpg`,
    onProductPages: true,
    // Chocolate Brown & Ivory Floral Embroidered Kurta Set
    productIds: [111],
  },
  {
    id: "itsmuskaansachdeva-dilruba-2026",
    creatorHandle: "itsmuskaansachdeva",
    reelUrl: "https://www.instagram.com/p/DfkeA7TGc5i/",
    eyebrow: "Dilruba · Collaboration",
    title: "VStitch × @itsmuskaansachdeva",
    copy: "\"She literally brought my vision to life.\" @itsmuskaansachdeva in her Dilruba look - designed with her, handcrafted by VStitch by Anjali Nanda.",
    shopHref: "/collections",
    shopLabel: "Shop the Collection",
    video: null,
    images: [1, 2, 3, 4, 5, 6].map((n) => `${MEDIA}/itsmuskaansachdeva-dilruba-${n}.jpg`),
    poster: null,
  },
  {
    id: "justpoooja-2026",
    featured: true,
    creatorHandle: "justpoooja",
    reelUrl: "https://www.instagram.com/reel/DffGKH5B-4G/",
    eyebrow: "Just Launched · Collaboration",
    title: "VStitch × @justpoooja",
    copy: "Watch @justpoooja bring VStitch by Anjali Nanda to life in our newest collaboration - handcrafted pieces, styled her way.",
    shopHref: "/collections",
    shopLabel: "Shop the Collection",
    heroVideo: `${MEDIA}/justpoooja-reel.mp4`,
    video: `${MEDIA}/justpoooja-reel.mp4`,
    poster: `${MEDIA}/justpoooja-reel.jpg`,
    onProductPages: true,
    // Pastel Mint Green Embroidered Suit Set with Blush Pink Dupatta
    productIds: [110],
  },
  {
    id: "itsmuskaansachdeva-diwali-2026",
    creatorHandle: "itsmuskaansachdeva",
    reelUrl: "https://www.instagram.com/reel/DfcHEH-Oqx4/",
    eyebrow: "Diwali 2026 · Collaboration",
    title: "VStitch × @itsmuskaansachdeva",
    copy: "@itsmuskaansachdeva celebrates Diwali 2026 in a VStitch by Anjali Nanda suit - festive, handcrafted and made to fit.",
    shopHref: "/collections",
    shopLabel: "Shop the Collection",
    video: `${MEDIA}/itsmuskaansachdeva-diwali-reel.mp4`,
    poster: `${MEDIA}/itsmuskaansachdeva-diwali-reel.jpg`,
    onProductPages: true,
    productIds: [],
  },
];

export const featuredInfluencerReel = influencerReels.find((r) => r.featured) ?? null;

// Reels to show on a given product's detail page: the ones tied to this
// product if there are any, otherwise the every-product ones.
export function reelsForProduct(productId) {
  const onPages = influencerReels.filter((r) => r.onProductPages);
  const tied = onPages.filter((r) => r.productIds?.includes(productId));
  return tied.length ? tied : onPages.filter((r) => !r.productIds?.length);
}
