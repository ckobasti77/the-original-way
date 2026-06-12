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
