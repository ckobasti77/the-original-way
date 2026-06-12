export type AuthLanguage = "sr" | "en";

export type LocalizedText = Record<AuthLanguage, string>;

export type AuthPageKey = "login" | "register" | "forgot" | "reset";

type AuthCopy = {
  fields: {
    confirmPassword: LocalizedText;
    email: LocalizedText;
    firstName: LocalizedText;
    lastName: LocalizedText;
    password: LocalizedText;
  };
  links: {
    backToLogin: LocalizedText;
    forgotPassword: LocalizedText;
    login: LocalizedText;
    register: LocalizedText;
    resetLink: LocalizedText;
  };
  messages: {
    fieldCheck: LocalizedText;
    forgotSuccessWithLink: LocalizedText;
    forgotSuccessWithoutLink: LocalizedText;
    invalidCredentials: LocalizedText;
    invalidEmail: LocalizedText;
    invalidResetLink: LocalizedText;
    registerEmailExists: LocalizedText;
    registerFailed: LocalizedText;
    requiredFields: LocalizedText;
    resetFailed: LocalizedText;
    passwordMismatch: LocalizedText;
    passwordTooShort: LocalizedText;
  };
  pages: Record<
    AuthPageKey,
    {
      subtitle: LocalizedText;
      title: LocalizedText;
    }
  >;
  placeholders: {
    confirmPassword: LocalizedText;
    email: LocalizedText;
    firstName: LocalizedText;
    lastName: LocalizedText;
    password: LocalizedText;
  };
  submit: {
    forgot: LocalizedText;
    login: LocalizedText;
    pending: LocalizedText;
    register: LocalizedText;
    reset: LocalizedText;
  };
};

