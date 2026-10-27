# Tripz — Design Direction (draft, awaiting owner choice)

Date: 2026-10-27. Branch: `ui/redesign`. Process: taste-skill (`.claude/skills/taste-skill`), palette and type kept from the reference sources (`--keep palette,type`).

## Subject inventory (what only Tripz has)

All taken from the product as built; nothing here is a claim the product cannot support.

1. The name: Tripz, a road trip, Vietnam only.
2. Three vehicle modes: motorbike, car, camper.
3. A multi-day itinerary made of ordered stops.
4. One shared map where the route is drawn.
5. Companions who edit the same trip (invitations).
6. Road mode: the trip used while driving.
7. Public routes that anyone can read and copy into their own account.
8. Planned budget per trip ("Ngân sách dự kiến").
9. Trip memory and a travel book after the trip.
10. Partners (listings, campaigns, reviews) and an admin desk behind the product.
11. Vietnamese place names as the content: passes, coast roads, towns.

## Landing argument (claim → proof, one line per section)

| Section | Claim | Proof (real, in the product) |
| --- | --- | --- |
| Hero | Plan the whole road trip on one map | The working planner fragment itself |
| Features | Itinerary, stops, route and companions live together | Built from the real planner screens |
| How it works | Three steps from empty trip to a route you can drive | The actual flow: create, add stops, share |
| Public routes | Start from a route someone already drove | Live list of public trips (empty state when none) |
| CTA | Create the first trip | Link to signup |
| Footer | Where to go next | Real routes only |

No testimonials, press, traveler counts, ratings or prices.

## Directions dealt

### Landing (`draw.mjs --sector consumer-app --keep palette,type --options 3`)

| Id | Idea | Fit for Tripz |
| --- | --- | --- |
| `product-performs` | Put the working product on the first screen instead of describing it | **Recommended.** The planner (days, stops, route) is real and is the strongest proof. We have one photograph only, so a photo-led layout would repeat the stock look. |
| `split-stage` | Half the screen is a fixed photograph, the other half scrolls | Needs a strong picture set; we have one hero photograph. Possible later with credited Commons images. |
| `borrowed-category` | Dress the product as another category | Needs a deliberate borrowed category; risks gimmick for a utility product. |

### App screens (`draw.mjs --app --kind workspace --keep palette,type`)

| Id | Idea | Fit for Tripz |
| --- | --- | --- |
| `achromatic-ledger` | Chrome without colour; one chart hue marks the main data; near-black primary action; hue only where a figure changed | **Recommended.** Matches the dashboard template's neutral palette and suits partner and admin tables, finance and moderation. |
| `editorial-greeting` | Typeset greeting as the h1, regular-weight figures on tonal panels, centered 1100px column | Good for the traveler home only; a centered column is wrong for the planner, tables and admin. |

## Owner choice (2026-10-27): follow the recommendations

- Landing: **`product-performs`**, seed 1001830175. Sheet: hero "Column on one line", showcase "Live demo with controls", features "Fixed output, live controls", how-it-works "Call and response column", list "Day tabs, banded agenda", cta "A sentence with a blank", footer "A single quiet line", motion "Slow crossfade".
- App: **`achromatic-ledger`**, seed 1718194201, kind `workspace`. Chrome has no colour, near-black primary, one chart hue on the main data element, a small signal only where a figure changed.

Full sheets are reproducible with the commands in `.taste-skill/` (ignored by git); the decisions below are the durable record.

## How each dealt section maps to real Tripz content

| Dealt section | Tripz content (all real) |
| --- | --- |
| Hero: column on one line, peeking panel | Headline about planning a road trip on one map; the peeking panel is two real itinerary rows (day, stop, distance) built as the product's own HTML fragment (`data-ui`) |
| Showcase: live demo with controls | The planner fragment: change vehicle (motorbike / car / camper), days, stops and the route and budget summary respond. Numbers are computed, labelled as an example trip |
| Features: fixed output, live controls | Fixed output = one trip sheet; controls = companions, stops order, visibility (public/private). Operating a control changes the sheet |
| How it works: call and response | Call = what the traveler enters (a destination, a day); response = the itinerary row returned. Three exchanges, last one the finished route |
| List: day tabs, banded agenda | Day tabs = trip days; bands = stops of that day (time, place, note). No portraits (no people shown) |
| CTA: sentence with a blank | Adjusted: no email capture exists, so the blank is a destination field that opens `/signup?next=` or the planner; button is the last word |
| Footer: single quiet line | Real routes only |

## Redraws and adjustments (recorded as the sheet requires)

1. **Pictures floor (four real pictures).** The sheet asks for at least four real pictures. Only one credited photograph exists today, so the plan is to gather three to five credited images of Vietnamese roads and places with `assets.mjs`, stored with `CREDITS.md`. If honest pictures cannot be found, the shortfall is listed as a deviation, not filled with stock.
2. **App shell: icon rail becomes a collapsible labelled sidebar.** The dealt shell is an unlabelled icon rail, which suits few destinations. Traveler has about ten destinations and admin about six with sub-sections, so a rail would hide labels people need. We keep the dashboard template's sidebar (labelled by default, collapsible to an icon rail with tooltips) and the style's flat, neutral treatment of it. Mobile uses the bottom bar the style prescribes.
3. **Chart hue.** The style's `#1d5fbf` is replaced by the template's `--chart-3` (blue-slate) which already belongs to the kept palette, only where a main data element exists. It must reach 3:1 on white.
4. **Figures.** Regular-weight tabular figures in Inter (`font-variant-numeric: tabular-nums`). Geist Mono is not used.
5. **Greeting home (traveler).** The traveler dashboard borrows the style's "home" screen (greeting as h1 in the sans at 24/400, four count tiles, panels) but uses the full content width of the shell, not a centred 1100 px column, so the planner and tables share one frame.
6. **Login and other auth pages.** Owner-specified Beam stage with gradient wash is an explicit exception to the no-gradient rule.

## Type and palette (kept, from the reference sources)

Inter. Neutral oklch scale and `--chart-1..5` from the dashboard template (already in `web/src/app/globals.css`). Primary action near-black. One accent rule: color only on data and on one signal per screen.
