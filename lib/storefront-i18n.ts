export const STORE_LOCALES = ["sr", "en"] as const;

export type StoreLocale = (typeof STORE_LOCALES)[number];

export function isStoreLocale(value: string): value is StoreLocale {
  return STORE_LOCALES.includes(value as StoreLocale);
}

export function getLocaleFromPathname(pathname: string): StoreLocale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment === "en" ? "en" : "sr";
}

export function stripLocale(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "sr" || segments[0] === "en") {
    segments.shift();
  }
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

export function localizeHref(href: string, locale: StoreLocale) {
  if (
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href.startsWith("/api") ||
    href.startsWith("/admin") ||
    href.startsWith("/_next")
  ) {
    return href;
  }

  const [pathAndQuery, hash = ""] = href.split("#");
  const [pathname, query = ""] = pathAndQuery.split("?");
  const localizedPath = `/${locale}${stripLocale(pathname) === "/" ? "" : stripLocale(pathname)}`;
  return `${localizedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export const STORE_COPY = {
  sr: {
    common: {
      backToCatalog: "Nazad u katalog",
      catalog: "Katalog",
      contact: "Kontakt",
      home: "Početna",
      products: "Proizvodi",
      save: "Sačuvaj izmene",
      saving: "Čuvamo...",
    },
    about: {
      eyebrow: "The Original Way / Ko smo mi",
      title: "Originalna garderoba, donesena sa ukusom.",
      intro:
        "Butik za ljude koji ne žele da izgledaju kao algoritam. Biramo originalne evropske komade sa karakterom, dobrim krojem i jasnim poreklom.",
      statement: "Manje buke. Više stvarnog kvaliteta i komada koji traju duže od jedne sezone.",
      values: [
        ["Evropski izvor", "Komadi dolaze iz evropskih tokova robe, sa fokusom na originalnost, kroj i materijal."],
        ["Bez generike", "Ne gradimo ponudu na klasičnom reselling modelu. Biramo garderobu koja ima karakter i poreklo."],
        ["Kuriran izbor", "Svaki drop ostaje sužen i pregledan, da pravi komad pronađete bez beskrajnog skrolovanja."],
      ],
      sectionEyebrow: "Nije masovna priča",
      sectionTitle: "Biramo ono što ima razlog da bude na polici.",
      paragraphs: [
        "Kupovina garderobe lako sklizne u isti scenario: isti kroj, ista slika i ista roba pod novim nazivom. The Original Way ide drugim putem.",
        "Premium utisak za nas nije glasna etiketa, već čist izbor, pouzdan materijal i komad koji se uklapa u stvaran život.",
        "Zato katalog ostaje uredan, prozračan i kuriran. Manje buke, više sigurnog izbora.",
      ],
    },
    contact: {
      eyebrow: "Kontakt / The Original Way",
      title: "Tu smo za svaki ozbiljan upit.",
      intro:
        "Pitajte za veličinu, dostupnost, rezervaciju ili pomoć oko izbora. Odgovaramo direktno i bez komplikovanja.",
      direct: "Direktno",
      socials: "Društvene mreže",
      form: {
        name: "Ime",
        namePlaceholder: "Vaše ime",
        email: "Email",
        phone: "Telefon",
        message: "Poruka",
        messagePlaceholder: "Napišite koji komad, veličinu ili informaciju tražite.",
        submit: "Pošalji upit",
        idle: "Odgovaramo direktno na email ili poziv.",
        opened: "Otvaramo email klijent sa pripremljenom porukom.",
      },
    },
    catalog: {
      eyebrow: "The Original Way / Kurirana selekcija",
      title: "Proizvodi",
      intro: "Originalni komadi birani po kroju, materijalu i načinu na koji se nose.",
      filtered: "Prikaz je prilagođen izabranim filterima.",
      items: "Artikli",
      brands: "Brendovi",
      from: "Od",
      results: "Rezultati",
      productCount: "proizvoda",
      sorting: "Sortiranje",
      newest: "najnovije",
      priceAsc: "cena rastuće",
      priceDesc: "cena opadajuće",
      loading: "Filteri se učitavaju...",
      emptyTitle: "Nema poklapanja",
      emptyText: "Promenite veličinu, cenu, brend ili uklonite deo filtera.",
    },
    checkout: {
      eyebrow: "Sigurna i jednostavna porudžbina",
      title: "Dostava bez ponavljanja.",
      intro: "Unesite podatke jednom. Sa nalogom ih sledeći put dobijate automatski.",
    },
    profile: {
      eyebrow: "Moj nalog",
      title: "Profil i dostava",
      intro: "Sačuvajte kurirske podatke i sledeću porudžbinu završite brže.",
    },
    product: {
      reservation: "Rezervacija",
      confirmation: "Brza potvrda",
      delivery: "Pouzdana dostava",
      continue: "Nastavite pregled",
      similar: "Slični proizvodi",
      all: "Svi proizvodi",
    },
    footer: {
      tagline: "Originalna evropska garderoba, pažljivo izabrana za svakodnevni ritam.",
      shop: "Prodavnica",
      support: "Podrška",
      follow: "Pratite nas",
      legal: "Sva prava zadržana.",
      links: [
        ["Proizvodi", "/proizvodi"],
        ["Muškarci", "/proizvodi?gender=men"],
        ["Žene", "/proizvodi?gender=women"],
        ["O nama", "/o-nama"],
        ["Kontakt", "/kontakt"],
        ["Moj profil", "/profil"],
      ],
    },
  },
  en: {
    common: {
      backToCatalog: "Back to catalog",
      catalog: "Catalog",
      contact: "Contact",
      home: "Home",
      products: "Products",
      save: "Save changes",
      saving: "Saving...",
    },
    about: {
      eyebrow: "The Original Way / Our story",
      title: "Original fashion, brought together with taste.",
      intro:
        "A boutique for people who do not want to dress like an algorithm. We select original European pieces with character, considered cuts, and a clear point of view.",
      statement: "Less noise. More real quality and pieces made to outlive a single season.",
      values: [
        ["European source", "Pieces come through European supply channels, selected for authenticity, cut, and material."],
        ["Nothing generic", "We do not build the edit around anonymous reselling. Every piece needs character and provenance."],
        ["Curated choice", "Each drop stays focused and easy to browse, so the right piece does not hide in endless scrolling."],
      ],
      sectionEyebrow: "Not a mass-market story",
      sectionTitle: "We choose what deserves a place on the rail.",
      paragraphs: [
        "Fashion shopping easily becomes the same scene: the same cut, the same photo, and the same product under a new name. The Original Way takes another route.",
        "To us, premium is not a loud label. It is a clean edit, reliable material, and a piece that belongs in real life.",
        "That is why the catalog remains calm, spacious, and curated. Less noise, more confident choices.",
      ],
    },
    contact: {
      eyebrow: "Contact / The Original Way",
      title: "Here for every considered question.",
      intro:
        "Ask about sizing, availability, reservations, or help choosing. We answer directly and keep it simple.",
      direct: "Direct",
      socials: "Social",
      form: {
        name: "Name",
        namePlaceholder: "Your name",
        email: "Email",
        phone: "Phone",
        message: "Message",
        messagePlaceholder: "Tell us which piece, size, or information you need.",
        submit: "Send inquiry",
        idle: "We reply directly by email or phone.",
        opened: "Opening your email app with a prepared message.",
      },
    },
    catalog: {
      eyebrow: "The Original Way / Curated selection",
      title: "Products",
      intro: "Original pieces selected for cut, material, and the way they live in a wardrobe.",
      filtered: "The selection reflects your active filters.",
      items: "Items",
      brands: "Brands",
      from: "From",
      results: "Results",
      productCount: "products",
      sorting: "Sorting",
      newest: "newest",
      priceAsc: "price ascending",
      priceDesc: "price descending",
      loading: "Loading filters...",
      emptyTitle: "No matches",
      emptyText: "Change the size, price, brand, or remove some filters.",
    },
    checkout: {
      eyebrow: "A secure, simple order",
      title: "Delivery without repetition.",
      intro: "Enter your details once. With an account, they are ready for your next order.",
    },
    profile: {
      eyebrow: "My account",
      title: "Profile and delivery",
      intro: "Save your courier details and complete the next order faster.",
    },
    product: {
      reservation: "Reservation",
      confirmation: "Fast confirmation",
      delivery: "Reliable delivery",
      continue: "Continue browsing",
      similar: "Similar products",
      all: "All products",
    },
    footer: {
      tagline: "Original European fashion, carefully selected for an everyday rhythm.",
      shop: "Shop",
      support: "Support",
      follow: "Follow",
      legal: "All rights reserved.",
      links: [
        ["Products", "/proizvodi"],
        ["Men", "/proizvodi?gender=men"],
        ["Women", "/proizvodi?gender=women"],
        ["Our story", "/o-nama"],
        ["Contact", "/kontakt"],
        ["My profile", "/profil"],
      ],
    },
  },
} as const;

export type StoreCopy = (typeof STORE_COPY)[StoreLocale];
