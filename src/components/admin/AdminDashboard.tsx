"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Provider } from "@/types/provider";
import type { MeetupGroup } from "@/types/meetup";
import type { SiteDoc, BrainSettingsDoc, SiteAccountSettings, SiteCalculatorCopy } from "@/types/site";
import type { Borough } from "@/types/provider";

async function adminFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [meetups, setMeetups] = useState<MeetupGroup[]>([]);
  const [site, setSite] = useState<Partial<SiteDoc> | null>(null);
  const [brain, setBrain] = useState<Partial<BrainSettingsDoc> | null>(null);
  const [locationsJson, setLocationsJson] = useState("");
  const [guidesDraft, setGuidesDraft] = useState("[]");
  const [howItWorksDraft, setHowItWorksDraft] = useState("[]");
  const [trustPillarsDraft, setTrustPillarsDraft] = useState("[]");
  const [trustLinesDraft, setTrustLinesDraft] = useState("");
  const [popularNamesDraft, setPopularNamesDraft] = useState("");
  const [meetupGroupIdDraft, setMeetupGroupIdDraft] = useState("");
  const [calculatorDraft, setCalculatorDraft] = useState("{}");
  const [accountDraft, setAccountDraft] = useState("{}");
  const [startersDraft, setStartersDraft] = useState("[]");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [pr, mg, st, br, loc] = await Promise.all([
      adminFetch("/api/admin/providers"),
      adminFetch("/api/admin/meetup-groups"),
      adminFetch("/api/admin/site"),
      adminFetch("/api/admin/brain"),
      adminFetch("/api/admin/locations"),
    ]);
    if (pr.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (pr.ok) setProviders(await pr.json());
    if (mg.ok) setMeetups(await mg.json());
    if (st.ok) {
      const s = await st.json();
      setSite(s);
      if (s.guides) setGuidesDraft(JSON.stringify(s.guides, null, 2));
      setHowItWorksDraft(JSON.stringify(s.howItWorksSteps ?? [], null, 2));
      setTrustPillarsDraft(JSON.stringify(s.trustPillars ?? [], null, 2));
      setTrustLinesDraft((s.trustLines ?? []).join("\n"));
      setPopularNamesDraft((s.homePopularPickProviderNames ?? []).join("\n"));
      setMeetupGroupIdDraft(s.homePopularMeetupGroupId ?? "");
      setCalculatorDraft(JSON.stringify(s.calculator ?? {}, null, 2));
      setAccountDraft(JSON.stringify(s.account ?? {}, null, 2));
    }
    if (br.ok) {
      const b = await br.json();
      setBrain(b);
      if (b.starters) setStartersDraft(JSON.stringify(b.starters, null, 2));
    }
    if (loc.ok) {
      const rows = await loc.json();
      setLocationsJson(JSON.stringify(rows, null, 2));
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    await adminFetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const saveProviderMenu = async (id: string, menuJson: string) => {
    setBusy(true);
    try {
      let menu: unknown;
      try {
        menu = JSON.parse(menuJson);
      } catch {
        toast.error("Invalid menu JSON");
        return;
      }
      const r = await adminFetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, menu }),
      });
      if (!r.ok) throw new Error();
      toast.success("Provider menu updated");
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  const saveProviderImage = async (id: string, image: string) => {
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, image }),
      });
      if (!r.ok) throw new Error();
      toast.success("Provider image updated");
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  const saveMeetupCover = async (id: string, coverImageUrl: string) => {
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/meetup-groups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, coverImageUrl }),
      });
      if (!r.ok) throw new Error();
      toast.success("Meet-up cover updated");
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  const saveSite = async () => {
    if (!site) return;
    setBusy(true);
    try {
      let guides: SiteDoc["guides"];
      let howItWorksSteps: SiteDoc["howItWorksSteps"];
      let trustPillars: SiteDoc["trustPillars"];
      let account: SiteAccountSettings;
      let calculator: SiteCalculatorCopy;
      try {
        guides = JSON.parse(guidesDraft);
        howItWorksSteps = JSON.parse(howItWorksDraft);
        trustPillars = JSON.parse(trustPillarsDraft);
        account = JSON.parse(accountDraft);
        calculator = JSON.parse(calculatorDraft);
      } catch {
        toast.error("Invalid JSON in guides, steps, pillars, account, or calculator");
        setBusy(false);
        return;
      }
      const trustLines = trustLinesDraft
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const homePopularPickProviderNames = popularNamesDraft
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const homePopularMeetupGroupId = meetupGroupIdDraft.trim();
      const {
        _id,
        guides: _g,
        howItWorksSteps: _h,
        trustPillars: _tp,
        trustLines: _tl,
        account: _a,
        calculator: _c,
        homePopularPickProviderNames: _hpn,
        homePopularMeetupGroupId: _hmg,
        ...rest
      } = site as SiteDoc;
      const r = await adminFetch("/api/admin/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rest,
          guides,
          howItWorksSteps,
          trustPillars,
          trustLines,
          account,
          calculator,
          homePopularPickProviderNames,
          homePopularMeetupGroupId,
        }),
      });
      if (!r.ok) throw new Error();
      toast.success("Site settings saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  const saveBrain = async () => {
    if (!brain) return;
    setBusy(true);
    try {
      let starters: string[];
      try {
        starters = JSON.parse(startersDraft);
      } catch {
        toast.error("Starters must be a JSON array of strings");
        setBusy(false);
        return;
      }
      const { _id, ...rest } = brain as BrainSettingsDoc & { _id?: unknown };
      const r = await adminFetch("/api/admin/brain", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, starters }),
      });
      if (!r.ok) throw new Error();
      toast.success("Scout brain settings saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  const saveLocations = async () => {
    setBusy(true);
    try {
      const rows = JSON.parse(locationsJson) as { borough: Borough; neighborhoods: string[] }[];
      const r = await adminFetch("/api/admin/locations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: rows }),
      });
      if (!r.ok) throw new Error();
      toast.success("Locations saved");
    } catch {
      toast.error("Invalid JSON or save failed");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      await navigator.clipboard.writeText(j.url);
      toast.success("Uploaded — URL copied to clipboard", { description: j.url });
    } catch {
      toast.error("Upload failed — check IMGBB_API_KEY");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-lg font-semibold text-foreground hover:text-teal">
            Budapest NightC
          </Link>
          <span className="text-muted-foreground">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">View site</Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => load()} disabled={busy}>
            Refresh data
          </Button>
          <Button variant="destructive" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <Tabs defaultValue="providers" className="space-y-4">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="providers">Venues & listings</TabsTrigger>
            <TabsTrigger value="meetups">Meet-Up Groups</TabsTrigger>
            <TabsTrigger value="locations">Neighborhoods</TabsTrigger>
            <TabsTrigger value="site">Site & images</TabsTrigger>
            <TabsTrigger value="brain">Night Guide brain</TabsTrigger>
            <TabsTrigger value="upload">ImgBB upload</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-3 rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              All categories (Events, Parties, Restaurants, Cafés) share this provider list. Set each{" "}
              <strong>image</strong> to a full ImgBB (or HTTPS CDN) URL.
            </p>
            <div className="max-h-[480px] space-y-2 overflow-y-auto">
              {providers.slice(0, 80).map((p) => (
                <ProviderRow key={p.id} p={p} disabled={busy} onSave={saveProviderImage} onSaveMenu={saveProviderMenu} />
              ))}
            </div>
            {providers.length > 80 && (
              <p className="text-xs text-muted-foreground">Showing first 80 of {providers.length}. Use Mongo tools for bulk edits.</p>
            )}
          </TabsContent>

          <TabsContent value="meetups" className="space-y-3 rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Optional hero image per group (CDN URL).</p>
            <div className="max-h-[480px] space-y-2 overflow-y-auto">
              {meetups.map((g) => (
                <MeetupRow key={g.id} g={g} disabled={busy} onSave={saveMeetupCover} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-3 rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Array of {"{ borough, neighborhoods: string[] }"} — used by Discover & Meetups.</p>
            <Textarea value={locationsJson} onChange={(e) => setLocationsJson(e.target.value)} rows={16} className="font-mono text-xs" />
            <Button onClick={saveLocations} disabled={busy}>
              Save neighborhoods
            </Button>
          </TabsContent>

          <TabsContent value="site" className="space-y-3 rounded-xl border border-border bg-card p-4">
            {site && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Logo URL (ImgBB or leave default /images/logo.png)">
                    <Input
                      value={site.logoUrl ?? ""}
                      onChange={(e) => setSite({ ...site, logoUrl: e.target.value })}
                      placeholder="/images/logo.png"
                    />
                  </Field>
                  <Field label="Home hero image URL">
                    <Input value={site.homeHeroUrl ?? ""} onChange={(e) => setSite({ ...site, homeHeroUrl: e.target.value })} />
                  </Field>
                  <Field label="Discover hero image URL">
                    <Input value={site.discoverHeroUrl ?? ""} onChange={(e) => setSite({ ...site, discoverHeroUrl: e.target.value })} />
                  </Field>
                </div>
                <p className="text-sm font-medium text-foreground">Home hero copy</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Home hero title">
                    <Input value={site.homeHeroTitle ?? ""} onChange={(e) => setSite({ ...site, homeHeroTitle: e.target.value })} />
                  </Field>
                  <Field label="Home hero subtitle">
                    <Input value={site.homeHeroSubtitle ?? ""} onChange={(e) => setSite({ ...site, homeHeroSubtitle: e.target.value })} />
                  </Field>
                  <Field label="Primary CTA label">
                    <Input value={site.homeHeroPrimaryCta ?? ""} onChange={(e) => setSite({ ...site, homeHeroPrimaryCta: e.target.value })} />
                  </Field>
                  <Field label="Secondary CTA label">
                    <Input value={site.homeHeroSecondaryCta ?? ""} onChange={(e) => setSite({ ...site, homeHeroSecondaryCta: e.target.value })} />
                  </Field>
                  <Field label="Hero tagline" className="sm:col-span-2">
                    <Input value={site.homeHeroTagline ?? ""} onChange={(e) => setSite({ ...site, homeHeroTagline: e.target.value })} />
                  </Field>
                </div>
                <p className="text-sm font-medium text-foreground">Home sections</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Categories section title">
                    <Input value={site.homeCategoriesTitle ?? ""} onChange={(e) => setSite({ ...site, homeCategoriesTitle: e.target.value })} />
                  </Field>
                  <Field label="Neighborhood section title">
                    <Input
                      value={site.neighborhoodSectionTitle ?? ""}
                      onChange={(e) => setSite({ ...site, neighborhoodSectionTitle: e.target.value })}
                    />
                  </Field>
                  <Field label="Popular neighborhoods caption (use {borough} token)" className="sm:col-span-2">
                    <Input
                      value={site.popularNeighborhoodsCaption ?? ""}
                      onChange={(e) => setSite({ ...site, popularNeighborhoodsCaption: e.target.value })}
                    />
                  </Field>
                  <Field label="Guides section title">
                    <Input value={site.guidesSectionTitle ?? ""} onChange={(e) => setSite({ ...site, guidesSectionTitle: e.target.value })} />
                  </Field>
                  <Field label='Guides "view all" label'>
                    <Input value={site.guidesViewAllLabel ?? ""} onChange={(e) => setSite({ ...site, guidesViewAllLabel: e.target.value })} />
                  </Field>
                  <Field label='Guides "view all" URL (optional, https or /path)' className="sm:col-span-2">
                    <Input value={site.guidesViewAllHref ?? ""} onChange={(e) => setSite({ ...site, guidesViewAllHref: e.target.value })} />
                  </Field>
                  <Field label="How it works section title" className="sm:col-span-2">
                    <Input
                      value={site.howItWorksSectionTitle ?? ""}
                      onChange={(e) => setSite({ ...site, howItWorksSectionTitle: e.target.value })}
                    />
                  </Field>
                  <Field label="Popular picks section title">
                    <Input
                      value={site.popularPicksSectionTitle ?? ""}
                      onChange={(e) => setSite({ ...site, popularPicksSectionTitle: e.target.value })}
                    />
                  </Field>
                  <Field label='Popular picks "view all" label'>
                    <Input
                      value={site.popularPicksViewAllLabel ?? ""}
                      onChange={(e) => setSite({ ...site, popularPicksViewAllLabel: e.target.value })}
                    />
                  </Field>
                </div>
                <p className="text-sm font-medium text-foreground">Newsletter</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Newsletter title" className="sm:col-span-2">
                    <Input value={site.newsletterTitle ?? ""} onChange={(e) => setSite({ ...site, newsletterTitle: e.target.value })} />
                  </Field>
                  <Field label="Newsletter subtitle" className="sm:col-span-2">
                    <Input value={site.newsletterSubtitle ?? ""} onChange={(e) => setSite({ ...site, newsletterSubtitle: e.target.value })} />
                  </Field>
                  <Field label="Email placeholder">
                    <Input
                      value={site.newsletterPlaceholder ?? ""}
                      onChange={(e) => setSite({ ...site, newsletterPlaceholder: e.target.value })}
                    />
                  </Field>
                  <Field label="Submit button label">
                    <Input value={site.newsletterCta ?? ""} onChange={(e) => setSite({ ...site, newsletterCta: e.target.value })} />
                  </Field>
                  <Field label="Fine print" className="sm:col-span-2">
                    <Input value={site.newsletterFinePrint ?? ""} onChange={(e) => setSite({ ...site, newsletterFinePrint: e.target.value })} />
                  </Field>
                </div>
                <Field label="Guides JSON (SiteGuide[]: id?, title, desc, borough, neighborhood, imageUrl, tone, ctaLabel?, ctaHref?)">
                  <Textarea value={guidesDraft} onChange={(e) => setGuidesDraft(e.target.value)} rows={10} className="font-mono text-xs" />
                </Field>
                <Field label="How it works steps JSON (step, title, desc, tone, icon)">
                  <Textarea value={howItWorksDraft} onChange={(e) => setHowItWorksDraft(e.target.value)} rows={8} className="font-mono text-xs" />
                </Field>
                <Field label="Trust pillars JSON (title, desc, tone, icon)">
                  <Textarea value={trustPillarsDraft} onChange={(e) => setTrustPillarsDraft(e.target.value)} rows={8} className="font-mono text-xs" />
                </Field>
                <Field label="Home popular pick provider names (exact catalog name per line)">
                  <Textarea
                    value={popularNamesDraft}
                    onChange={(e) => setPopularNamesDraft(e.target.value)}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </Field>
                <Field label="Home popular meet-up group id (empty hides card; use a real group id from your database)">
                  <Input value={meetupGroupIdDraft} onChange={(e) => setMeetupGroupIdDraft(e.target.value)} />
                </Field>
                <Field label="Calculator page JSON (title, subtitle, empty copy, aside, etc.)">
                  <Textarea value={calculatorDraft} onChange={(e) => setCalculatorDraft(e.target.value)} rows={12} className="font-mono text-xs" />
                </Field>
                <Field label="My Account JSON (nav tabs, saved filters, prefs sections, neighborhood card, alerts)">
                  <Textarea value={accountDraft} onChange={(e) => setAccountDraft(e.target.value)} rows={20} className="font-mono text-xs" />
                </Field>
                <Field label="Trust lines (footer rotating lines; one per line)">
                  <Textarea value={trustLinesDraft} onChange={(e) => setTrustLinesDraft(e.target.value)} rows={4} className="font-mono text-xs" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Sidebar promo title">
                    <Input value={site.sidebarTitle ?? ""} onChange={(e) => setSite({ ...site, sidebarTitle: e.target.value })} />
                  </Field>
                  <Field label="Sidebar promo body">
                    <Input value={site.sidebarBody ?? ""} onChange={(e) => setSite({ ...site, sidebarBody: e.target.value })} />
                  </Field>
                  <Field label="Sidebar CTA label">
                    <Input value={site.sidebarCtaLabel ?? ""} onChange={(e) => setSite({ ...site, sidebarCtaLabel: e.target.value })} />
                  </Field>
                </div>
                <Button onClick={saveSite} disabled={busy}>
                  Save site & branding
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="brain" className="space-y-3 rounded-xl border border-border bg-card p-4">
            {brain && (
              <>
                <Field label="Model id (OpenAI-compatible)">
                  <Input value={brain.model ?? ""} onChange={(e) => setBrain({ ...brain, model: e.target.value })} />
                </Field>
                <Field label="System prompt">
                  <Textarea value={brain.systemPrompt ?? ""} onChange={(e) => setBrain({ ...brain, systemPrompt: e.target.value })} rows={12} />
                </Field>
                <Field label="Starter prompts (JSON string array)">
                  <Textarea value={startersDraft} onChange={(e) => setStartersDraft(e.target.value)} rows={6} className="font-mono text-xs" />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Chat at <code className="rounded bg-muted px-1">/api/brain/chat</code> needs{" "}
                  <code className="rounded bg-muted px-1">BRAIN_OPENAI_API_KEY</code> or{" "}
                  <code className="rounded bg-muted px-1">CURATOR_OPENAI_API_KEY</code> in server{" "}
                  <code className="rounded bg-muted px-1">.env</code> (never NEXT_PUBLIC). Starters are read from{" "}
                  <code className="rounded bg-muted px-1">/api/public/brain</code>.
                </p>
                <Button onClick={saveBrain} disabled={busy}>
                  Save Night Guide settings
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-3 rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Upload an image to ImgBB (uses IMGBB_API_KEY). The direct URL is copied to your clipboard for pasting into provider/site fields.
            </p>
            <Input type="file" accept="image/*" disabled={busy} onChange={(e) => upload(e.target.files?.[0] ?? null)} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ProviderRow({
  p,
  disabled,
  onSave,
  onSaveMenu,
}: {
  p: Provider;
  disabled: boolean;
  onSave: (id: string, image: string) => void;
  onSaveMenu: (id: string, menuJson: string) => void;
}) {
  const [img, setImg] = useState(p.image);
  const [menuJson, setMenuJson] = useState(() => JSON.stringify(p.menu ?? null, null, 2));
  return (
    <div className="space-y-2 rounded-lg border border-border p-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[140px] flex-1">
          <p className="text-xs font-semibold text-foreground">{p.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {p.category} · {p.borough} · {p.id}
          </p>
        </div>
        <Input className="min-w-[200px] flex-[2] font-mono text-xs" value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://i.ibb.co/..." />
        <Button size="sm" variant="secondary" disabled={disabled} onClick={() => onSave(p.id, img)}>
          Save image
        </Button>
      </div>
      <textarea
        className="min-h-[80px] w-full rounded-md border border-input bg-background px-2 py-1 font-mono text-[10px]"
        value={menuJson}
        onChange={(e) => setMenuJson(e.target.value)}
        placeholder='{"sections":[],"sourceUrls":[],"lastVerifiedAt":"2026-05-16"}'
      />
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => onSaveMenu(p.id, menuJson)}>
        Save menu JSON
      </Button>
    </div>
  );
}

function MeetupRow({
  g,
  disabled,
  onSave,
}: {
  g: MeetupGroup;
  disabled: boolean;
  onSave: (id: string, url: string) => void;
}) {
  const [url, setUrl] = useState(g.coverImageUrl ?? "");
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-2">
      <div className="min-w-[160px] flex-1">
        <p className="text-xs font-semibold text-foreground">{g.name}</p>
        <p className="text-[10px] text-muted-foreground">{g.id}</p>
      </div>
      <Input className="min-w-[200px] flex-[2] font-mono text-xs" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Cover image URL" />
      <Button size="sm" variant="secondary" disabled={disabled} onClick={() => onSave(g.id, url)}>
        Save
      </Button>
    </div>
  );
}
