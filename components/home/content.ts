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
    leftTitle: {
      sr: "Tvoj stil.",
      en: "Your style.",
    },
    leftSubtitle: {
      sr: "Bez kopije. Bez buke.",
      en: "No copies. No noise.",
    },
    rightTitle: {
      sr: "Tvoj put.",
      en: "Your path.",
    },
    rightSubtitle: {
      sr: "Direktno do originala.",
      en: "Straight to the original.",
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
      href: "/o-nama",
      label: {
        sr: "Naš pristup",
        en: "Our approach",
      },
      ariaLabel: {
        sr: "Saznaj više o našem pristupu",
        en: "Learn more about our approach",
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
    leftTitle: {
      sr: "Budi originalan.",
      en: "Be original.",
    },
    leftSubtitle: {
      sr: "Bez hajpa, bez viška.",
      en: "No hype, no excess.",
    },
    rightTitle: {
      sr: "Nosi svoj standard.",
      en: "Wear your standard.",
    },
    rightSubtitle: {
      sr: "Čista selekcija. Jasan stav.",
      en: "Pure selection. Clear stance.",
    },
    ctaPrimary: {
      href: "/kolekcije/sunset-resort",
      label: {
        sr: "Istraži resort",
        en: "Explore resort",
      },
      ariaLabel: {
        sr: "Istraži Sunset resort kolekciju",
        en: "Explore the Sunset resort collection",
      },
    },
    ctaSecondary: {
      href: "/kolekcije",
      label: {
        sr: "Pogledaj sve",
        en: "View all",
      },
      ariaLabel: {
        sr: "Pogledaj sve kolekcije",
        en: "View all collections",
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
    leftTitle: {
      sr: "Ostavi trag.",
      en: "Leave a mark.",
    },
    leftSubtitle: {
      sr: "Tih, ali jasan.",
      en: "Quiet, but unmistakable.",
    },
    rightTitle: {
      sr: "Original traje.",
      en: "Original lasts.",
    },
    rightSubtitle: {
      sr: "Stvoren da ostane.",
      en: "Made to remain.",
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
      href: "/atelje/kontakt",
      label: {
        sr: "Zakaži kontakt",
        en: "Book contact",
      },
      ariaLabel: {
        sr: "Otvori kontakt stranicu",
        en: "Open the contact page",
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
