"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AppShell,
  FileInput,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { AppButton } from "@/components/mantine/AppButton";
import type { Provider } from "@/types/provider";
import type { MeetupGroup } from "@/types/meetup";
import type { SiteDoc, SiteAccountSettings, SiteCalculatorCopy } from "@/types/site";
import type { Borough } from "@/types/provider";
import type { VenueReview } from "@/types/venueReview";
import { AdminReviewsTab } from "@/components/admin/AdminReviewsTab";
import { AdminProgramWeekTab } from "@/components/admin/AdminProgramWeekTab";
import { AdminPromotionsTab } from "@/components/admin/AdminPromotionsTab";
import type { NightEvent } from "@/types/event";
import { notify } from "@/lib/notify";

async function adminFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [meetups, setMeetups] = useState<MeetupGroup[]>([]);
  const [site, setSite] = useState<Partial<SiteDoc> | null>(null);
  const [locationsJson, setLocationsJson] = useState("");
  const [guidesDraft, setGuidesDraft] = useState("[]");
  const [howItWorksDraft, setHowItWorksDraft] = useState("[]");
  const [trustPillarsDraft, setTrustPillarsDraft] = useState("[]");
  const [trustLinesDraft, setTrustLinesDraft] = useState("");
  const [popularNamesDraft, setPopularNamesDraft] = useState("");
  const [meetupGroupIdDraft, setMeetupGroupIdDraft] = useState("");
  const [calculatorDraft, setCalculatorDraft] = useState("{}");
  const [accountDraft, setAccountDraft] = useState("{}");
  const [busy, setBusy] = useState(false);
  const [reviews, setReviews] = useState<VenueReview[]>([]);
  const [events, setEvents] = useState<NightEvent[]>([]);

  const load = useCallback(async () => {
    const [pr, mg, st, loc, rev, ev] = await Promise.all([
      adminFetch("/api/admin/providers"),
      adminFetch("/api/admin/meetup-groups"),
      adminFetch("/api/admin/site"),
      adminFetch("/api/admin/locations"),
      adminFetch("/api/admin/reviews?limit=50"),
      fetch("/api/public/events?locale=hu&upcoming=0"),
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
    if (loc.ok) {
      const rows = await loc.json();
      setLocationsJson(JSON.stringify(rows, null, 2));
    }
    if (rev.ok) setReviews(await rev.json());
    if (ev.ok) setEvents(await ev.json());
  }, [router]);

  const deleteReview = async (id: string) => {
    setBusy(true);
    try {
      const r = await adminFetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error();
      notify.success("Review removed");
      await load();
    } catch {
      notify.error("Delete failed");
    } finally {
      setBusy(false);
    }
  };

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
        notify.error("Invalid menu JSON");
        return;
      }
      const r = await adminFetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, menu }),
      });
      if (!r.ok) throw new Error();
      notify.success("Provider menu updated");
      await load();
    } catch {
      notify.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  const savePartnerTier = async (id: string, partnerTier: "listed" | "partner") => {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/providers", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, partnerTier }),
      });
      if (!r.ok) throw new Error("patch failed");
      notify.success(partnerTier === "partner" ? "Marked as partner" : "Partner tier cleared");
      await load();
    } catch {
      notify.error("Partner tier update failed");
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
      notify.success("Provider image updated");
      await load();
    } catch {
      notify.error("Save failed");
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
      notify.success("Meet-up cover updated");
      await load();
    } catch {
      notify.error("Save failed");
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
        notify.error("Invalid JSON in guides, steps, pillars, account, or calculator");
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
      notify.success("Site settings saved");
    } catch {
      notify.error("Save failed");
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
      notify.success("Locations saved");
    } catch {
      notify.error("Invalid JSON or save failed");
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
      notify.success(`Uploaded — URL copied to clipboard: ${j.url}`);
    } catch {
      notify.error("Upload failed — check IMGBB_API_KEY");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      header={{ height: 66 }}
      padding="md"
      styles={{ main: { maxWidth: 1200, margin: "0 auto", width: "100%" } }}
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md" wrap="wrap">
          <Group gap="md">
            <Title order={3}>
              <Link href="/">Pesti Est</Link>
            </Title>
            <Text c="dimmed">Admin</Text>
          </Group>
          <Group gap="xs">
            <AppButton variant="outline" component={Link} href="/">
              View site
            </AppButton>
            <AppButton variant="secondary" onClick={() => load()} disabled={busy}>
              Refresh data
            </AppButton>
            <AppButton variant="destructive" onClick={logout}>
              Log out
            </AppButton>
          </Group>
        </Group>
      </AppShell.Header>

      <Tabs defaultValue="providers" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="providers">Venues & listings</Tabs.Tab>
          <Tabs.Tab value="meetups">Meet-Up Groups</Tabs.Tab>
          <Tabs.Tab value="locations">Neighborhoods</Tabs.Tab>
          <Tabs.Tab value="site">Site & images</Tabs.Tab>
          <Tabs.Tab value="upload">ImgBB upload</Tabs.Tab>
          <Tabs.Tab value="reviews">Community reviews</Tabs.Tab>
          <Tabs.Tab value="program-week">Program week</Tabs.Tab>
          <Tabs.Tab value="promotions">Promotions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="providers" pt="md">
          <Paper withBorder p="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                All categories (Events, Parties, Restaurants, Cafés) share this provider list. Set each image to a full ImgBB (or HTTPS CDN) URL.
              </Text>
              <Stack gap="sm" mah={480} style={{ overflowY: "auto" }}>
                {providers.slice(0, 80).map((p) => (
                  <ProviderRow
                    key={p.id}
                    p={p}
                    disabled={busy}
                    onSave={saveProviderImage}
                    onSaveMenu={saveProviderMenu}
                    onSavePartnerTier={savePartnerTier}
                  />
                ))}
              </Stack>
              {providers.length > 80 ? (
                <Text size="xs" c="dimmed">
                  Showing first 80 of {providers.length}. Use Mongo tools for bulk edits.
                </Text>
              ) : null}
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="md">
          <Paper withBorder p="md">
            <AdminReviewsTab reviews={reviews} busy={busy} onDelete={deleteReview} />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="meetups" pt="md">
          <Paper withBorder p="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Optional hero image per group (CDN URL).
              </Text>
              <Stack gap="sm" mah={480} style={{ overflowY: "auto" }}>
                {meetups.map((g) => (
                  <MeetupRow key={g.id} g={g} disabled={busy} onSave={saveMeetupCover} />
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="locations" pt="md">
          <Paper withBorder p="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Array of {"{ borough, neighborhoods: string[] }"} — used by Discover & Meetups.
              </Text>
              <Textarea value={locationsJson} onChange={(e) => setLocationsJson(e.currentTarget.value)} minRows={16} autosize styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
              <AppButton onClick={saveLocations} disabled={busy}>
                Save neighborhoods
              </AppButton>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="site" pt="md">
          <Paper withBorder p="md">
            {site ? (
              <Stack gap="sm">
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Field label="Logo URL — dark mode (ImgBB or /images/logo.png)">
                      <TextInput value={site.logoUrl ?? ""} onChange={(e) => setSite({ ...site, logoUrl: e.currentTarget.value })} placeholder="/images/logo.png" />
                    </Field>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Field label="Logo URL — light mode (ImgBB or /images/logo-light.png)">
                      <TextInput value={site.logoLightUrl ?? ""} onChange={(e) => setSite({ ...site, logoLightUrl: e.currentTarget.value })} placeholder="/images/logo-light.png" />
                    </Field>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Field label="Home hero image URL">
                      <TextInput value={site.homeHeroUrl ?? ""} onChange={(e) => setSite({ ...site, homeHeroUrl: e.currentTarget.value })} />
                    </Field>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Field label="Discover hero image URL">
                      <TextInput value={site.discoverHeroUrl ?? ""} onChange={(e) => setSite({ ...site, discoverHeroUrl: e.currentTarget.value })} />
                    </Field>
                  </Grid.Col>
                </Grid>

                <Text fw={600} size="sm">
                  Display currency rates
                </Text>
                <Text size="xs" c="dimmed">
                  Prices are stored in Hungarian forint (HUF). These fixed rates convert HUF to EUR and USD in the app.
                </Text>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Field label="HUF per 1 EUR (e.g. 350)">
                      <TextInput
                        type="number"
                        value={String(site.currencyRates?.hufPerEur ?? 350)}
                        onChange={(e) =>
                          setSite({
                            ...site,
                            currencyRates: {
                              ...site.currencyRates,
                              hufPerEur: Number(e.currentTarget.value) || 350,
                              hufPerUsd: site.currencyRates?.hufPerUsd ?? 300,
                            },
                          })
                        }
                      />
                    </Field>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Field label="HUF per 1 USD (e.g. 300)">
                      <TextInput
                        type="number"
                        value={String(site.currencyRates?.hufPerUsd ?? 300)}
                        onChange={(e) =>
                          setSite({
                            ...site,
                            currencyRates: {
                              hufPerEur: site.currencyRates?.hufPerEur ?? 350,
                              hufPerUsd: Number(e.currentTarget.value) || 300,
                            },
                          })
                        }
                      />
                    </Field>
                  </Grid.Col>
                </Grid>

                <Text fw={600} size="sm">
                  Home hero copy
                </Text>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label="Home hero title"><TextInput value={site.homeHeroTitle ?? ""} onChange={(e) => setSite({ ...site, homeHeroTitle: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label="Home hero subtitle"><TextInput value={site.homeHeroSubtitle ?? ""} onChange={(e) => setSite({ ...site, homeHeroSubtitle: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label="Primary CTA label"><TextInput value={site.homeHeroPrimaryCta ?? ""} onChange={(e) => setSite({ ...site, homeHeroPrimaryCta: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label="Secondary CTA label"><TextInput value={site.homeHeroSecondaryCta ?? ""} onChange={(e) => setSite({ ...site, homeHeroSecondaryCta: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={12}><Field label="Hero tagline"><TextInput value={site.homeHeroTagline ?? ""} onChange={(e) => setSite({ ...site, homeHeroTagline: e.currentTarget.value })} /></Field></Grid.Col>
                </Grid>

                <Text fw={600} size="sm">
                  Home sections
                </Text>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label="Categories section title"><TextInput value={site.homeCategoriesTitle ?? ""} onChange={(e) => setSite({ ...site, homeCategoriesTitle: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label="Neighborhood section title"><TextInput value={site.neighborhoodSectionTitle ?? ""} onChange={(e) => setSite({ ...site, neighborhoodSectionTitle: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={12}><Field label="Popular neighborhoods caption (use {borough} token)"><TextInput value={site.popularNeighborhoodsCaption ?? ""} onChange={(e) => setSite({ ...site, popularNeighborhoodsCaption: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label="Guides section title"><TextInput value={site.guidesSectionTitle ?? ""} onChange={(e) => setSite({ ...site, guidesSectionTitle: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label={'Guides "view all" label'}><TextInput value={site.guidesViewAllLabel ?? ""} onChange={(e) => setSite({ ...site, guidesViewAllLabel: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={12}><Field label={'Guides "view all" URL (optional, https or /path)'}><TextInput value={site.guidesViewAllHref ?? ""} onChange={(e) => setSite({ ...site, guidesViewAllHref: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={12}><Field label="How it works section title"><TextInput value={site.howItWorksSectionTitle ?? ""} onChange={(e) => setSite({ ...site, howItWorksSectionTitle: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label="Popular picks section title"><TextInput value={site.popularPicksSectionTitle ?? ""} onChange={(e) => setSite({ ...site, popularPicksSectionTitle: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}><Field label={'Popular picks "view all" label'}><TextInput value={site.popularPicksViewAllLabel ?? ""} onChange={(e) => setSite({ ...site, popularPicksViewAllLabel: e.currentTarget.value })} /></Field></Grid.Col>
                </Grid>

                <Field label="Guides JSON (SiteGuide[]: id?, title, desc, borough, neighborhood, imageUrl, tone, ctaLabel?, ctaHref?)">
                  <Textarea value={guidesDraft} onChange={(e) => setGuidesDraft(e.currentTarget.value)} minRows={10} autosize styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
                </Field>
                <Field label="How it works steps JSON (step, title, desc, tone, icon)">
                  <Textarea value={howItWorksDraft} onChange={(e) => setHowItWorksDraft(e.currentTarget.value)} minRows={8} autosize styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
                </Field>
                <Field label="Trust pillars JSON (title, desc, tone, icon)">
                  <Textarea value={trustPillarsDraft} onChange={(e) => setTrustPillarsDraft(e.currentTarget.value)} minRows={8} autosize styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
                </Field>
                <Field label="Home popular pick provider names (exact catalog name per line)">
                  <Textarea value={popularNamesDraft} onChange={(e) => setPopularNamesDraft(e.currentTarget.value)} minRows={6} autosize styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
                </Field>
                <Field label="Home popular meet-up group id (empty hides card; use a real group id from your database)">
                  <TextInput value={meetupGroupIdDraft} onChange={(e) => setMeetupGroupIdDraft(e.currentTarget.value)} />
                </Field>
                <Field label="Calculator page JSON (title, subtitle, empty copy, aside, etc.)">
                  <Textarea value={calculatorDraft} onChange={(e) => setCalculatorDraft(e.currentTarget.value)} minRows={12} autosize styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
                </Field>
                <Field label="My Account JSON (nav tabs, saved filters, prefs sections, neighborhood card, alerts)">
                  <Textarea value={accountDraft} onChange={(e) => setAccountDraft(e.currentTarget.value)} minRows={20} autosize styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
                </Field>
                <Field label="Trust lines (footer rotating lines; one per line)">
                  <Textarea value={trustLinesDraft} onChange={(e) => setTrustLinesDraft(e.currentTarget.value)} minRows={4} autosize styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
                </Field>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 4 }}><Field label="Sidebar promo title"><TextInput value={site.sidebarTitle ?? ""} onChange={(e) => setSite({ ...site, sidebarTitle: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}><Field label="Sidebar promo body"><TextInput value={site.sidebarBody ?? ""} onChange={(e) => setSite({ ...site, sidebarBody: e.currentTarget.value })} /></Field></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 4 }}><Field label="Sidebar CTA label"><TextInput value={site.sidebarCtaLabel ?? ""} onChange={(e) => setSite({ ...site, sidebarCtaLabel: e.currentTarget.value })} /></Field></Grid.Col>
                </Grid>
                <AppButton onClick={saveSite} disabled={busy}>
                  Save site & branding
                </AppButton>
              </Stack>
            ) : null}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="program-week" pt="md">
          <Paper withBorder p="md">
            <AdminProgramWeekTab providers={providers} events={events} />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="promotions" pt="md">
          <Paper withBorder p="md">
            <AdminPromotionsTab />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="upload" pt="md">
          <Paper withBorder p="md">
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Upload an image to ImgBB (uses IMGBB_API_KEY). The direct URL is copied to your clipboard for pasting into provider/site fields.
              </Text>
              <FileInput accept="image/*" disabled={busy} onChange={(file) => upload(file ?? null)} />
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap={4}>
      <Text size="xs" fw={500} c="dimmed">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

function ProviderRow({
  p,
  disabled,
  onSave,
  onSaveMenu,
  onSavePartnerTier,
}: {
  p: Provider;
  disabled: boolean;
  onSave: (id: string, image: string) => void;
  onSaveMenu: (id: string, menuJson: string) => void;
  onSavePartnerTier: (id: string, tier: "listed" | "partner") => void;
}) {
  const [img, setImg] = useState(p.image);
  const [menuJson, setMenuJson] = useState(() => JSON.stringify(p.menu ?? null, null, 2));
  const [partnerTier, setPartnerTier] = useState<"listed" | "partner">(p.partnerTier ?? "listed");
  return (
    <Paper withBorder p="sm">
      <Stack gap="sm">
        <Group gap="sm" align="end" wrap="wrap">
          <Stack gap={2} style={{ minWidth: 140, flex: 1 }}>
            <Text size="xs" fw={600}>
              {p.name}
            </Text>
            <Text size="10px" c="dimmed">
            {p.category} · {p.borough} · {p.id}
            </Text>
          </Stack>
          <Select
            data={[
              { value: "listed", label: "listed" },
              { value: "partner", label: "partner" },
            ]}
            value={partnerTier}
            disabled={disabled}
            onChange={(value) => setPartnerTier((value as "listed" | "partner") ?? "listed")}
          />
          <AppButton size="xs" variant="outline" disabled={disabled} onClick={() => onSavePartnerTier(p.id, partnerTier)}>
            Save partner
          </AppButton>
          <TextInput
            style={{ minWidth: 220, flex: 2 }}
            value={img}
            onChange={(e) => setImg(e.currentTarget.value)}
            placeholder="https://i.ibb.co/..."
            styles={{ input: { fontFamily: "monospace", fontSize: 12 } }}
          />
          <AppButton size="xs" variant="secondary" disabled={disabled} onClick={() => onSave(p.id, img)}>
            Save image
          </AppButton>
        </Group>
        <Textarea
          value={menuJson}
          onChange={(e) => setMenuJson(e.currentTarget.value)}
          minRows={5}
          autosize
          placeholder='{"sections":[],"sourceUrls":[],"lastVerifiedAt":"2026-05-16"}'
          styles={{ input: { fontFamily: "monospace", fontSize: 11 } }}
        />
        <AppButton size="xs" variant="outline" disabled={disabled} onClick={() => onSaveMenu(p.id, menuJson)}>
          Save menu JSON
        </AppButton>
      </Stack>
    </Paper>
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
    <Paper withBorder p="sm">
      <Group gap="sm" align="end" wrap="wrap">
        <Stack gap={2} style={{ minWidth: 160, flex: 1 }}>
          <Text size="xs" fw={600}>
            {g.name}
          </Text>
          <Text size="10px" c="dimmed">
            {g.id}
          </Text>
        </Stack>
        <TextInput
          style={{ minWidth: 220, flex: 2 }}
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          placeholder="Cover image URL"
          styles={{ input: { fontFamily: "monospace", fontSize: 12 } }}
        />
        <AppButton size="xs" variant="secondary" disabled={disabled} onClick={() => onSave(g.id, url)}>
          Save
        </AppButton>
      </Group>
    </Paper>
  );
}
