import type { Language } from "@/components/settings-provider";

export type LocalizedText = Record<Language, string>;

export type ActionLink = {
  ariaLabel: LocalizedText;
  href: string;
  label: LocalizedText;
};

export type Chapter = {
  ctaPrimary: ActionLink;
  ctaSecondary: ActionLink;
  eyebrow: LocalizedText;
  frame: number;
  id: string;
  leftSubtitle?: LocalizedText;
  leftTitle: LocalizedText;
  rightSubtitle?: LocalizedText;
  rightTitle: LocalizedText;
};

export type NavItem = {
  ariaLabel: LocalizedText;
  description: LocalizedText;
  href: string;
  label: LocalizedText;
};

export type NavGroup = {
  href: string;
  items: NavItem[];
  label: LocalizedText;
};

export type NavLinkItem = {
  type: "simple" | "dropdown";
  label: LocalizedText;
  href: string;
  items?: NavItem[];
};

export const BRAND_NAME = "The Original Way";

export const NAV_LINKS: NavLinkItem[] = [
  {
    type: "simple",
    label: {
      sr: "Početna",
      en: "Home",
    },
    href: "/",
  },
  {
    type: "simple",
    label: {
      sr: "Ko smo mi?",
      en: "Who we are",
    },
    href: "/o-nama",
  },
  {
    type: "dropdown",
    label: {
      sr: "Kolekcije",
      en: "Collections",
    },
    href: "/proizvodi",
    items: [
      {
        href: "/proizvodi?collection=alpska-kapsula",
        label: {
          sr: "Zimska kolekcija",
          en: "Winter collection",
        },
        description: {
          sr: "Strukturni kaputi, topla pletiva i premium obuća krojeni za niske temperature.",
          en: "Structured coats, warm knitwear, and premium footwear tailored for low temperatures.",
        },
        ariaLabel: {
          sr: "Otvori zimsku kolekciju",
          en: "Open the winter collection",
        },
      },
      {
        href: "/proizvodi?collection=sunset-resort",
        label: {
          sr: "Letnja kolekcija",
          en: "Summer collection",
        },
        description: {
          sr: "Laki laneni krojevi, prozračni materijali i udobna letnja obuća.",
          en: "Light linen cuts, breathable fabrics, and comfortable summer footwear.",
        },
        ariaLabel: {
          sr: "Otvori letnju kolekciju",
          en: "Open the summer collection",
        },
      },
      {
        href: "/proizvodi?collection=after-dark",
        label: {
          sr: "Casual kolekcija",
          en: "Casual collection",
        },
        description: {
          sr: "Moderna ležerna garderoba i urban dizajn za svakodnevni stil i udobnost.",
          en: "Modern casual apparel and urban design for everyday style and comfort.",
        },
        ariaLabel: {
          sr: "Otvori casual kolekciju",
          en: "Open the casual collection",
        },
      },
    ],
  },
  {
    type: "dropdown",
    label: {
      sr: "Muškarci",
      en: "Men",
    },
    href: "/proizvodi?gender=men",
    items: [
      {
        href: "/proizvodi?gender=men&collection=alpska-kapsula",
        label: {
          sr: "Zimska kolekcija",
          en: "Winter collection",
        },
        description: {
          sr: "Strukturni muški slojevi za otpornost, toplotu i hladne dane.",
          en: "Structured men's layers built for resilience, warmth, and colder days.",
        },
        ariaLabel: {
          sr: "Otvori mušku zimsku kolekciju",
          en: "Open men's winter collection",
        },
      },
      {
        href: "/proizvodi?gender=men&collection=sunset-resort",
        label: {
          sr: "Letnja kolekcija",
          en: "Summer collection",
        },
        description: {
          sr: "Muški tečni krojevi i prozračni lan za tople letnje dane.",
          en: "Men's fluid cuts and breathable linen for warm summer days.",
        },
        ariaLabel: {
          sr: "Otvori mušku letnju kolekciju",
          en: "Open men's summer collection",
        },
      },
      {
        href: "/proizvodi?gender=men&collection=after-dark",
        label: {
          sr: "Casual kolekcija",
          en: "Casual collection",
        },
        description: {
          sr: "Muška ležerna uniforma za svakodnevni komfor i opušten stil.",
          en: "Men's casual uniform for daily comfort and relaxed style.",
        },
        ariaLabel: {
          sr: "Otvori mušku casual kolekciju",
          en: "Open men's casual collection",
        },
      },
    ],
  },
  {
    type: "dropdown",
    label: {
      sr: "Žene",
      en: "Women",
    },
    href: "/proizvodi?gender=women",
    items: [
      {
        href: "/proizvodi?gender=women&collection=alpska-kapsula",
        label: {
          sr: "Zimska kolekcija",
          en: "Winter collection",
        },
        description: {
          sr: "Ženski strukturni kaputi i pletiva za visoku zaštitu i toplotu.",
          en: "Women's structured coats and knitwear for high protection and warmth.",
        },
        ariaLabel: {
          sr: "Otvori žensku zimsku kolekciju",
          en: "Open women's winter collection",
        },
      },
      {
        href: "/proizvodi?gender=women&collection=sunset-resort",
        label: {
          sr: "Letnja kolekcija",
          en: "Summer collection",
        },
        description: {
          sr: "Ženske svilene i lanene siluete za tople letnje dane.",
          en: "Women's silk and linen silhouettes for warm summer days.",
        },
        ariaLabel: {
          sr: "Otvori žensku letnju kolekciju",
          en: "Open women's summer collection",
        },
      },
      {
        href: "/proizvodi?gender=women&collection=after-dark",
        label: {
          sr: "Casual kolekcija",
          en: "Casual collection",
        },
        description: {
          sr: "Ženska minimalistička ležerna odela i haljine za svaki dan.",
          en: "Women's minimalist casual suits and dresses for everyday wear.",
        },
        ariaLabel: {
          sr: "Otvori žensku casual kolekciju",
          en: "Open women's casual collection",
        },
      },
    ],
  },
  {
    type: "simple",
    label: {
      sr: "Kontakt",
      en: "Contact",
    },
    href: "/kontakt",
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "alpine",
    frame: 122,
    eyebrow: {
      sr: "POGLAVLJE 01 / ZIMSKI STIL",
      en: "CHAPTER 01 / WINTER STYLE",
    },
    leftTitle: {
      sr: "Zimska toplina.",
      en: "Winter warmth.",
    },
    leftSubtitle: {
      sr: "Jakne koje nosiš godinama.",
      en: "Jackets you wear for years.",
    },
    rightTitle: {
      sr: "Siguran korak.",
      en: "Confident step.",
    },
    rightSubtitle: {
      sr: "Duboke patike i cipele za avanture.",
      en: "High-top sneakers and shoes for adventures.",
    },
    ctaPrimary: {
      href: "/proizvodi?collection=alpska-kapsula",
      label: {
        sr: "Zimska kolekcija",
        en: "Winter collection",
      },
      ariaLabel: {
        sr: "Otvori zimsku kolekciju",
        en: "Open the winter collection",
      },
    },
    ctaSecondary: {
      href: "/kontakt",
      label: {
        sr: "Kontakt",
        en: "Contact",
      },
      ariaLabel: {
        sr: "Kontaktirajte nas za više informacija",
        en: "Contact us for more information",
      },
    },
  },
  {
    id: "resort",
    frame: 183,
    eyebrow: {
      sr: "POGLAVLJE 02 / LETNJI KROJEVI",
      en: "CHAPTER 02 / SUMMER CUTS",
    },
    leftTitle: {
      sr: "Letnja svežina.",
      en: "Summer freshness.",
    },
    leftSubtitle: {
      sr: "Laki i kvalitetni materijali za vruće dane.",
      en: "Lightweight and quality fabrics for hot days.",
    },
    rightTitle: {
      sr: "Lagana udobnost.",
      en: "Lightweight comfort.",
    },
    rightSubtitle: {
      sr: "Ultra lake patike koje ne osećaš.",
      en: "Ultra-lightweight sneakers you won't even feel.",
    },
    ctaPrimary: {
      href: "/proizvodi?collection=sunset-resort",
      label: {
        sr: "Letnja kolekcija",
        en: "Summer collection",
      },
      ariaLabel: {
        sr: "Otvori letnju kolekciju",
        en: "Open the summer collection",
      },
    },
    ctaSecondary: {
      href: "/kontakt",
      label: {
        sr: "Kontakt",
        en: "Contact",
      },
      ariaLabel: {
        sr: "Kontaktirajte nas za više informacija",
        en: "Contact us for more information",
      },
    },
  },
  {
    id: "after-dark",
    frame: 245,
    eyebrow: {
      sr: "POGLAVLJE 03 / CASUAL STIL",
      en: "CHAPTER 03 / CASUAL STYLE",
    },
    leftTitle: {
      sr: "Casual udobnost.",
      en: "Casual comfort.",
    },
    leftSubtitle: {
      sr: "Garderoba krojena za tvoj svakodnevni ritam.",
      en: "Apparel tailored for your everyday rhythm.",
    },
    rightTitle: {
      sr: "Urbani ritam.",
      en: "Urban rhythm.",
    },
    rightSubtitle: {
      sr: "Moderna obuća za slobodan i dinamičan pokret.",
      en: "Modern footwear for free and dynamic movement.",
    },
    ctaPrimary: {
      href: "/proizvodi?collection=after-dark",
      label: {
        sr: "Casual kolekcija",
        en: "Casual collection",
      },
      ariaLabel: {
        sr: "Otvori casual kolekciju",
        en: "Open the casual collection",
      },
    },
    ctaSecondary: {
      href: "/kontakt",
      label: {
        sr: "Kontakt",
        en: "Contact",
      },
      ariaLabel: {
        sr: "Kontaktirajte nas za više informacija",
        en: "Contact us for more information",
      },
    },
  },
];

