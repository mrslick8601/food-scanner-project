export interface NutrientInfo {
  name: string;
  value: string; // e.g., "10mg/100g", "High", "Present"
}

export interface FoodInfo {
  identified: boolean; // True if AI successfully identified and has info
  reason?: string; // Reason if not identified or if info is for a named food
  name?: string; // e.g., "Apple"
  calories?: string; // e.g., "Approx. 52 kcal per 100g"
  nutrients?: NutrientInfo[];
  benefits?: string[];
  hazards?: string[];
}

export interface SymptomAnalysis {
  possibleConditions?: string[];
  advice?: string;
  disclaimer?: string;
  error?: string; // In case AI cannot process symptoms
}

export type TabOption = 'home' | 'scan' | 'explore' | 'symptoms';