export const AUTH_COPY: Record<AuthLanguage, AuthCopy> = {
  sr: {
    fields: {
      confirmPassword: {
        sr: "Potvrda sifre",
        en: "Confirm password",
      },
      email: {
        sr: "Email",
        en: "Email",
      },
      firstName: {
        sr: "Ime",
        en: "First name",
      },
      lastName: {
        sr: "Prezime",
        en: "Last name",
      },
      password: {
        sr: "Sifra",
        en: "Password",
      },
    },
    links: {
      backToLogin: {
        sr: "Nazad na prijavu",
        en: "Back to login",
      },
      forgotPassword: {
        sr: "Zaboravili ste sifru?",
        en: "Forgot your password?",
      },
      login: {
        sr: "Imate nalog? Prijavite se",
        en: "Already have an account? Log in",
      },
      register: {
        sr: "Nemate nalog? Registrujte se",
        en: "No account yet? Register",
      },
      resetLink: {
        sr: "Otvori reset stranicu",
        en: "Open reset page",
      },
    },
    messages: {
      fieldCheck: {
        sr: "Proverite oznacena polja.",
        en: "Please check the highlighted fields.",
      },
      forgotSuccessWithLink: {
        sr: "Ako nalog postoji, otvori reset link ispod.",
        en: "If the account exists, open the reset link below.",
      },
      forgotSuccessWithoutLink: {
        sr: "Ako nalog postoji, zahtev je zabelezen.",
        en: "If the account exists, the request was recorded.",
      },
      invalidCredentials: {
        sr: "Neispravni kredencijali.",
        en: "Invalid credentials.",
      },
      invalidEmail: {
        sr: "Unesite ispravan email.",
        en: "Enter a valid email.",
      },
      invalidResetLink: {
        sr: "Link za reset je istekao ili nije ispravan.",
        en: "The reset link has expired or is invalid.",
      },
      passwordMismatch: {
        sr: "Sifre se ne poklapaju.",
        en: "Passwords do not match.",
      },
      passwordTooShort: {
        sr: "Sifra mora imati bar 8 znakova.",
        en: "Password must be at least 8 characters.",
      },
      registerEmailExists: {
        sr: "Nalog sa ovim email-om vec postoji.",
        en: "An account with this email already exists.",
      },
      registerFailed: {
        sr: "Nije moguce napraviti nalog.",
        en: "Unable to create the account.",
      },
      requiredFields: {
        sr: "Sva polja su obavezna.",
        en: "All fields are required.",
      },
      resetFailed: {
        sr: "Nije moguce promeniti sifru.",
        en: "Unable to change the password.",
      },
    },
    pages: {
      login: {
        title: {
          sr: "Prijava",
          en: "Login",
        },
        subtitle: {
          sr: "Uloguj se na svoj nalog i nastavi gde si stao.",
          en: "Log in to your account and continue where you left off.",
        },
      },
      register: {
        title: {
          sr: "Registracija",
          en: "Registration",
        },
        subtitle: {
          sr: "Kreiraj nalog i prati porudzbine na jednom mestu.",
          en: "Create an account and track orders in one place.",
        },
      },
      forgot: {
        title: {
          sr: "Zaboravljena sifra",
          en: "Forgot password",
        },
        subtitle: {
          sr: "Unesi email i pripremi novi pristup nalogu.",
          en: "Enter your email and prepare a fresh sign-in link.",
        },
      },
      reset: {
        title: {
          sr: "Nova sifra",
          en: "New password",
        },
        subtitle: {
          sr: "Postavi novu sifru i vrati pristup nalogu.",
          en: "Set a new password and restore access to your account.",
        },
      },
    },
    placeholders: {
      confirmPassword: {
        sr: "Ponovi sifru",
        en: "Repeat password",
      },
      email: {
        sr: "ime@domen.com",
        en: "name@domain.com",
      },
      firstName: {
        sr: "Marko",
        en: "Mark",
      },
      lastName: {
        sr: "Petrovic",
        en: "Peters",
      },
      password: {
        sr: "Najmanje 8 znakova",
        en: "At least 8 characters",
      },
    },
    submit: {
      forgot: {
        sr: "Posalji link",
        en: "Send link",
      },
      login: {
        sr: "Prijavi se",
        en: "Log in",
      },
      pending: {
        sr: "Radim...",
        en: "Working...",
      },
      register: {
        sr: "Napravi nalog",
        en: "Create account",
      },
      reset: {
        sr: "Sacuvaj novu sifru",
        en: "Save new password",
      },
    },
  },
  en: {
    fields: {
      confirmPassword: {
        sr: "Potvrda sifre",
        en: "Confirm password",
      },
      email: {
        sr: "Email",
        en: "Email",
      },
      firstName: {
        sr: "Ime",
        en: "First name",
      },
      lastName: {
        sr: "Prezime",
        en: "Last name",
      },
      password: {
        sr: "Sifra",
        en: "Password",
      },
    },
    links: {
      backToLogin: {
        sr: "Nazad na prijavu",
        en: "Back to login",
      },
      forgotPassword: {
        sr: "Zaboravili ste sifru?",
        en: "Forgot your password?",
      },
      login: {
        sr: "Imate nalog? Prijavite se",
        en: "Already have an account? Log in",
      },
      register: {
        sr: "Nemate nalog? Registrujte se",
        en: "No account yet? Register",
      },
      resetLink: {
        sr: "Otvori reset stranicu",
        en: "Open reset page",
      },
    },
    messages: {
      fieldCheck: {
        sr: "Proverite oznacena polja.",
        en: "Please check the highlighted fields.",
      },
      forgotSuccessWithLink: {
        sr: "Ako nalog postoji, otvori reset link ispod.",
        en: "If the account exists, open the reset link below.",
      },
      forgotSuccessWithoutLink: {
        sr: "Ako nalog postoji, zahtev je zabelezen.",
        en: "If the account exists, the request was recorded.",
      },
      invalidCredentials: {
        sr: "Neispravni kredencijali.",
        en: "Invalid credentials.",
      },
      invalidEmail: {
        sr: "Unesite ispravan email.",
        en: "Enter a valid email.",
      },
      invalidResetLink: {
        sr: "Link za reset je istekao ili nije ispravan.",
        en: "The reset link has expired or is invalid.",
      },
      passwordMismatch: {
        sr: "Sifre se ne poklapaju.",
        en: "Passwords do not match.",
      },
      passwordTooShort: {
        sr: "Sifra mora imati bar 8 znakova.",
        en: "Password must be at least 8 characters.",
      },
      registerEmailExists: {
        sr: "Nalog sa ovim email-om vec postoji.",
        en: "An account with this email already exists.",
      },
      registerFailed: {
        sr: "Nije moguce napraviti nalog.",
        en: "Unable to create the account.",
      },
      requiredFields: {
        sr: "Sva polja su obavezna.",
        en: "All fields are required.",
      },
      resetFailed: {
        sr: "Nije moguce promeniti sifru.",
        en: "Unable to change the password.",
      },
    },
    pages: {
      login: {
        title: {
          sr: "Prijava",
          en: "Login",
        },
        subtitle: {
          sr: "Uloguj se na svoj nalog i nastavi gde si stao.",
          en: "Log in to your account and continue where you left off.",
        },
      },
      register: {
        title: {
          sr: "Registracija",
          en: "Registration",
        },
        subtitle: {
          sr: "Kreiraj nalog i prati porudzbine na jednom mestu.",
          en: "Create an account and track orders in one place.",
        },
      },
      forgot: {
        title: {
          sr: "Zaboravljena sifra",
          en: "Forgot password",
        },
        subtitle: {
          sr: "Unesi email i pripremi novi pristup nalogu.",
          en: "Enter your email and prepare a fresh sign-in link.",
        },
      },
      reset: {
        title: {
          sr: "Nova sifra",
          en: "New password",
        },
        subtitle: {
          sr: "Postavi novu sifru i vrati pristup nalogu.",
          en: "Set a new password and restore access to your account.",
        },
      },
    },
    placeholders: {
      confirmPassword: {
        sr: "Ponovi sifru",
        en: "Repeat password",
      },
      email: {
        sr: "ime@domen.com",
        en: "name@domain.com",
      },
      firstName: {
        sr: "Marko",
        en: "Mark",
      },
      lastName: {
        sr: "Petrovic",
        en: "Peters",
      },
      password: {
        sr: "Najmanje 8 znakova",
        en: "At least 8 characters",
      },
    },
    submit: {
      forgot: {
        sr: "Posalji link",
        en: "Send link",
      },
      login: {
        sr: "Prijavi se",
        en: "Log in",
      },
      pending: {
        sr: "Radim...",
        en: "Working...",
      },
      register: {
        sr: "Napravi nalog",
        en: "Create account",
      },
      reset: {
        sr: "Sacuvaj novu sifru",
        en: "Save new password",
      },
    },
  },
};

export function getAuthLanguage(value: string | null | undefined): AuthLanguage {
  return value === "en" ? "en" : "sr";
}