export const UI_COPY = {
  sr: {
    chapter: "Poglavlje",
    closeMenu: "Zatvori meni",
    desktopNavigation: "Glavna navigacija",
    cart: "Korpa",
    jumpToChapter: "Idi na poglavlje",
    language: "Jezik",
    light: "Svetla",
    dark: "Tamna",
    menu: "Meni",
    mobileNavigation: "Mobilna navigacija",
    openMenu: "Otvori meni",
    profile: "Profil",
    profileCta: "Moj profil",
    profileDescription: "Nalog, adrese i porudzbine.",
    loginCta: "Prijava",
    search: "Pretraga",
    storyHint: "Skroluj, prevuci ili koristi strelice za sledeće poglavlje.",
    storyNavigation: "Navigacija kroz poglavlja",
    switchToDark: "Prebaci na tamnu temu",
    switchToEnglish: "Prebaci na engleski jezik",
    switchToLight: "Prebaci na svetlu temu",
    switchToSerbian: "Prebaci na srpski jezik",
    theme: "Tema",
  },
  en: {
    chapter: "Chapter",
    closeMenu: "Close menu",
    desktopNavigation: "Primary navigation",
    cart: "Cart",
    jumpToChapter: "Jump to chapter",
    language: "Language",
    light: "Light",
    dark: "Dark",
    menu: "Menu",
    mobileNavigation: "Mobile navigation",
    openMenu: "Open menu",
    profile: "Profile",
    profileCta: "My profile",
    profileDescription: "Account, addresses, and orders.",
    loginCta: "Login",
    search: "Search",
    storyHint: "Scroll, swipe, or use arrow keys for the next chapter.",
    storyNavigation: "Chapter navigation",
    switchToDark: "Switch to dark theme",
    switchToEnglish: "Switch to English",
    switchToLight: "Switch to light theme",
    switchToSerbian: "Switch to Serbian",
    theme: "Theme",
  },
} as const;

