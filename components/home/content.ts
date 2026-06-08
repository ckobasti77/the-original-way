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

export const BRAND_NAME = "The Original Way";

export const NAV_GROUPS: NavGroup[] = [
  {
    href: "/kolekcije",
    label: {
      sr: "Kolekcije",
      en: "Collections",
    },
    items: [
      {
        href: "/kolekcije/alpska-kapsula",
        label: {
          sr: "Alpska kapsula",
          en: "Alpine capsule",
        },
        description: {
          sr: "Slojevi za visinu, vetar i cistu liniju.",
          en: "Layering built for altitude, wind, and a clear line.",
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
          sr: "Laki tonovi i putna silueta za toplu promenu.",
          en: "Lightweight tones and travel silhouettes for warmer air.",
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
          sr: "Nocna urbana uniforma sa tihim sjajem.",
          en: "An urban night uniform with a quiet shine.",
        },
        ariaLabel: {
          sr: "Otvori After dark kolekciju",
          en: "Open the After dark collection",
        },
      },
    ],
  },
  {
    href: "/uvodnici",
    label: {
      sr: "Uvodnici",
      en: "Editorials",
    },
    items: [
      {
        href: "/uvodnici/prvi-uspon",
        label: {
          sr: "Prvi uspon",
          en: "First ascent",
        },
        description: {
          sr: "Vizuelni dnevnik poglavlja iznad snega.",
          en: "A visual journal from the chapter above the snowline.",
        },
        ariaLabel: {
          sr: "Otvori uvodnik Prvi uspon",
          en: "Open the First ascent editorial",
        },
      },
      {
        href: "/uvodnici/linija-svetla",
        label: {
          sr: "Linija svetla",
          en: "Line of light",
        },
        description: {
          sr: "Kadar izmedju obale, vetra i suncanog ruba.",
          en: "A study between shoreline, wind, and the edge of sunlight.",
        },
        ariaLabel: {
          sr: "Otvori uvodnik Linija svetla",
          en: "Open the Line of light editorial",
        },
      },
      {
        href: "/uvodnici/nocni-kadar",
        label: {
          sr: "Nocni kadar",
          en: "Night frame",
        },
        description: {
          sr: "Grad, neon i tamni plet kao zavrsna scena.",
          en: "City, neon, and dark knitwear as the closing scene.",
        },
        ariaLabel: {
          sr: "Otvori uvodnik Nocni kadar",
          en: "Open the Night frame editorial",
        },
      },
    ],
  },
  {
    href: "/atelje",
    label: {
      sr: "Atelje",
      en: "Atelier",
    },
    items: [
      {
        href: "/atelje/termin",
        label: {
          sr: "Privatni termin",
          en: "Private appointment",
        },
        description: {
          sr: "Rezervisi mirno vodjenje kroz celu pricu kolekcije.",
          en: "Reserve a guided walk through the full collection story.",
        },
        ariaLabel: {
          sr: "Rezervisi privatni termin",
          en: "Reserve a private appointment",
        },
      },
      {
        href: "/atelje/saveti",
        label: {
          sr: "Saveti za stil",
          en: "Styling notes",
        },
        description: {
          sr: "Kombinacije slojeva, tekstura i putnih proporcija.",
          en: "Layering, texture, and travel proportion guidance.",
        },
        ariaLabel: {
          sr: "Otvori savete za stil",
          en: "Open styling notes",
        },
      },
      {
        href: "/atelje/kontakt",
        label: {
          sr: "Kontakt",
          en: "Contact",
        },
        description: {
          sr: "Pitaj za velicine, dostupnost i posebne narudzbine.",
          en: "Ask about sizing, availability, and custom requests.",
        },
        ariaLabel: {
          sr: "Otvori kontakt stranicu",
          en: "Open the contact page",
        },
      },
    ],
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "alpine",
    frame: 122,
    eyebrow: {
      sr: "Poglavlje 01",
      en: "Chapter 01",
    },
    note: {
      sr: "Hladna linija",
      en: "Cold line",
    },
    title: {
      sr: "Silueta se zaostri.",
      en: "The silhouette sharpens.",
    },
    body: {
      sr: "Mir. Vuna. Stav.",
      en: "Calm. Wool. Intent.",
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
      sr: "Poglavlje 02",
      en: "Chapter 02",
    },
    note: {
      sr: "Topli odmak",
      en: "Warm shift",
    },
    title: {
      sr: "Svetlo omeksa ton.",
      en: "Light softens the tone.",
    },
    body: {
      sr: "Laksi slojevi. Isti karakter.",
      en: "Lighter layers. Same character.",
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
      sr: "Poglavlje 03",
      en: "Chapter 03",
    },
    note: {
      sr: "Posle svetla",
      en: "After light",
    },
    title: {
      sr: "Noc ostavlja samo stav.",
      en: "Night leaves only intent.",
    },
    body: {
      sr: "Tamni tonovi. Tiha snaga.",
      en: "Dark tones. Quiet force.",
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
