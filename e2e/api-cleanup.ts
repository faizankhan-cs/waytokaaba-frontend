/**
 * Test-data cleanup through the API, so a failing test never leaves records behind.
 * Uses the same admin credentials as the UI tests.
 */
const API = (process.env.E2E_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5062").replace(/\/+$/, "");
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@waytokaaba.local";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Dev-Admin-Pass-123";

async function headers() {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`E2E cleanup: admin login failed with HTTP ${res.status}`);
  const { accessToken } = (await res.json()) as { accessToken: string };
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

/** Deletes every hotel whose name starts with the given prefix. */
export async function deleteHotelsNamed(prefix: string) {
  const h = await headers();
  const res = await fetch(`${API}/api/admin/hotels?pageSize=50&q=${encodeURIComponent(prefix)}`, { headers: h });
  if (!res.ok) throw new Error(`E2E cleanup: listing hotels failed with HTTP ${res.status}`);
  const list = (await res.json()) as { items: { id: number; name: string }[] };
  for (const hotel of list.items.filter((x) => x.name.startsWith(prefix))) {
    await fetch(`${API}/api/hotels/${hotel.id}`, { method: "DELETE", headers: h });
  }
}

/** Removes the " (updated N)" suffix the package-edit test appends. */
export async function restorePackageDescription(slug: string) {
  const h = await headers();
  const list = (await (await fetch(`${API}/api/admin/packages?pageSize=50`, { headers: h })).json()) as { items: { id: number; slug: string }[] };
  const summary = list.items.find((p) => p.slug === slug);
  if (!summary) return;
  const p = await (await fetch(`${API}/api/admin/packages/${summary.id}`, { headers: h })).json();
  const cleaned = String(p.shortDescription).replace(/ \(updated \d+\)$/, "");
  if (cleaned === p.shortDescription) return;
  await fetch(`${API}/api/packages/${p.id}`, {
    method: "PUT",
    headers: h,
    body: JSON.stringify({
      ...p,
      shortDescription: cleaned,
      hotels: p.hotels.map((x: { hotelId: number; nights: number }) => ({ hotelId: x.hotelId, nights: x.nights })),
      services: p.services.map((x: { serviceName: string; description: string | null }) => ({ serviceName: x.serviceName, description: x.description })),
      images: p.images.map((x: { url: string; caption: string | null }) => ({ url: x.url, caption: x.caption })),
    }),
  });
}

/** Deletes every visa whose country starts with the given prefix. */
export async function deleteVisasNamed(prefix: string) {
  const h = await headers();
  const res = await fetch(`${API}/api/admin/visas?pageSize=50`, { headers: h });
  if (!res.ok) throw new Error(`E2E cleanup: listing visas failed with HTTP ${res.status}`);
  const list = (await res.json()) as { items: { id: number; country: string }[] };
  for (const visa of list.items.filter((x) => x.country.startsWith(prefix))) {
    await fetch(`${API}/api/visas/${visa.id}`, { method: "DELETE", headers: h });
  }
}
