"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import {
  buttonClass,
  ConvexSetupNotice,
  fieldClass,
  FieldLabel,
  LoadingBlock,
  SectionHeader,
} from "../_components/admin-ui";

type SettingRecord = {
  key: string;
  value: string;
};

const defaultSettings = {
  storeName: "The Original Way",
  currency: "RSD",
  orderEmail: "",
  phone: "",
};

export function SettingsClient({ convexEnabled }: { convexEnabled: boolean }) {
  if (!convexEnabled) {
    return (
      <div className="space-y-5">
        <SectionHeader
          eyebrow="Podesavanja"
          title="Osnovna podesavanja butika"
          description="Podesavanja se cuvaju u Convex tabeli settings."
        />
        <ConvexSetupNotice />
      </div>
    );
  }

  return <SettingsConvex />;
}

function SettingsConvex() {
  const settings = useQuery(api.settings.list) as SettingRecord[] | undefined;
  const setSetting = useMutation(api.settings.set);
  const values = useMemo(
    () =>
      Object.fromEntries(
        settings?.map((setting) => [setting.key, setting.value]) ?? [],
      ) as Partial<typeof defaultSettings>,
    [settings],
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await Promise.all(
      Object.keys(defaultSettings).map((key) =>
        setSetting({
          key,
          value: String(formData.get(key) ?? ""),
        }),
      ),
    );

    setMessage("Podesavanja su sacuvana.");
  }

  if (settings === undefined) {
    return (
      <div className="space-y-5">
        <SectionHeader
          eyebrow="Podesavanja"
          title="Osnovna podesavanja butika"
          description="Podesavanja se cuvaju u Convex tabeli settings."
        />
        <LoadingBlock />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Podesavanja"
        title="Osnovna podesavanja butika"
        description="Sacuvaj operativne podatke butika i email adresu za porudzbine."
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 md:grid-cols-2"
      >
        <FieldLabel label="Naziv butika">
          <input
            name="storeName"
            className={fieldClass}
            defaultValue={values.storeName ?? defaultSettings.storeName}
          />
        </FieldLabel>
        <FieldLabel label="Valuta">
          <select
            name="currency"
            className={fieldClass}
            defaultValue={values.currency ?? defaultSettings.currency}
          >
            <option>RSD</option>
            <option>EUR</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Email za porudzbine">
          <input
            name="orderEmail"
            className={fieldClass}
            defaultValue={values.orderEmail ?? defaultSettings.orderEmail}
            placeholder="orders@example.com"
          />
        </FieldLabel>
        <FieldLabel label="Telefon">
          <input
            name="phone"
            className={fieldClass}
            defaultValue={values.phone ?? defaultSettings.phone}
            placeholder="+381"
          />
        </FieldLabel>
        {message ? (
          <p className="text-sm font-bold text-[#276c56] md:col-span-2">
            {message}
          </p>
        ) : null}
        <div className="md:col-span-2">
          <button className={buttonClass}>Sacuvaj podesavanja</button>
        </div>
      </form>
    </div>
  );
}
