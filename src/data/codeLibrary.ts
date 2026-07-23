export interface CodeKeyword {
  id: string;
  categoryId: string;
  keyword: string;
  subcategory: string;
  rank: 1 | 2 | 3 | 4 | 5;
  tier: "green" | "yellow" | "red";
  volume: "High" | "Medium" | "Low";
  difficulty: "High" | "Medium" | "Low";
  demand: "High" | "Medium" | "Low";
  specialistReview: boolean;
  aliases: string[];
  rationale: string;
  sourceUrls: string[];
}
