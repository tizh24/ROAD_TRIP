// Single source of Vietnamese landing content.
// Nothing here asserts metrics, ratings or people. The sample trip is an illustration
// and is labelled as one on the page; distances and speeds are rounded examples.

import haiVan from "@/assets/landing/hai-van-pass.webp";
import maPiLengDawn from "@/assets/landing/ma-pi-leng-dawn.webp";
import riceTerraces from "@/assets/landing/ha-giang-rice-terraces.webp";
import ferry from "@/assets/landing/cai-von-ferry.webp";

export const landingRoutes = {
  plan: "/trips/new",
  explore: "/explore",
  feed: "/feed",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
} as const;

/** The vehicles Tripz plans for. Speeds are example averages used only by the demo. */
export const vehicles = [
  { id: "bike", label: "Xe máy", kmh: 35 },
  { id: "car", label: "Ô tô", kmh: 40 },
  { id: "camper", label: "Camper", kmh: 30 },
] as const;
export type VehicleId = (typeof vehicles)[number]["id"];

/** Example trip used by the hero fragment and the live demo. Legs are rounded kilometres. */
export const sampleTrip = {
  name: "Hà Giang, cao nguyên đá",
  stops: [
    { name: "Thành phố Hà Giang", legKm: 0 },
    { name: "Quản Bạ", legKm: 45 },
    { name: "Yên Minh", legKm: 30 },
    { name: "Đồng Văn", legKm: 50 },
    { name: "Mèo Vạc", legKm: 22 },
  ],
  lunchStop: { name: "Nghỉ ăn trưa", minutes: 45 },
} as const;

export interface Destination {
  id: string;
  name: string;
  region: string;
  query: string;
  image: typeof haiVan;
  alt: string;
}

export const destinations: Destination[] = [
  {
    id: "hai-van",
    name: "Đèo Hải Vân",
    region: "Đà Nẵng và Huế",
    query: "Hải Vân",
    image: haiVan,
    alt: "Khúc cua chữ U trên đèo Hải Vân, núi phủ rừng xanh phía sau",
  },
  {
    id: "ma-pi-leng",
    name: "Mã Pí Lèng",
    region: "Hà Giang",
    query: "Mã Pí Lèng",
    image: maPiLengDawn,
    alt: "Dãy núi đá Hà Giang lúc chạng vạng dưới bầu trời xanh thẫm",
  },
  {
    id: "ruong-bac-thang",
    name: "Ruộng bậc thang Hà Giang",
    region: "Hà Giang",
    query: "Hà Giang",
    image: riceTerraces,
    alt: "Ruộng lúa xanh bậc thang trải dưới chân núi ở Hà Giang",
  },
  {
    id: "cai-von",
    name: "Sông Cái Vồn",
    region: "Đồng bằng sông Cửu Long",
    query: "Cái Vồn",
    image: ferry,
    alt: "Chiếc phà nhỏ chở xe máy và khách qua sông Cái Vồn nước nâu",
  },
];

export interface PhotoCredit {
  title: string;
  creator: string;
  licence: string;
  page: string;
}

/** Credit lines for every found picture, shown small in the footer. */
export const photoCredits: PhotoCredit[] = [
  { title: "Lăng Cô, Hải Vân Pass", creator: "Steffen Schmitz", licence: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:L%C4%83ng_C%C3%B4,_H%E1%BA%A3i_V%C3%A2n_Pass,_2020-01_CN-01.jpg" },
  { title: "Mã Pí Lèng Pass, Vietnam", creator: "Hoach Le Dinh", licence: "CC0", page: "https://commons.wikimedia.org/wiki/File:M%C3%A3_P%C3%AD_L%C3%A8ng_Pass,_Vietnam.jpg" },
  { title: "Ha Giang rizieres bis", creator: "Velvet", licence: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:Ha_Giang_rizieres_bis.jpg" },
  { title: "Motorbike river ferry Vietnam", creator: "Gzzz", licence: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:Motorbike_river_ferry_Vietnam.jpg" },
];

export const emergencyNumbers = [
  { number: "113", label: "Công an, CSGT" },
  { number: "115", label: "Cấp cứu y tế" },
  { number: "116", label: "Cứu hộ đường bộ" },
] as const;

export const footerLinks = [
  { href: "/explore", label: "Khám phá" },
  { href: "/feed", label: "Cộng đồng" },
  { href: "/partner/register", label: "Đối tác" },
  { href: "/login", label: "Đăng nhập" },
] as const;
