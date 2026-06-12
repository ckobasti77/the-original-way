export const clothingSizes = ["S", "M", "L", "XL", "XXL"];

export const nikeShoeSizesEu = [
  "35.5",
  "36",
  "36.5",
  "37.5",
  "38",
  "38.5",
  "39",
  "40",
  "40.5",
  "41",
  "42",
  "42.5",
  "43",
  "44",
  "44.5",
  "45",
  "45.5",
  "46",
  "47",
  "47.5",
  "48",
  "48.5",
  "49",
  "49.5",
  "50",
  "50.5",
  "51",
  "51.5",
  "52",
  "52.5",
  "53",
  "53.5",
  "54",
  "54.5",
  "55",
  "55.5",
  "56",
  "56.5",
];

export const adminNavItems = [
  { href: "/admin/evidencija", label: "Evidencija" },
  { href: "/admin/proizvodi", label: "Proizvodi" },
  { href: "/admin/kategorije", label: "Kategorije" },
  { href: "/admin/kolekcije", label: "Kolekcije" },
  { href: "/admin/brendovi", label: "Brendovi" },
  { href: "/admin/velicine", label: "Velicine" },
  { href: "/admin/podesavanja", label: "Podesavanja" },
];

export const adminCredentials = {
  email: "theoriginalway@gmail.com",
  password: "jasamsazvezdare",
} as const;

export const productTypes = [
  { value: "clothing", label: "Odeca" },
  { value: "footwear", label: "Obuca" },
] as const;

export const defaultProductCategories = [
  { name: "Majice", slug: "majice", type: "clothing", sortOrder: 10 },
  { name: "Prsluci", slug: "prsluci", type: "clothing", sortOrder: 20 },
  { name: "Dzemperi", slug: "dzemperi", type: "clothing", sortOrder: 30 },
  { name: "Jakne", slug: "jakne", type: "clothing", sortOrder: 40 },
  { name: "Suskavci", slug: "suskavci", type: "clothing", sortOrder: 50 },
  { name: "Polo majice", slug: "polo-majice", type: "clothing", sortOrder: 60 },
  { name: "Skijaske jakne", slug: "skijaske-jakne", type: "clothing", sortOrder: 70 },
  { name: "Trenerke", slug: "trenerke", type: "clothing", sortOrder: 80 },
  { name: "Kompleti", slug: "kompleti", type: "clothing", sortOrder: 90 },
  { name: "Full-zip duksevi", slug: "full-zip-duksevi", type: "clothing", sortOrder: 100 },
  { name: "Half-zip duksevi", slug: "half-zip-duksevi", type: "clothing", sortOrder: 110 },
  { name: "Bomber jakne", slug: "bomber-jakne", type: "clothing", sortOrder: 120 },
  { name: "Patike", slug: "patike", type: "footwear", sortOrder: 210 },
  { name: "Duboke patike", slug: "duboke-patike", type: "footwear", sortOrder: 220 },
  { name: "Cipele", slug: "cipele", type: "footwear", sortOrder: 230 },
  { name: "Papuce", slug: "papuce", type: "footwear", sortOrder: 240 },
] as const;

export const productGenders = [
  { value: "men", label: "Muskarci" },
  { value: "women", label: "Zene" },
  { value: "kids", label: "Deca" },
] as const;

export const orderStatuses = [
  { value: "new", label: "Novo" },
  { value: "processing", label: "U obradi" },
  { value: "sent", label: "Poslato" },
  { value: "completed", label: "Zavrseno" },
] as const;

export const orderStatusClasses = {
  new: "border-[#b86b2f]/30 bg-[#fff0df] text-[#7c3e12]",
  processing: "border-[#315f8c]/30 bg-[#e9f2fb] text-[#1d4d7b]",
  sent: "border-[#276c56]/30 bg-[#e7f4ee] text-[#1f5946]",
  completed: "border-[#4f4f4f]/25 bg-[#eeeeee] text-[#3f3f3f]",
} as const;
