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

## Owner choice (pending)

- Landing: `product-performs` / `split-stage` / `borrowed-category`
- App: `achromatic-ledger` / `editorial-greeting`

After the choice: deal the full sheet with `--direction` / `--style`, mock one screen of each, then replace `DESIGN.md`.
