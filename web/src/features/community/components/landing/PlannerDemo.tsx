"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { sampleTrip, vehicles, type VehicleId } from "./content";
import { Fragment, StopRow } from "./Fragments";

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours} giờ ${String(minutes).padStart(2, "0")} phút`;
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2 py-3">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden="true" className="text-sm">{label}</span>
      <div className="grid grid-cols-3 rounded-md bg-muted p-0.5">
        {options.map((option) => (
          <label
            key={option.id}
            className="relative flex min-h-11 cursor-pointer items-center justify-center whitespace-nowrap rounded px-2 text-sm text-muted-foreground has-[:checked]:bg-card has-[:checked]:font-medium has-[:checked]:text-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring sm:min-h-9"
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${checked ? "bg-primary" : "bg-border"}`}
      >
        <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-card transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

/** Live demo: the controls change the itinerary on the left at once. All figures are an example trip. */
export default function PlannerDemo() {
  const [vehicle, setVehicle] = useState<VehicleId>("bike");
  const [days, setDays] = useState(2);
  const [lunch, setLunch] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [open, setOpen] = useState(false);
  const daysId = useId();

  const { groups, totalKm, minutes } = useMemo(() => {
    const stops = sampleTrip.stops;
    const per = Math.ceil(stops.length / days);
    const groups: { day: number; stops: { name: string; legKm: number; index: number }[] }[] = [];
    stops.forEach((stop, index) => {
      const day = Math.min(Math.floor(index / per), days - 1) + 1;
      let group = groups.find((g) => g.day === day);
      if (!group) {
        group = { day, stops: [] };
        groups.push(group);
      }
      group.stops.push({ ...stop, index: index + 1 });
    });
    const totalKm = stops.reduce((sum, stop) => sum + stop.legKm, 0);
    const kmh = vehicles.find((v) => v.id === vehicle)?.kmh ?? 35;
    const minutes = (totalKm / kmh) * 60 + (lunch ? sampleTrip.lunchStop.minutes : 0);
    return { groups, totalKm, minutes };
  }, [days, vehicle, lunch]);

  return (
    <Fragment className="grid overflow-hidden lg:grid-cols-[58fr_42fr]">
      <div className="bg-muted p-4 sm:p-6" aria-live="polite">
        <p className="text-sm text-muted-foreground">Chuyến đi mẫu · {isPublic ? "Công khai" : "Riêng tư"}</p>
        <h3 className="mt-1 text-xl font-semibold">{sampleTrip.name}</h3>
        <div className="mt-5 space-y-5">
          {groups.map((group) => (
            <div key={group.day}>
              <p className="px-3 text-sm font-medium">Ngày {group.day}</p>
              <ol className="mt-1">
                {group.stops.map((stop) => (
                  <StopRow
                    key={stop.name}
                    index={stop.index}
                    name={stop.name}
                    detail={stop.legKm === 0 ? "Xuất phát" : `${stop.legKm} km`}
                  />
                ))}
                {lunch && group.day === 1 && (
                  <li className="flex min-h-12 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground">
                    <span className="w-5" />
                    <span className="flex-1">{sampleTrip.lunchStop.name}</span>
                    <span className="tabular-nums">{sampleTrip.lunchStop.minutes} phút</span>
                  </li>
                )}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col p-4 sm:p-6">
        <div className="divide-y divide-border">
          <Segmented
            label="Phương tiện"
            value={vehicle}
            options={vehicles}
            onChange={setVehicle}
          />
          <div className="flex min-h-11 items-center justify-between gap-3 py-1">
            <label htmlFor={daysId} className="text-sm">Số ngày</label>
            <div className="flex items-center gap-3">
              <input
                id={daysId}
                type="range"
                min={1}
                max={4}
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="h-11 w-28 accent-primary sm:h-6"
              />
              <span className="w-6 text-right text-sm tabular-nums">{days}</span>
            </div>
          </div>
          <Switch label="Thêm giờ nghỉ ăn trưa" checked={lunch} onChange={setLunch} />
          <Switch label="Hiển thị công khai" checked={isPublic} onChange={setIsPublic} />
                  </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Số liệu chỉ để minh họa: quãng đường làm tròn và tốc độ trung bình giả định theo phương tiện.
        </p>
        <div className="mt-auto pt-6">
        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5">
          <div>
            <dt className="text-sm text-muted-foreground">Quãng đường</dt>
            <dd className="mt-1 text-xl tabular-nums">{totalKm} km</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Thời gian ước tính</dt>
            <dd className="mt-1 text-xl tabular-nums">{formatDuration(minutes)}</dd>
          </div>
        </dl>

          <Button variant="link" className="h-auto min-h-11 p-0 underline-offset-4" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? "Ẩn cách tính" : "Xem cách tính"}
          </Button>
          {open && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Thời gian = quãng đường ÷ tốc độ trung bình ({vehicles.map((v) => `${v.label} ${v.kmh} km/h`).join(", ")}) cộng giờ nghỉ nếu bật.
            </p>
          )}
        </div>
      </div>
    </Fragment>
  );
}
