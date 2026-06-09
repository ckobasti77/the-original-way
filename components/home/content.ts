import type { Language } from "@/components/settings-provider";

export type LocalizedText = Record<Language, string>;

export type ActionLink = {
  ariaLabel: LocalizedText;
  href: string;
  label: LocalizedText;
};

export type Chapter = {
  body: LocalizedText;
  ctaPrimary: ActionLink;
  ctaSecondary: ActionLink;
  eyebrow: LocalizedText;
  frame: number;
  id: string;
  note: LocalizedText;
  title: LocalizedText;
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
    href: "/kolekcije",
    items: [
      {
        href: "/kolekcije/alpska-kapsula",
        label: {
          sr: "Alpska kapsula",
          en: "Alpine capsule",
        },
        description: {
          sr: "Strukturni slojevi krojeni za otpornost i čistu estetiku na visinama.",
          en: "Structured layers tailored for resilience and clean aesthetics at high altitudes.",
        },
        ariaLabel: {
          sr: "Otvori Alpska kapsula kolekciju",
          en: "Open the Alpine capsule collection",
        },
      },
      {
        href: "/kolekcije/sunset-resort",
        label: {
          sr: "Sunset resort",
          en: "Sunset resort",
        },
        description: {
          sr: "Tečni krojevi i prozračni materijali stvoreni za prelazne trenutke i topla podneblja.",
          en: "Fluid cuts and breathable fabrics designed for transitional moments and warmer climates.",
        },
        ariaLabel: {
          sr: "Otvori Sunset resort kolekciju",
          en: "Open the Sunset resort collection",
        },
      },
      {
        href: "/kolekcije/after-dark",
        label: {
          sr: "After dark",
          en: "After dark",
        },
        description: {
          sr: "Minimalistička večernja uniforma koja spaja prigušeni sjaj i arhitektonski kroj.",
          en: "A minimalist evening uniform merging muted luster with architectural tailoring.",
        },
        ariaLabel: {
          sr: "Otvori After dark kolekciju",
          en: "Open the After dark collection",
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
    href: "/kolekcije/muskarci",
    items: [
      {
        href: "/kolekcije/muskarci/alpska-kapsula",
        label: {
          sr: "Alpska kapsula",
          en: "Alpine capsule",
        },
        description: {
          sr: "Strukturni muški slojevi za visinu, otpornost i hladne dane.",
          en: "Structured men's layers built for altitude, resilience, and colder days.",
        },
        ariaLabel: {
          sr: "Otvori mušku Alpsku kapsulu",
          en: "Open men's Alpine capsule",
        },
      },
      {
        href: "/kolekcije/muskarci/sunset-resort",
        label: {
          sr: "Sunset resort",
          en: "Sunset resort",
        },
        description: {
          sr: "Muški tečni krojevi i prozračni lan za tople destinacije.",
          en: "Men's fluid cuts and breathable linen for warm destinations.",
        },
        ariaLabel: {
          sr: "Otvori muški Sunset resort",
          en: "Open men's Sunset resort",
        },
      },
      {
        href: "/kolekcije/muskarci/after-dark",
        label: {
          sr: "After dark",
          en: "After dark",
        },
        description: {
          sr: "Muška večernja uniforma sa prigušenim sjajem i oštrim krojem.",
          en: "Men's evening uniform with a muted sheen and sharp tailoring.",
        },
        ariaLabel: {
          sr: "Otvori muški After dark",
          en: "Open men's After dark",
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
    href: "/kolekcije/zene",
    items: [
      {
        href: "/kolekcije/zene/alpska-kapsula",
        label: {
          sr: "Alpska kapsula",
          en: "Alpine capsule",
        },
        description: {
          sr: "Ženski strukturni kaputi i pletiva za visoku zaštitu i čiste linije.",
          en: "Women's structured coats and knitwear for high protection and clean lines.",
        },
        ariaLabel: {
          sr: "Otvori žensku Alpsku kapsulu",
          en: "Open women's Alpine capsule",
        },
      },
      {
        href: "/kolekcije/zene/sunset-resort",
        label: {
          sr: "Sunset resort",
          en: "Sunset resort",
        },
        description: {
          sr: "Ženske svilene i lanene siluete za prelazne i tople dane.",
          en: "Women's silk and linen silhouettes for transitional and warm days.",
        },
        ariaLabel: {
          sr: "Otvori ženski Sunset resort",
          en: "Open women's Sunset resort",
        },
      },
      {
        href: "/kolekcije/zene/after-dark",
        label: {
          sr: "After dark",
          en: "After dark",
        },
        description: {
          sr: "Ženska minimalistička večernja odela i haljine sa tihim sjajem.",
          en: "Women's minimalist evening suits and dresses with a quiet luster.",
        },
        ariaLabel: {
          sr: "Otvori ženski After dark",
          en: "Open women's After dark",
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
    href: "/atelje/kontakt",
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "alpine",
    frame: 122,
    eyebrow: {
      sr: "POGLAVLJE 01 / AUTENTIČNOST",
      en: "CHAPTER 01 / AUTHENTICITY",
    },
    note: {
      sr: "Čisto poreklo",
      en: "Pure origin",
    },
    title: {
      sr: "Zaboravite preprodavce. Dobrodošli u izvor.",
      en: "Forget the resellers. Welcome to the source.",
    },
    body: {
      sr: "Svaki komad u našoj selekciji dolazi direktno iz ateljea kreatora. Bez posrednika, bez sumnje, bez kompromisa. Samo čista originalnost namenjena onima koji znaju razliku.",
      en: "Every piece in our selection comes directly from the creators' ateliers. No middlemen, no doubt, no compromises. Just pure originality meant for those who know the difference.",
    },
    ctaPrimary: {
      href: "/kolekcije/alpska-kapsula",
      label: {
        sr: "Otvori kolekciju",
        en: "Open collection",
      },
      ariaLabel: {
        sr: "Otvori Alpska kapsula kolekciju",
        en: "Open the Alpine capsule collection",
      },
    },
    ctaSecondary: {
      href: "/atelje/saveti",
      label: {
        sr: "Stilske beleske",
        en: "Styling notes",
      },
      ariaLabel: {
        sr: "Otvori stilske beleske za alpsku kolekciju",
        en: "Open styling notes for the alpine collection",
      },
    },
  },
  {
    id: "resort",
    frame: 183,
    eyebrow: {
      sr: "POGLAVLJE 02 / STANDARD",
      en: "CHAPTER 02 / THE STANDARD",
    },
    note: {
      sr: "Bez hajpa. Samo vrednost.",
      en: "Beyond hype. Just value.",
    },
    title: {
      sr: "Tamo gde prestaje preprodaja, počinje stil.",
      en: "Where reselling ends, style begins.",
    },
    body: {
      sr: "Dok drugi trguju trendovima po naduvanim cenama, mi donosimo trajne originale u njihovom najčistijem obliku. Arhivski komadi sa sopstvenom istorijom, verifikovani u korenima.",
      en: "While others trade trends at inflated prices, we deliver lasting originals in their purest form. Archival pieces with their own history, verified at the roots.",
    },
    ctaPrimary: {
      href: "/kolekcije/sunset-resort",
      label: {
        sr: "Istrazi resort",
        en: "Explore resort",
      },
      ariaLabel: {
        sr: "Istrazi Sunset resort kolekciju",
        en: "Explore the Sunset resort collection",
      },
    },
    ctaSecondary: {
      href: "/uvodnici/linija-svetla",
      label: {
        sr: "Linija svetla",
        en: "Line of light",
      },
      ariaLabel: {
        sr: "Otvori uvodnik Linija svetla",
        en: "Open the Line of light editorial",
      },
    },
  },
  {
    id: "after-dark",
    frame: 245,
    eyebrow: {
      sr: "POGLAVLJE 03 / FILOZOFIJA",
      en: "CHAPTER 03 / THE PHILOSOPHY",
    },
    note: {
      sr: "Trajni utisak",
      en: "Lasting impression",
    },
    title: {
      sr: "Originalni put je jedini put.",
      en: "The original way is the only way.",
    },
    body: {
      sr: "Luksuz nije u ceni preprodaje, već u istini dizajna. Otkrijte autentične siluete stvorene da traju i nose karakter koji se ne može kopirati.",
      en: "Luxury is not in the resale price, but in the truth of design. Discover authentic silhouettes created to last, bearing a character that cannot be replicated.",
    },
    ctaPrimary: {
      href: "/kolekcije/after-dark",
      label: {
        sr: "Pogledaj finale",
        en: "View the finale",
      },
      ariaLabel: {
        sr: "Pogledaj After dark finale kolekcije",
        en: "View the After dark collection finale",
      },
    },
    ctaSecondary: {
      href: "/uvodnici/nocni-kadar",
      label: {
        sr: "Nocni kadar",
        en: "Night frame",
      },
      ariaLabel: {
        sr: "Otvori uvodnik Nocni kadar",
        en: "Open the Night frame editorial",
      },
    },
  },
];

export const UI_COPY = {
  sr: {
    chapter: "Poglavlje",
    closeMenu: "Zatvori meni",
    desktopNavigation: "Glavna navigacija",
    jumpToChapter: "Idi na poglavlje",
    language: "Jezik",
    light: "Svetla",
    dark: "Tamna",
    menu: "Meni",
    mobileNavigation: "Mobilna navigacija",
    openMenu: "Otvori meni",
    storyHint: "Skroluj, prevuci ili koristi strelice za sledece poglavlje.",
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
    jumpToChapter: "Jump to chapter",
    language: "Language",
    light: "Light",
    dark: "Dark",
    menu: "Menu",
    mobileNavigation: "Mobile navigation",
    openMenu: "Open menu",
    storyHint: "Scroll, swipe, or use arrow keys for the next chapter.",
    storyNavigation: "Chapter navigation",
    switchToDark: "Switch to dark theme",
    switchToEnglish: "Switch to English",
    switchToLight: "Switch to light theme",
    switchToSerbian: "Switch to Serbian",
    theme: "Theme",
  },
} as const;
