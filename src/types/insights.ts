// Types de la couche "intelligence" : insights générés à partir des données
// analytics, et points de prévision affichés sur les graphiques.

// Sévérité d'un insight : pilote la couleur et l'icône côté UI.
//   - "positive" : bonne nouvelle (ex. le CA progresse)
//   - "warning"  : point d'attention (ex. le CA recule, anomalie)
//   - "neutral"  : observation factuelle (ex. panier moyen)
export type InsightSeverity = "positive" | "warning" | "neutral";

// Catégorie d'un insight : permet de filtrer/regrouper dans la page dédiée.
export type InsightCategory =
  | "trend"     // évolution d'un indicateur
  | "anomaly"   // écart inhabituel détecté
  | "forecast"  // projection dans le futur
  | "highlight"; // fait marquant (meilleur mois, panier moyen…)

export interface Insight {
  // Identifiant stable (sert de clé React).
  id: string;

  // Titre court affiché en gras.
  title: string;

  // Phrase explicative en langage naturel.
  message: string;

  severity: InsightSeverity;

  category: InsightCategory;
}

// Un point de la courbe de revenus combinée histoire + projection.
// - `revenue`  : valeur réelle (null sur la partie projetée)
// - `forecast` : valeur projetée (null sur la partie historique)
// Le dernier point historique porte les deux valeurs pour que les deux
// courbes se rejoignent visuellement.
export interface ForecastPoint {
  month: string;
  revenue: number | null;
  forecast: number | null;
}