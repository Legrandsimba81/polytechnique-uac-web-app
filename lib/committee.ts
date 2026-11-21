export const ROLE_LABEL: Record<string, string> = {
  DELEGUE: "Délégué",
  DIR_CAB: "Directeur de Cabinet",
  VICE_DELEGUE: "Vice-Délégué",
  SECRETAIRE_GENERAL: "Secrétaire Général",
  TRESORIER: "Trésorier",
  MINISTRE: "Ministre",
  VICE_MINISTRE: "Vice-Ministre",
};

export const ROLE_ORDER: Record<string, number> = {
  DELEGUE: 1,
  DIR_CAB: 2,
  VICE_DELEGUE: 3,
  SECRETAIRE_GENERAL: 4,
  TRESORIER: 5,
  MINISTRE: 10,
  VICE_MINISTRE: 11,
};

export const TOP_ROLES = [
  "DELEGUE",
  "DIR_CAB",
  "VICE_DELEGUE",
  "SECRETAIRE_GENERAL",
  "TRESORIER",
] as const;

export const MINISTRY_KIND_LABEL: Record<string, string> = {
  PLAN_FINANCE: "Plan et Finance",
  AFFAIRES_SOCIALES: "Affaires Sociales",
  COMMUNICATION: "Communication",
  CULTURE_ART: "Culture et Art",
  SPORT_LOISIR: "Sport et Loisir",
  DEFENSE: "Défense",
  LITURGIE: "Liturgie",
  AFFAIRES_SCIENTIFIQUES: "Affaires Scientifiques",
  LOGISTIQUE: "Logistique",
  AUTRE: "Autre",
};

// ← Le fix est ici : tuple typé au lieu de tableau
export function memberSortKey(m: {
  role: string;
  displayOrder: number;
  fullName: string;
}): [number, number, string] {
  return [ROLE_ORDER[m.role] ?? 99, m.displayOrder, m.fullName];
}