export type CuratedTrustIcon = "medal" | "truck" | "shield" | "return";

export const CURATED_COLLECTIONS_COPY = {
  sr: {
    eyebrow: "Izabrano za tebe",
    titleLines: ["Kolekcije", "koje traju."],
    description: "Obuca, garderoba i detalji birani za svakodnevni ritam.",
    primaryCta: {
      href: "/proizvodi",
      label: "Pogledaj kolekcije",
      ariaLabel: "Pogledaj sve kolekcije",
    },
    secondaryCta: {
      href: "/kontakt",
      label: "Kontakt",
      ariaLabel: "Kontaktirajte The Original Way",
    },
    heroAlt:
      "Model u svetloplavoj jakni i maslinastoj trenerci ispred betonskog zida",
    categoryAriaPrefix: "Otvori kategoriju",
    tiles: {
      footwear: {
        alt: "Nike patike sa teksturisanim gornjistem i vidljivim vazdusnim jastucima",
        label: "Obuca",
      },
      apparel: {
        alt: "Svetloplava Parajumpers jakna sa narandzastim detaljima",
        label: "Garderoba",
      },
      casual: {
        alt: "Maslinasta trenerka sa zutim pertlama i crnim grafikom",
        label: "Casual",
      },
    },
    trustItems: [
      {
        detail: "100% autenticno",
        icon: "medal" as CuratedTrustIcon,
        title: "Originalni proizvodi",
      },
      {
        detail: "1-3 radna dana",
        icon: "truck" as CuratedTrustIcon,
        title: "Brza dostava",
      },
      {
        detail: "Zastita i bezbednost",
        icon: "shield" as CuratedTrustIcon,
        title: "Sigurna kupovina",
      },
      {
        detail: "Bez komplikacija",
        icon: "return" as CuratedTrustIcon,
        title: "Lako vracanje",
      },
    ],
  },
  en: {
    eyebrow: "Curated for you",
    titleLines: ["Collections", "made to last."],
    description: "Footwear, apparel, and details selected for everyday rhythm.",
    primaryCta: {
      href: "/proizvodi",
      label: "View collections",
      ariaLabel: "View all collections",
    },
    secondaryCta: {
      href: "/kontakt",
      label: "Contact",
      ariaLabel: "Contact The Original Way",
    },
    heroAlt:
      "Model in a light blue jacket and olive tracksuit in front of a concrete wall",
    categoryAriaPrefix: "Open category",
    tiles: {
      footwear: {
        alt: "Nike sneakers with a textured upper and visible air cushioning",
        label: "Footwear",
      },
      apparel: {
        alt: "Light blue Parajumpers jacket with orange details",
        label: "Apparel",
      },
      casual: {
        alt: "Olive tracksuit with yellow laces and a black graphic",
        label: "Casual",
      },
    },
    trustItems: [
      {
        detail: "100% authentic",
        icon: "medal" as CuratedTrustIcon,
        title: "Original products",
      },
      {
        detail: "1-3 business days",
        icon: "truck" as CuratedTrustIcon,
        title: "Fast delivery",
      },
      {
        detail: "Protected checkout",
        icon: "shield" as CuratedTrustIcon,
        title: "Secure shopping",
      },
      {
        detail: "No complications",
        icon: "return" as CuratedTrustIcon,
        title: "Easy returns",
      },
    ],
  },
} as const;

