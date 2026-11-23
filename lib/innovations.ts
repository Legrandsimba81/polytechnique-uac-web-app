import type { ProjectDepartment } from "@prisma/client";

export type { ProjectDepartment };

export const DEPARTMENT_LABEL: Record<ProjectDepartment, string> = {
  GENIE_INFORMATIQUE: "Génie informatique",
  ARCHITECTURE: "Architecture",
  GENIE_CIVIL: "Génie civil",
  GENIE_ELECTRIQUE: "Génie électrique",
};

export const DEPARTMENT_SHORT: Record<ProjectDepartment, string> = {
  GENIE_INFORMATIQUE: "Info",
  ARCHITECTURE: "Archi",
  GENIE_CIVIL: "Civil",
  GENIE_ELECTRIQUE: "Électro",
};



export const DEPARTMENT_COLOR: Record<ProjectDepartment, string> = {
  GENIE_INFORMATIQUE:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  ARCHITECTURE:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  GENIE_CIVIL:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  GENIE_ELECTRIQUE:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

type FieldType = "text" | "number" | "textarea" | "tags";

export type ProjectField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
};

export const PROJECT_FIELDS: Record<ProjectDepartment, ProjectField[]> = {
  GENIE_INFORMATIQUE: [
    { key: "technologies", label: "Technologies utilisées", type: "tags", placeholder: "React, Node.js, PostgreSQL…" },
    { key: "langages", label: "Langages de programmation", type: "tags", placeholder: "TypeScript, Python, Java…" },
    { key: "database", label: "Base de données", type: "text", placeholder: "PostgreSQL, MongoDB, Firebase…" },
    { key: "hosting", label: "Hébergement / déploiement", type: "text", placeholder: "Vercel, AWS, Railway…" },
    { key: "platforms", label: "Plateformes cibles", type: "tags", placeholder: "Windows, macOS, Android, iOS, Linux…" },
  ],
  ARCHITECTURE: [
    { key: "surface", label: "Surface (m²)", type: "number", placeholder: "1500" },
    { key: "location", label: "Localisation", type: "text", placeholder: "Kinshasa, Gombe" },
    { key: "software", label: "Logiciels utilisés", type: "tags", placeholder: "AutoCAD, Revit, SketchUp, Rhino…" },
    { key: "year", label: "Année du projet", type: "number", placeholder: "2025" },
    { key: "scale", label: "Échelle / Phase", type: "text", placeholder: "Esquisse, APS, APD, Permis…" },
    { key: "materials", label: "Matériaux principaux", type: "tags", placeholder: "Béton, bois, verre, acier…" },
  ],
  GENIE_CIVIL: [
    { key: "dimensions", label: "Dimensions / Portée (m)", type: "text", placeholder: "120 m de portée, 25 m de haut…" },
    { key: "capacity", label: "Capacité", type: "text", placeholder: "500 véhicules/jour, 300 personnes…" },
    { key: "software", label: "Logiciels utilisés", type: "tags", placeholder: "Robot, SAP2000, ETABS, Civil 3D…" },
    { key: "norms", label: "Normes appliquées", type: "tags", placeholder: "Eurocode, BAEL, ACI…" },
    { key: "materials", label: "Matériaux", type: "tags", placeholder: "Béton armé, acier, bois…" },
    { key: "studyPeriod", label: "Période de conception", type: "text", placeholder: "2024-2025" },
  ],
  GENIE_ELECTRIQUE: [
    { key: "power", label: "Puissance (W, kW, MW)", type: "text", placeholder: "5 kW" },
    { key: "voltage", label: "Tension (V, kV)", type: "text", placeholder: "220 V / 380 V" },
    { key: "components", label: "Composants principaux", type: "tags", placeholder: "Arduino, Raspberry Pi, PLC, capteurs…" },
    { key: "software", label: "Logiciels utilisés", type: "tags", placeholder: "MATLAB, Simulink, Proteus, ETAP, PVsyst…" },
    { key: "norms", label: "Normes appliquées", type: "tags", placeholder: "IEC, NF C 15-100…" },
  ],
};

export const PROJECT_TYPES: Record<ProjectDepartment, { value: string; label: string }[]> = {
  GENIE_INFORMATIQUE: [
    { value: "app-web", label: "Application web" },
    { value: "app-mobile", label: "Application mobile" },
    { value: "app-desktop", label: "Application desktop" },
    { value: "iot", label: "IoT" },
    { value: "embarque", label: "Système embarqué" },
    { value: "ia-ml", label: "IA / Machine Learning" },
    { value: "jeu-video", label: "Jeu vidéo" },
    { value: "outil", label: "Outil / Bibliothèque" },
  ],
  ARCHITECTURE: [
    { value: "residentiel", label: "Résidentiel" },
    { value: "commercial", label: "Commercial" },
    { value: "urbanisme", label: "Urbanisme" },
    { value: "paysager", label: "Paysager" },
    { value: "interieur", label: "Intérieur" },
    { value: "patrimoine", label: "Patrimoine / Rénovation" },
    { value: "maquette-3d", label: "Maquette 3D" },
  ],
  GENIE_CIVIL: [
    { value: "pont", label: "Pont / Viaduc" },
    { value: "route", label: "Route / Voirie" },
    { value: "batiment", label: "Bâtiment / Structure" },
    { value: "barrage", label: "Barrage / Hydraulique" },
    { value: "assainissement", label: "Assainissement" },
    { value: "geotechnique", label: "Géotechnique" },
    { value: "etude-sol", label: "Étude de sol" },
    { value: "dimensionnement", label: "Dimensionnement" },
  ],
  GENIE_ELECTRIQUE: [
    { value: "solaire", label: "Énergie solaire" },
    { value: "eolien", label: "Éolien" },
    { value: "distribution", label: "Distribution électrique" },
    { value: "automatisation", label: "Automatisation industrielle" },
    { value: "electronique-embarquee", label: "Électronique embarquée" },
    { value: "controle", label: "Système de contrôle" },
    { value: "smart-grid", label: "Smart grid" },
    { value: "instrumentation", label: "Instrumentation" },
  ],
};

export const PROJECT_TYPE_LABEL: Record<
  ProjectDepartment,
  Record<string, string>
> = {
  GENIE_INFORMATIQUE: Object.fromEntries(
    PROJECT_TYPES.GENIE_INFORMATIQUE.map((t) => [t.value, t.label])
  ),
  ARCHITECTURE: Object.fromEntries(
    PROJECT_TYPES.ARCHITECTURE.map((t) => [t.value, t.label])
  ),
  GENIE_CIVIL: Object.fromEntries(
    PROJECT_TYPES.GENIE_CIVIL.map((t) => [t.value, t.label])
  ),
  GENIE_ELECTRIQUE: Object.fromEntries(
    PROJECT_TYPES.GENIE_ELECTRIQUE.map((t) => [t.value, t.label])
  ),
};

// Whitelist pour iframe (domaines où les étudiants hébergent leurs projets)
export const IFRAME_WHITELIST = [
  "vercel.app",
  "netlify.app",
  "github.io",
  "pages.dev",
  "herokuapp.com",
  "web.app",
  "firebaseapp.com",
  "glitch.me",
  "replit.com",
  "streamlit.app",
  "onrender.com",
  "railway.app",
];

export function canEmbedInIframe(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return IFRAME_WHITELIST.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}