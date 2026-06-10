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
  { href: "/admin/kolekcije", label: "Kolekcije" },
  { href: "/admin/brendovi", label: "Brendovi" },
  { href: "/admin/velicine", label: "Velicine" },
  { href: "/admin/podesavanja", label: "Podesavanja" },
];

export const productTypes = [
  { value: "clothing", label: "Odeca" },
  { value: "footwear", label: "Obuca" },
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
