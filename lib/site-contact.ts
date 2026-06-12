export type ContactChannelId =
  | "phone"
  | "email"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube";

export type ContactChannel = {
  detail: string;
  href: string;
  id: ContactChannelId;
  label: string;
  target?: "_blank";
};

export const CONTACT_EMAIL = "theoriginalway@gmail.com";
export const CONTACT_PHONE = "+381 60 000 0000";
export const CONTACT_PHONE_HREF = "tel:+381600000000";

export const SOCIAL_LINKS: ContactChannel[] = [
  {
    detail: "@theoriginalway",
    href: "https://www.instagram.com/theoriginalway",
    id: "instagram",
    label: "Instagram",
    target: "_blank",
  },
  {
    detail: "The Original Way",
    href: "https://www.facebook.com/theoriginalway",
    id: "facebook",
    label: "Facebook",
    target: "_blank",
  },
  {
    detail: "@theoriginalway",
    href: "https://www.tiktok.com/@theoriginalway",
    id: "tiktok",
    label: "TikTok",
    target: "_blank",
  },
  {
    detail: "@theoriginalway",
    href: "https://www.youtube.com/@theoriginalway",
    id: "youtube",
    label: "YouTube",
    target: "_blank",
  },
];

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    detail: CONTACT_PHONE,
    href: CONTACT_PHONE_HREF,
    id: "phone",
    label: "Poziv",
  },
  {
    detail: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    id: "email",
    label: "Email",
  },
  ...SOCIAL_LINKS,
];
