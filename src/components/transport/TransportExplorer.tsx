"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Luggage, MapPin, Users } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { DemoBadge } from "@/components/ui/primitives";
import { whatsappLink } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { priceFor, routeLabel, transportMessage } from "@/lib/transport";
import type { TransportCatalog, TransportRoute, TransportVehicle } from "@/lib/types";

const WA_BUTTON = "btn bg-[#25D366] text-white hover:bg-[#1ebe5a]";

/**
 * Vehicle picker plus rates. Picking a vehicle highlights its column in the desktop table and
 * switches the phone list to that vehicle's prices. Every price has a pre-filled WhatsApp booking link.
 */
export function TransportExplorer({ catalog }: { catalog: TransportCatalog }) {
  const { vehicles, routes, currency } = catalog;
  const [selectedId, setSelectedId] = useState(vehicles[0]?.id);
  const selected = vehicles.find((v) => v.id === selectedId) ?? vehicles[0];

  return (
    <div className="space-y-10">
      <VehiclePicker vehicles={vehicles} selectedId={selected.id} currency={currency} onSelect={setSelectedId} />

      <section aria-labelledby="rates-heading" className="space-y-4">
        <div>
          <h2 id="rates-heading" className="heading-section">Routes &amp; Rates</h2>
          <p className="mt-1 text-sm text-ink-500">
            Showing prices for <strong className="text-ink-900">{selected.name}</strong>. Pick another vehicle above to compare.
          </p>
        </div>
        <RatesTable vehicles={vehicles} routes={routes} selected={selected} currency={currency} onSelect={setSelectedId} />
        <RatesList routes={routes} selected={selected} currency={currency} />
      </section>
    </div>
  );
}

function VehiclePicker({
  vehicles,
  selectedId,
  currency,
  onSelect,
}: {
  vehicles: TransportVehicle[];
  selectedId: number;
  currency: string;
  onSelect: (id: number) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="heading-section mb-1">Choose Your Vehicle</legend>
      <p className="mb-5 text-sm text-ink-500">Private, air-conditioned vehicles with a professional driver.</p>
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
        {vehicles.map((v) => {
          const active = v.id === selectedId;
          return (
            <label
              key={v.id}
              className={`card group relative flex w-[72%] shrink-0 cursor-pointer snap-start flex-col overflow-hidden transition sm:w-[42%] lg:w-auto ${
                active ? "ring-2 ring-gold-500 shadow-[var(--shadow-card-hover)]" : "hover:shadow-[var(--shadow-card-hover)]"
              } has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold-500`}
            >
              <input
                type="radio"
                name="vehicle"
                value={v.id}
                checked={active}
                onChange={() => onSelect(v.id)}
                className="sr-only"
                aria-label={`${v.name}, ${v.seats} seats`}
              />
              <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                <Image src={v.imageUrl} alt="" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 42vw, 72vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                {v.isDemoContent && <DemoBadge className="absolute top-2 left-2" />}
                {active && (
                  <span className="absolute top-2 right-2 rounded-full bg-gold-500 p-1 text-brand-950 shadow">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className={`font-semibold ${active ? "text-gold-700" : "text-ink-900"}`}>{v.name}</span>
                <span className="mt-2 flex items-center gap-4 text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" aria-hidden /> {v.seats} seats
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="h-3.5 w-3.5" aria-hidden /> {v.bags} bags
                  </span>
                </span>
                {v.startingPrice !== null && (
                  <span className="mt-auto pt-3 text-xs text-ink-500">
                    From <span className="text-base font-bold text-brand-800">{formatPrice(v.startingPrice, currency)}</span>
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Desktop: every route against every vehicle, with the selected vehicle's column highlighted. */
function RatesTable({
  vehicles,
  routes,
  selected,
  currency,
  onSelect,
}: {
  vehicles: TransportVehicle[];
  routes: TransportRoute[];
  selected: TransportVehicle;
  currency: string;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="card hidden overflow-x-auto md:block">
      <table className="w-full min-w-[760px] text-sm">
        <caption className="sr-only">Private transport prices per vehicle, one way</caption>
        <thead>
          <tr className="border-b border-sand-200 bg-brand-950 text-left text-white">
            <th scope="col" className="px-4 py-3 font-semibold">Route</th>
            {vehicles.map((v) => {
              const active = v.id === selected.id;
              return (
                <th key={v.id} scope="col" className={`px-3 py-2 text-right ${active ? "bg-gold-500 text-brand-950" : ""}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(v.id)}
                    aria-pressed={active}
                    className="w-full rounded px-1 py-1 text-right font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-gold-400"
                  >
                    {v.name}
                  </button>
                </th>
              );
            })}
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Book</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => {
            const price = priceFor(route, selected.id);
            return (
              <tr key={route.id} className="border-b border-sand-200 last:border-0 hover:bg-sand-100/60">
                <th scope="row" className="px-4 py-3 text-left font-medium text-ink-900">
                  <span className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                    <span>
                      {routeLabel(route)}
                      {route.note && <span className="block text-xs font-normal text-ink-500">{route.note}</span>}
                    </span>
                  </span>
                </th>
                {vehicles.map((v) => {
                  const p = priceFor(route, v.id);
                  const active = v.id === selected.id;
                  return (
                    <td
                      key={v.id}
                      className={`px-3 py-3 text-right tabular-nums ${active ? "bg-gold-50 font-bold text-ink-900" : "text-ink-700"}`}
                    >
                      {p === null ? <span className="text-ink-300">—</span> : formatPrice(p, currency)}
                    </td>
                  );
                })}
                <td className="px-4 py-2 text-right">
                  {price !== null && (
                    <a
                      href={whatsappLink(transportMessage(route, selected))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${WA_BUTTON} px-3 py-1.5 text-xs whitespace-nowrap`}
                      aria-label={`Book ${selected.name} for ${routeLabel(route)} on WhatsApp`}
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5" /> Book
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Phones: the selected vehicle's price on each route, with a booking button. */
function RatesList({ routes, selected, currency }: { routes: TransportRoute[]; selected: TransportVehicle; currency: string }) {
  return (
    <ul className="space-y-3 md:hidden" aria-label={`${selected.name} prices`}>
      {routes.map((route) => {
        const price = priceFor(route, selected.id);
        return (
          <li key={route.id} className="card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="flex items-start gap-2 font-medium text-ink-900">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                {routeLabel(route)}
              </p>
              {route.note && <p className="mt-0.5 pl-6 text-xs text-ink-500">{route.note}</p>}
              <p className="mt-1 pl-6 text-lg font-bold text-brand-800">
                {price === null ? <span className="text-sm font-normal text-ink-500">Not available</span> : formatPrice(price, currency)}
              </p>
            </div>
            {price !== null && (
              <a
                href={whatsappLink(transportMessage(route, selected))}
                target="_blank"
                rel="noopener noreferrer"
                className={`${WA_BUTTON} shrink-0 px-3 py-2 text-xs`}
                aria-label={`Book ${selected.name} for ${routeLabel(route)} on WhatsApp`}
              >
                <WhatsAppIcon className="h-4 w-4" /> Book
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
