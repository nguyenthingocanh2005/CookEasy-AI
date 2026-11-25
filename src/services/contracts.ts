import { Ingredient, Recipe, RecipeGenerationRequest, User } from "@/types";

export interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(name: string, email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
}

export interface RecipeService {
  list(): Promise<Recipe[]>;
  getById(id: string): Promise<Recipe | null>;
  search(query: string): Promise<Recipe[]>;
}

export interface IngredientRecognitionService {
  recognize(imageUri: string): Promise<Ingredient[]>;
}

export interface AIRecipeService {
  generate(request: RecipeGenerationRequest): Promise<Recipe[]>;
}

// Future Firebase and Gemini adapters will implement these contracts.
// This build intentionally uses local data and mock services only.
