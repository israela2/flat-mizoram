"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Kind = "project" | "gallery" | "news" | "event";

type Item = {
  id: string;
  kind: Kind;
  title: string;
  title_mz: string | null;
  description: string | null;
  description_mz: string | null;
  image_url: string | null;
  caption: string | null;
  item_date: string | null;
  published: boolean;
  sort_order: number;
  created_at?: string;
};

type Settings = Record<string, string>;

const defaults: Settings = {
  logo_url: "",
  hero_image_url: "",
  hero_headline_en: "Creating access. Changing lives.",
  hero_headline_mz: "Hun remchang siam. Nun siamthat.",
  hero_description_en:
    "Building a more inclusive future where every person has the opportunity to live with dignity, participate fully, and thrive.",
  hero_description_mz:
    "Mi tin zahawmna nen an nun an hman theihna, an tel theihna leh hmasawnna hun remchang nei thei tura thawh ho.",
  hero_button_en: "Get Involved",
  hero_button_mz: "Tel Ve Rawh",
  about_title_en: "A future where everyone belongs.",
  about_title_mz: "Mi tin an tel theihna khawvel.",
  about_en:
    "FLAT Mizoram is committed to creating opportunities, strengthening communities, and helping people access the support they need to live fuller lives.",
  about_mz:
    "FLAT Mizoram hian hun remchang siam, khawtlang chak zawk siam leh mi tin nun hman thatna tur puihna an dawn theih nan a thawh.",
  mission_en: "",
  mission_mz: "",
  vision_en: "",
  vision_mz: "",
  values_en: "",
  values_mz: "",
  about_image_url: "",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
  footer_en: "FLAT Mizoram · Full Life Access Trust",
  footer_mz: "FLAT Mizoram · Full Life Access Trust",
};

const tabs = [
  { key: "home", label: "Homepage & About" },
  { key: "project", label: "Projects" },
  { key: "gallery", label: "Photo Gallery" },
  { key: "news", label: "News" },
  { key: "event", label: "Events" },
  { key: "contact", label: "Contact & Footer" },
];

const emptyItem = (kind: Kind): Partial<Item> => ({
  kind,
  title: "",
  title_mz: "",
  description: "",
  description_mz: "",
  image_url: "",
  caption: "",
  item_date: "",
  published: false,
  sort_order: 0,
});

