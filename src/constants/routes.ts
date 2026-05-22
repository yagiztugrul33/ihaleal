/** Platform route constants (single source of truth) */
export const ROUTES = {
  HOME: "/",
  AUCTIONS: "/auctions",
  HOW_IT_WORKS: "/how-it-works",
  SERVICES: "/services",
  ARASTIRMA: "/arastirma",
  ARASTIRMA_GES: "/arastirma/ges",
  ARASTIRMA_WAR_ROOM: "/arastirma/war-room",
  ARASTIRMA_PARSEL: "/arastirma/parsel",
  ARASTIRMA_YATIRIM: "/arastirma/yatirim",
  INTELLIGENCE_HUB: "/arastirma",
  GES_ANALYSIS: "/arastirma/ges",
  PARCEL_INTELLIGENCE: "/arastirma/parsel",
  LAND_INVESTMENT: "/arastirma/yatirim",
  WAR_ROOM: "/arastirma/war-room",
  GIS_INTELLIGENCE: "/arastirma/harita",
  GES_LAND_EVAL: "/ges-analiz-arazi",
  KKA_HUB: "/kat-karsiligi",
  KKA_STUDIO: "/kat-karsiligi/istudio",
  IBUYER: "/aninda-teklif",
  IBUYER_ALIAS: "/ibuyer",
  BORSA: "/borsa",
  BORSA_PORTFOY: "/borsa/portfoy",
  ILANLAR: "/ilanlar",
  NASIL_CALISIR: "/nasil-calisir",
  KURUMSAL: "/kurumsal",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const INTELLIGENCE_ROUTES = [
  ROUTES.ARASTIRMA,
  ROUTES.ARASTIRMA_GES,
  ROUTES.ARASTIRMA_PARSEL,
  ROUTES.ARASTIRMA_YATIRIM,
  ROUTES.ARASTIRMA_WAR_ROOM,
] as const;