import { recipes } from "@/data/mockData";
import { AIRecipeService, IngredientRecognitionService, RecipeService } from "./contracts";

export const mockRecipeService: RecipeService = {
  async list() {
    return recipes;
  },
  async getById(id) {
    return recipes.find((recipe) => recipe.id === id) ?? null;
  },
  async search(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return recipes;
    return recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(normalized) ||
        recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(normalized)),
    );
  },
};

export const mockIngredientRecognitionService: IngredientRecognitionService = {
  async recognize() {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return [
      { id: "scan-1", name: "Tomatoes", quantity: 4, unit: "pieces", confidence: 0.96 },
      { id: "scan-2", name: "Baby spinach", quantity: 2, unit: "cups", confidence: 0.91 },
      { id: "scan-3", name: "Parmesan", quantity: 120, unit: "g", confidence: 0.84 },
    ];
  },
};

export const mockAIRecipeService: AIRecipeService = {
  async generate() {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return recipes.slice(0, 3);
  },
};