export const HOME_CONVERSION_COPY = {
  sr: {
    featured: {
      eyebrow: "Najtrazeniji izbor",
      title: "Komadi koji najbrze zatvaraju dilemu.",
      description:
        "Tri jasna ulaza u katalog: toplo, lagano i svakodnevno. Svaki vodi direktno u filtere koji skrate izbor.",
      primaryCta: "Otvori katalog",
      secondaryCta: "Pitaj za velicinu",
      cards: [
        {
          accent: "Zimski slojevi",
          cta: "Pogledaj zimu",
          href: "/proizvodi?collection=alpska-kapsula",
          kicker: "Kaputi / pletiva / obuca",
          title: "Toplina bez teskog izgleda.",
        },
        {
          accent: "Letnji ritam",
          cta: "Pogledaj leto",
          href: "/proizvodi?collection=sunset-resort",
          kicker: "Lan / lagani krojevi / patike",
          title: "Cisto, prozracno, spremno za dan.",
        },
        {
          accent: "Casual edit",
          cta: "Pogledaj casual",
          href: "/proizvodi?collection=after-dark",
          kicker: "Trenerke / majice / urbana obuca",
          title: "Udobnost koja i dalje izgleda uredno.",
        },
      ],
    },
    proof: {
      eyebrow: "Kupovina bez dileme",
      title: "Manje pitanja pre porudzbine, vise sigurnosti posle nje.",
      description:
        "Kupac mora brzo da zna sta dobija, koliko ceka i kome se javlja ako treba pomoc.",
      stats: [
        { label: "Dostava", value: "1-3 dana" },
        { label: "Poreklo", value: "EU izbor" },
        { label: "Podrska", value: "Direktno" },
      ],
      benefits: [
        {
          title: "Provera pre slanja",
          text: "Svaki komad prolazi vizuelnu proveru pre pakovanja.",
        },
        {
          title: "Pomoc oko velicine",
          text: "Ako si izmedju dve velicine, posalji poruku pre kupovine.",
        },
        {
          title: "Jasan kontakt",
          text: "Telefon, email i social kanali su dostupni bez trazenja.",
        },
      ],
      quote:
        "Najbolji kompliment nije glasna etiketa, vec komad koji se uklopi odmah i nosi dugo.",
      quoteByline: "The Original Way standard",
    },
    finalCta: {
      eyebrow: "Pre porudzbine",
      title: "Brzi odgovori za laksi izbor.",
      description:
        "Ako znas sta trazis, idi direktno u katalog. Ako nisi siguran, posalji upit i dobij preporuku pre kupovine.",
      primaryCta: "Pogledaj proizvode",
      secondaryCta: "Kontakt",
      faqs: [
        {
          answer:
            "Najcesce 1-3 radna dana nakon potvrde porudzbine, u zavisnosti od adrese i dostupnosti.",
          question: "Koliko traje dostava?",
        },
        {
          answer:
            "Da. Fokus je na originalnim komadima i proveri artikala pre slanja.",
          question: "Da li su proizvodi originalni?",
        },
        {
          answer:
            "Najbrze je da posaljes poruku sa visinom, tezinom i komadom koji gledas.",
          question: "Kako biram velicinu?",
        },
      ],
    },
    footer: {
      tagline:
        "Kuriran izbor originalne garderobe, obuce i detalja za ljude koji zele manje buke i vise stvarnog kvaliteta.",
      shopHeading: "Katalog",
      supportHeading: "Podrska",
      socialHeading: "Social",
      contactHeading: "Direktno",
      legal: "Sva prava zadrzana.",
      links: [
        { href: "/proizvodi", label: "Svi proizvodi" },
        { href: "/proizvodi?gender=men", label: "Muskarci" },
        { href: "/proizvodi?gender=women", label: "Zene" },
        { href: "/o-nama", label: "Ko smo mi" },
        { href: "/kontakt", label: "Kontakt" },
        { href: "/prijava", label: "Prijava" },
      ],
    },
  },
  en: {
    featured: {
      eyebrow: "Most wanted picks",
      title: "Pieces that shorten the decision.",
      description:
        "Three clear ways into the catalog: warm, light, and everyday. Each one opens a filtered edit.",
      primaryCta: "Open catalog",
      secondaryCta: "Ask about sizing",
      cards: [
        {
          accent: "Winter layers",
          cta: "Shop winter",
          href: "/proizvodi?collection=alpska-kapsula",
          kicker: "Coats / knitwear / footwear",
          title: "Warmth without a heavy look.",
        },
        {
          accent: "Summer rhythm",
          cta: "Shop summer",
          href: "/proizvodi?collection=sunset-resort",
          kicker: "Linen / light cuts / sneakers",
          title: "Clean, breathable, ready for the day.",
        },
        {
          accent: "Casual edit",
          cta: "Shop casual",
          href: "/proizvodi?collection=after-dark",
          kicker: "Tracksuits / tees / urban footwear",
          title: "Comfort that still looks considered.",
        },
      ],
    },
    proof: {
      eyebrow: "Shopping without doubt",
      title: "Fewer questions before checkout, more confidence after it.",
      description:
        "A buyer should quickly know what they get, how long they wait, and who to contact when they need help.",
      stats: [
        { label: "Delivery", value: "1-3 days" },
        { label: "Source", value: "EU edit" },
        { label: "Support", value: "Direct" },
      ],
      benefits: [
        {
          title: "Checked before shipping",
          text: "Every piece gets a visual check before packing.",
        },
        {
          title: "Sizing help",
          text: "If you are between sizes, send a message before ordering.",
        },
        {
          title: "Clear contact",
          text: "Phone, email, and social channels are available without hunting.",
        },
      ],
      quote:
        "The best compliment is not a loud label, but a piece that fits immediately and wears for years.",
      quoteByline: "The Original Way standard",
    },
    finalCta: {
      eyebrow: "Before you order",
      title: "Quick answers for an easier choice.",
      description:
        "If you know what you want, go straight to the catalog. If not, send a request and get a recommendation first.",
      primaryCta: "View products",
      secondaryCta: "Contact",
      faqs: [
        {
          answer:
            "Usually 1-3 business days after order confirmation, depending on address and availability.",
          question: "How long does delivery take?",
        },
        {
          answer:
            "Yes. The focus is original products and item checks before shipping.",
          question: "Are the products authentic?",
        },
        {
          answer:
            "Send your height, weight, and the piece you are considering for the quickest recommendation.",
          question: "How do I choose a size?",
        },
      ],
    },
    footer: {
      tagline:
        "A curated selection of original apparel, footwear, and details for people who want less noise and more real quality.",
      shopHeading: "Catalog",
      supportHeading: "Support",
      socialHeading: "Social",
      contactHeading: "Direct",
      legal: "All rights reserved.",
      links: [
        { href: "/proizvodi", label: "All products" },
        { href: "/proizvodi?gender=men", label: "Men" },
        { href: "/proizvodi?gender=women", label: "Women" },
        { href: "/o-nama", label: "Who we are" },
        { href: "/kontakt", label: "Contact" },
        { href: "/prijava", label: "Login" },
      ],
    },
  },
} as const;