export default function AdminDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("home");
  const [settings, setSettings] = useState<Settings>(defaults);
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Partial<Item> | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Authentication check. Keep the narrowed client in this outer scope
  // so nested functions can safely use it without TypeScript null errors.
    useEffect(() => {
    let active = true;

    const client = supabase;

    if (!client) {
      setError(
        "Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setChecking(false);
      return;
    }

    // Explicit non-null type for use inside nested async functions.
    const supabaseClient = client as NonNullable<typeof client>;

    async function init() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabaseClient.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          router.replace("/admin");
          return;
        }

        const { data: admin, error: adminError } =
          await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!active) return;

        if (adminError || !admin) {
          setError(
            "He account hi admin permission a nei lo. Supabase SQL-ah admin_users table chhungah i user UUID add rawh."
          );
          setEmail(user.email ?? "Administrator");
          setChecking(false);
          return;
        }

        setEmail(user.email ?? "Administrator");
        await loadData();

        if (active) {
          setChecking(false);
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Admin session check a hlawhchham."
        );
        setChecking(false);
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/admin");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function loadData() {
    const client = supabase;

    if (!client) {
      setError("Supabase is not configured. Check environment variables.");
      return;
    }

    setError("");

    try {
      const [settingsResult, contentResult] = await Promise.all([
        client.from("site_settings").select("setting_key, setting_value"),
        client
          .from("content_items")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);

      if (settingsResult.error) {
        setError(
          "Website settings load a hlawhchham: " +
            settingsResult.error.message,
        );
      } else {
        const next: Settings = { ...defaults };

        for (const row of settingsResult.data ?? []) {
          const value = row.setting_value as
            | { value?: string; url?: string }
            | string
            | null;

          next[row.setting_key] =
            typeof value === "string"
              ? value
              : value?.value ?? value?.url ?? "";
        }

        setSettings(next);
      }

      if (contentResult.error) {
        setError((old) =>
          [
            old,
            "Content load a hlawhchham: " + contentResult.error.message,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      } else {
        setItems((contentResult.data ?? []) as Item[]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Website data load a hlawhchham.",
      );
    }
  }

  async function saveSettings(keys: string[]) {
    const client = supabase;

    if (!client) {
      setError("Supabase is not configured. Check environment variables.");
      return;
    }

    setBusy(true);
    setMessage("");
    setError("");

    try {
      const rows = keys.map((key) => ({
        setting_key: key,
        setting_value: { value: settings[key] ?? "" },
        updated_at: new Date().toISOString(),
      }));

      const { error: saveError } = await client
        .from("site_settings")
        .upsert(rows, { onConflict: "setting_key" });

      if (saveError) {
        setError("Save a hlawhchham: " + saveError.message);
      } else {
        setMessage("Changes save a hlawhtling. Website refresh la.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Settings save a hlawhchham.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadForItem(event: ChangeEvent<HTMLInputElement>) {
    const client = supabase;
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !draft) return;

    if (!client) {
      setError("Supabase is not configured. Check environment variables.");
      return;
    }

    setError("");
    setMessage("");

    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setError("JPG, PNG, WebP emaw GIF chauh upload rawh.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image chu 5 MB aia lian tur a ni lo.");
      return;
    }

    setUploading(true);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `content/${Date.now()}-${safeName}`;

      const { data, error: uploadError } = await client.storage
        .from("media")
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = client.storage
        .from("media")
        .getPublicUrl(data.path);

      setDraft((current) =>
        current
          ? { ...current, image_url: publicUrlData.publicUrl }
          : current,
      );

      setMessage("Image preview siam a ni. Save item tih hnuah a dah fel ang.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload a hlawhchham.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const client = supabase;

    if (!client) {
      setError("Supabase is not configured. Check environment variables.");
      return;
    }

    if (!draft) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        kind: draft.kind,
        title: draft.title?.trim(),
        title_mz: draft.title_mz || null,
        description: draft.description || null,
        description_mz: draft.description_mz || null,
        image_url: draft.image_url || null,
        caption: draft.caption || null,
        item_date: draft.item_date || null,
        published: !!draft.published,
        sort_order: Number(draft.sort_order || 0),
        updated_at: new Date().toISOString(),
      };

      const result = draft.id
        ? await client.from("content_items").update(payload).eq("id", draft.id)
        : await client.from("content_items").insert(payload);

      if (result.error) {
        setError("Save a hlawhchham: " + result.error.message);
      } else {
        setMessage("Content save a hlawhtling.");
        setDraft(null);
        await loadData();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Content save a hlawhchham.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(item: Item) {
    const client = supabase;

    if (!client) {
      setError("Supabase is not configured. Check environment variables.");
      return;
    }

    setError("");
    setMessage("");

    const { error: updateError } = await client
      .from("content_items")
      .update({
        published: !item.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (updateError) {
      setError("Publish status thlak a hlawhchham: " + updateError.message);
    } else {
      setItems((old) =>
        old.map((current) =>
          current.id === item.id
            ? { ...current, published: !item.published }
            : current,
        ),
      );
      setMessage(item.published ? "Unpublished." : "Published.");
    }
  }

  async function deleteItem(item: Item) {
    const client = supabase;

    if (!client) {
      setError("Supabase is not configured. Check environment variables.");
      return;
    }

    if (!window.confirm(`"${item.title}" delete ngei dawn em?`)) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await client
      .from("content_items")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError("Delete a hlawhchham: " + deleteError.message);
    } else {
      setItems((old) => old.filter((current) => current.id !== item.id));
      setMessage("Item delete a ni.");
    }
  }

  async function signOut() {
    const client = supabase;

    if (!client) {
      router.replace("/admin");
      return;
    }

    const { error: signOutError } = await client.auth.signOut();

    if (signOutError) {
      setError("Sign out a hlawhchham: " + signOutError.message);
      return;
    }

    router.replace("/admin");
  }

  const currentItems = useMemo(
    () => items.filter((item) => item.kind === tab),
    [items, tab],
  );

  const settingsGroups: Record<string, { title: string; keys: string[] }> = {
    home: {
      title: "Homepage & About Us",
      keys: [
        "logo_url",
        "hero_image_url",
        "hero_headline_en",
        "hero_headline_mz",
        "hero_description_en",
        "hero_description_mz",
        "hero_button_en",
        "hero_button_mz",
        "about_title_en",
        "about_title_mz",
        "about_en",
        "about_mz",
        "about_image_url",
        "mission_en",
        "mission_mz",
        "vision_en",
        "vision_mz",
        "values_en",
        "values_mz",
      ],
    },
    contact: {
      title: "Contact, Footer & Social Links",
      keys: [
        "contact_email",
        "contact_phone",
        "contact_address",
        "facebook_url",
        "instagram_url",
        "youtube_url",
        "footer_en",
        "footer_mz",
      ],
    },
  };

  const labels: Record<string, string> = {
    logo_url: "Logo image URL",
    hero_image_url: "Hero banner image URL",
    hero_headline_en: "Homepage headline (English)",
    hero_headline_mz: "Homepage headline (Mizo)",
    hero_description_en: "Homepage description (English)",
    hero_description_mz: "Homepage description (Mizo)",
    hero_button_en: "Main button text (English)",
    hero_button_mz: "Main button text (Mizo)",
    about_title_en: "About title (English)",
    about_title_mz: "About title (Mizo)",
    about_en: "About Us (English)",
    about_mz: "About Us (Mizo)",
    about_image_url: "About photo URL",
    mission_en: "Mission (English)",
    mission_mz: "Mission (Mizo)",
    vision_en: "Vision (English)",
    vision_mz: "Vision (Mizo)",
    values_en: "Values (English)",
    values_mz: "Values (Mizo)",
    contact_email: "Email",
    contact_phone: "Phone",
    contact_address: "Address",
    facebook_url: "Facebook URL",
    instagram_url: "Instagram URL",
    youtube_url: "YouTube URL",
    footer_en: "Footer text (English)",
    footer_mz: "Footer text (Mizo)",
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f3ed] text-[#193d32]">
        Admin session checking...
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7f5] text-[#193d32]">
      <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 ring-1 ring-emerald-900/10">
              <img
                src="/flat-logo.png"
                alt="FLAT logo"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#bc7545] sm:text-xs">
                Full Life Access Trust
              </p>
              <h1 className="mt-0.5 truncate text-lg font-extrabold sm:text-2xl">
                Admin Dashboard
              </h1>
              <p className="mt-0.5 max-w-[52vw] truncate text-xs text-slate-500 sm:max-w-none sm:text-sm">
                {email}
              </p>
            </div>
          </div>
          <button
            onClick={() => void signOut()}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold shadow-sm transition hover:bg-slate-50 sm:px-5 sm:text-sm"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <nav
            aria-label="Admin sections"
            className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1"
          >
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setTab(item.key);
                  setDraft(null);
                  setMessage("");
                  setError("");
                }}
                className={`min-h-11 shrink-0 rounded-xl px-3 py-2.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
                  tab === item.key
                    ? "bg-[#193d32] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-[#193d32]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {message && (
          <p
            role="status"
            className="mb-4 break-words rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 sm:p-4"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-4 whitespace-pre-line break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:p-4"
          >
            {error}
          </p>
        )}

        {settingsGroups[tab] && (
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-bold">
              {settingsGroups[tab].title}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {settingsGroups[tab].keys.map((key) => (
                <label key={key} className="block text-sm font-semibold">
                  {labels[key] ?? key}
                  {key.includes("description") ||
                  key.startsWith("about_") ||
                  key.startsWith("mission") ||
                  key.startsWith("vision") ||
                  key.startsWith("values") ||
                  key.startsWith("contact_address") ||
                  key.startsWith("footer") ? (
                    <textarea
                      rows={3}
                      value={settings[key] ?? ""}
                      onChange={(event) =>
                        setSettings((old) => ({
                          ...old,
                          [key]: event.target.value,
                        }))
                      }
                      className="mt-2 block w-full max-w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 sm:px-4"
                    />
                  ) : (
                    <input
                      value={settings[key] ?? ""}
                      onChange={(event) =>
                        setSettings((old) => ({
                          ...old,
                          [key]: event.target.value,
                        }))
                      }
                      className="mt-2 block w-full max-w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 sm:px-4"
                      placeholder={key.endsWith("_url") ? "https://..." : ""}
                    />
                  )}
                  {key.endsWith("_url") && settings[key] && (
                    <span className="mt-2 block overflow-hidden rounded-lg bg-gray-50 p-2 text-xs font-normal text-gray-500">
                      {settings[key]}
                      {/\.(png|jpg|jpeg|webp|gif)(\?.*)?$/i.test(
                        settings[key],
                      ) && (
                        <img
                          src={settings[key]}
                          alt="Upload preview"
                          className="mt-2 max-h-32 object-contain"
                        />
                      )}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <button
              disabled={busy}
              onClick={() => void saveSettings(settingsGroups[tab].keys)}
              className="mt-6 w-full rounded-xl bg-[#193d32] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#245746] disabled:opacity-50 sm:w-auto"
            >
              {busy ? "Saving..." : "Save changes"}
            </button>
          </section>
        )}

        {!settingsGroups[tab] && (
          <section className="min-w-0">
            <div className="mb-5 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {tabs.find((item) => item.key === tab)?.label}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add, edit, upload photo, reorder with sort order, and publish.
                </p>
              </div>
              <button
                onClick={() => setDraft(emptyItem(tab as Kind))}
                className="w-full shrink-0 rounded-xl bg-[#193d32] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#245746] sm:w-auto"
              >
                + Add new
              </button>
            </div>

            {draft && (
              <form
                onSubmit={saveItem}
                className="mb-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8"
              >
                <h3 className="mb-5 text-xl font-bold">
                  {draft.id ? "Edit item" : "New item"}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Title (English) *
                    <input
                      required
                      value={draft.title ?? ""}
                      onChange={(event) =>
                        setDraft((old) =>
                          old ? { ...old, title: event.target.value } : old,
                        )
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Title (Mizo)
                    <input
                      value={draft.title_mz ?? ""}
                      onChange={(event) =>
                        setDraft((old) =>
                          old ? { ...old, title_mz: event.target.value } : old,
                        )
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </label>
                  <label className="text-sm font-semibold md:col-span-2">
                    Description (English)
                    <textarea
                      rows={3}
                      value={draft.description ?? ""}
                      onChange={(event) =>
                        setDraft((old) =>
                          old ? { ...old, description: event.target.value } : old,
                        )
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </label>
                  <label className="text-sm font-semibold md:col-span-2">
                    Description (Mizo)
                    <textarea
                      rows={3}
                      value={draft.description_mz ?? ""}
                      onChange={(event) =>
                        setDraft((old) =>
                          old ? { ...old, description_mz: event.target.value } : old,
                        )
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Caption / extra details
                    <input
                      value={draft.caption ?? ""}
                      onChange={(event) =>
                        setDraft((old) =>
                          old ? { ...old, caption: event.target.value } : old,
                        )
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Date (optional)
                    <input
                      type="date"
                      value={draft.item_date ?? ""}
                      onChange={(event) =>
                        setDraft((old) =>
                          old ? { ...old, item_date: event.target.value } : old,
                        )
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Sort order (lower number appears first)
                    <input
                      type="number"
                      value={draft.sort_order ?? 0}
                      onChange={(event) =>
                        setDraft((old) =>
                          old
                            ? { ...old, sort_order: Number(event.target.value) }
                            : old,
                        )
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </label>
                  <div className="text-sm font-semibold">
                    Photo upload (JPG/PNG/WebP/GIF · max 5 MB)
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) => void uploadForItem(event)}
                      disabled={uploading}
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal"
                    />
                    {draft.image_url && (
                      <img
                        src={draft.image_url}
                        alt="Photo preview"
                        className="mt-3 max-h-48 rounded-xl object-contain"
                      />
                    )}
                    <input
                      aria-label="Image URL"
                      placeholder="Or paste image URL"
                      value={draft.image_url ?? ""}
                      onChange={(event) =>
                        setDraft((old) =>
                          old ? { ...old, image_url: event.target.value } : old,
                        )
                      }
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                    />
                  </div>
                  <label className="flex items-center gap-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={!!draft.published}
                      onChange={(event) =>
                        setDraft((old) =>
                          old ? { ...old, published: event.target.checked } : old,
                        )
                      }
                    />
                    Publish immediately
                  </label>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    disabled={busy || uploading}
                    className="rounded-xl bg-[#193d32] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {busy ? "Saving..." : "Save item"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {currentItems.map((item) => (
                <article
                  key={item.id}
                  className="flex min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md sm:gap-4 sm:p-4"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      className="h-28 w-28 shrink-0 rounded-xl bg-gray-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                      No image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{item.title}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          item.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-3 text-sm text-gray-500">
                      {item.description || item.caption}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Order: {item.sort_order}
                      {item.item_date ? ` · ${item.item_date}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => setDraft({ ...item })}
                        className="rounded-full border px-3 py-2 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void togglePublish(item)}
                        className="rounded-full border px-3 py-2 text-xs font-semibold"
                      >
                        {item.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => void deleteItem(item)}
                        className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {currentItems.length === 0 && !draft && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                No items yet. “Add new” click rawh.
              </div>
            )}
          </section>
        )}

        <Link
          href="/"
          className="mt-8 inline-block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm underline-offset-4 hover:underline"
        >
          ← View public website
        </Link>
      </div>
    </main>
  );
}
