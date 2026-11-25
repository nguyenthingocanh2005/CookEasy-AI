export type Difficulty = "Easy" | "Medium" | "Hard";

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  dietaryPreferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  confidence?: number;
}

export interface RecipeInstruction {
  id: string;
  title: string;
  description: string;
  duration?: number;
  imageUrl?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  ingredients: Ingredient[];
  instructions: RecipeInstruction[];
  preparationTime: number;
  cookingTime: number;
  totalTime: number;
  servings: number;
  difficulty: Difficulty;
  category: string;
  cuisine: string;
  authorId: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: string;
}

export interface UserPreferences {
  dietaryPreferences: string[];
  preferredCuisine: string[];
  defaultServings: number;
  maximumCookingTime: number;
}

export interface RecipeGenerationRequest {
  ingredients: Ingredient[];
  preferences: UserPreferences;
  difficulty?: Difficulty;
}
