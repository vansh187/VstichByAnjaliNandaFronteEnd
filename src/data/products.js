// Sample catalogue data — swap for real product/CMS data at integration time.

export const categories = [
  { id: "sarees", name: "Sarees", count: "48 pieces", tone: "from-[#e2d5b8] to-[#c9a15a]" },
  { id: "suits", name: "Suits & Sets", count: "36 pieces", tone: "from-[#d8b876] to-[#b1873f]" },
  { id: "lehengas", name: "Bridal Lehengas", count: "22 pieces", tone: "from-[#c98f7b] to-[#8f4a3a]" },
  { id: "indowestern", name: "Indo-Western", count: "29 pieces", tone: "from-[#3a332c] to-[#1c1815]" },
];

export const products = [
  {
    id: "p1",
    name: "Kanjivaram Zari Saree",
    category: "Sarees",
    price: 18500,
    compareAt: 24500,
    tone: "from-[#9a2b2b] to-[#3a0d0d]",
    badge: "Bestseller",
  },
  {
    id: "p2",
    name: "Hand-Embroidered Anarkali",
    category: "Suits & Sets",
    price: 14200,
    compareAt: null,
    tone: "from-[#2f4a3e] to-[#0f1f18]",
    badge: "New",
  },
  {
    id: "p3",
    name: "Bridal Zardozi Lehenga",
    category: "Bridal Lehengas",
    price: 42000,
    compareAt: 52000,
    tone: "from-[#a1163d] to-[#3d0a1a]",
    badge: "Limited",
  },
  {
    id: "p4",
    name: "Chanderi Silk Co-ord",
    category: "Indo-Western",
    price: 9800,
    compareAt: null,
    tone: "from-[#b1873f] to-[#5a3d17]",
    badge: null,
  },
  {
    id: "p5",
    name: "Banarasi Silk Saree",
    category: "Sarees",
    price: 21500,
    compareAt: 26000,
    tone: "from-[#1c3a52] to-[#08151f]",
    badge: "Bestseller",
  },
  {
    id: "p6",
    name: "Mirror-Work Sharara Set",
    category: "Suits & Sets",
    price: 16800,
    compareAt: null,
    tone: "from-[#5a2f6b] to-[#1f0f2b]",
    badge: "New",
  },
  {
    id: "p7",
    name: "Pastel Organza Gown",
    category: "Indo-Western",
    price: 19900,
    compareAt: 23900,
    tone: "from-[#7d8f6b] to-[#2c3524]",
    badge: null,
  },
  {
    id: "p8",
    name: "Sabyasachi-Inspired Lehenga",
    category: "Bridal Lehengas",
    price: 48500,
    compareAt: null,
    tone: "from-[#8f4a1c] to-[#2b1608]",
    badge: "Editor's Pick",
  },
];

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

export const instagramTiles = [
  { id: "ig1", tone: "from-[#9a2b2b] to-[#3a0d0d]" },
  { id: "ig2", tone: "from-[#b1873f] to-[#5a3d17]" },
  { id: "ig3", tone: "from-[#2f4a3e] to-[#0f1f18]" },
  { id: "ig4", tone: "from-[#5a2f6b] to-[#1f0f2b]" },
  { id: "ig5", tone: "from-[#1c3a52] to-[#08151f]" },
  { id: "ig6", tone: "from-[#a1163d] to-[#3d0a1a]" },
];
