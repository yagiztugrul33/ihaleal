/** Intelligence & platform route constants — single source of truth */

export const ROUTES = {
  HOME: "/",
  INTELLIGENCE_HUB: "/arastirma",
  GES_ANALYSIS: "/arastirma/ges",
  PARCEL_INTELLIGENCE: "/arastirma/parsel",
  LAND_INVESTMENT: "/arastirma/yatirim",
  WAR_ROOM: "/arastirma/war-room",
  GIS_INTELLIGENCE: "/arastirma/harita",
  KKA_HUB: "/kat-karsiligi",
  KKA_STUDIO: "/kat-karsiligi/studio",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const INTELLIGENCE_ROUTES = [
  ROUTES.INTELLIGENCE_HUB,
  ROUTES.GES_ANALYSIS,
  ROUTES.PARCEL_INTELLIGENCE,
  ROUTES.LAND_INVESTMENT,
  ROUTES.WAR_ROOM,
] as const;