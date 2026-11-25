
import { supabase } from "@/lib/supabase";
import {
  Difficulty,
  Ingredient,
  Recipe,
  RecipeInstruction,
} from "@/types";

// ==========================================
// TYPES
// ==========================================

type CategoryRelation = {
  name: string;
} | null;

type IngredientRelation = {
  id: string;
  name: string;
} | null;

type RecipeIngredientRow = {
  id: string;
  quantity: string | null;
  notes: string | null;
  custom_name: string | null;
  ingredients: IngredientRelation;
};

type RecipeStepRow = {
  id: string;
  step_number: number;
  instruction: string;
  image_url: string | null;
  duration_minutes: number | null;
};

type RecipeRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cooking_time: number | null;
  difficulty: string | null;
  servings: number;
  created_at: string | null;
  updated_at: string;
  owner_id: string | null;
  categories: CategoryRelation;
  recipe_ingredients: RecipeIngredientRow[];
  recipe_steps: RecipeStepRow[];
};

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface SaveRecipeInput {
  recipe: Recipe;
  source?: "ai" | "manual";
  isPublic?: boolean;
}

// ==========================================
// SELECT QUERY
// ==========================================

const RECIPE_SELECT = `
  id,
  title,
  description,
  image_url,
  cooking_time,
  difficulty,
  servings,
  created_at,
  updated_at,
  owner_id,
  categories(name),
  recipe_ingredients(
    id,
    quantity,
    notes,
    custom_name,
    ingredients(id, name)
  ),
  recipe_steps(
    id,
    step_number,
    instruction,
    image_url,
    duration_minutes
  )
`;

// ==========================================
// DATA MAPPING
// ==========================================

function mapDifficulty(value: string | null): Difficulty {
  if (value === "Medium" || value === "Hard") {
    return value;
  }

  return "Easy";
}

function mapQuantity(value: string | null): {
  quantity?: number;
  unit?: string;
} {
  if (!value) return {};

  const match = value.trim().match(/^(\d+(?:\.\d+)?)(?:\s*(.*))$/);

  if (!match || !match[1]) {
    return { unit: value };
  }

  return {
    quantity: Number(match[1]),
    unit: match[2]?.trim() || undefined,
  };
}

function mapIngredients(rows: RecipeIngredientRow[]): Ingredient[] {
  return rows.map((row) => {
    const quantity = mapQuantity(row.quantity);

    return {
      id: row.ingredients?.id ?? row.id,
      name:
        row.ingredients?.name ??
        row.custom_name ??
        "Unknown ingredient",
      ...quantity,
    };
  });
}

function mapInstructions(rows: RecipeStepRow[]): RecipeInstruction[] {
  return [...rows]
    .sort((a, b) => a.step_number - b.step_number)
    .map((step) => ({
      id: step.id,
      title: `Step ${step.step_number}`,
      description: step.instruction,
      duration: step.duration_minutes ?? undefined,
      imageUrl: step.image_url ?? undefined,
    }));
}

function mapRecipe(row: RecipeRow): Recipe {
  const cookingTime = row.cooking_time ?? 0;

  return {
    id: row.id,
    name: row.title,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    ingredients: mapIngredients(row.recipe_ingredients ?? []),
    instructions: mapInstructions(row.recipe_steps ?? []),
    preparationTime: 0,
    cookingTime,
    totalTime: cookingTime,
    servings: row.servings,
    difficulty: mapDifficulty(row.difficulty),
    category: row.categories?.name ?? "Other",
    cuisine: "Various",
    authorId: row.owner_id ?? "",
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at,
  };
}

// ==========================================
// GET ALL PUBLIC RECIPES
// ==========================================

export async function getRecipes() {
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      recipes: [] as Recipe[],
      error: error.message,
    };
  }

  return {
    recipes: ((data ?? []) as unknown as RecipeRow[]).map(mapRecipe),
    error: null,
  };
}

// ==========================================
// GET ONE RECIPE BY ID
// ==========================================

export async function getRecipeById(recipeId: string) {
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("id", recipeId)
    .maybeSingle();

  if (error) {
    return {
      recipe: null,
      error: error.message,
    };
  }

  return {
    recipe: data
      ? mapRecipe(data as unknown as RecipeRow)
      : null,
    error: null,
  };
}

// ==========================================
// GET RECIPES BY CATEGORY
// ==========================================

export async function getRecipesByCategory(categoryName: string) {
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      recipes: [] as Recipe[],
      error: error.message,
    };
  }

  const recipes = ((data ?? []) as unknown as RecipeRow[])
    .map(mapRecipe)
    .filter(
      (recipe) =>
        recipe.category.toLowerCase() === categoryName.toLowerCase()
    );

  return {
    recipes,
    error: null,
  };
}

// ==========================================
// GET CATEGORIES
// ==========================================

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return {
      categories: [] as RecipeCategory[],
      error: error.message,
    };
  }

  return {
    categories: (data ?? []) as RecipeCategory[],
    error: null,
  };
}

// ==========================================
// SAVE RECIPE
// ==========================================

export async function saveRecipe({
  recipe,
  source = "manual",
  isPublic = false,
}: SaveRecipeInput) {
  // 1. Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      recipeId: null,
      error: authError?.message ?? "Please sign in to save this recipe.",
    };
  }

  // 2. Find category ID
  let categoryId: string | null = null;

  if (recipe.category && recipe.category !== "Other") {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", recipe.category)
      .maybeSingle();

    if (categoryError) {
      return {
        recipeId: null,
        error: categoryError.message,
      };
    }

    categoryId = category?.id ?? null;
  }

  // 3. Insert main recipe
  const { data: savedRecipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      title: recipe.name,
      description: recipe.description || null,
      image_url: recipe.imageUrl || null,
      cooking_time: recipe.totalTime || recipe.cookingTime || null,
      difficulty: recipe.difficulty,
      servings: recipe.servings || 1,
      category_id: categoryId,
      owner_id: user.id,
      is_public: isPublic,
      source,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (recipeError || !savedRecipe) {
    return {
      recipeId: null,
      error: recipeError?.message ?? "Could not save recipe.",
    };
  }

  const recipeId = savedRecipe.id;

  // 4. Insert ingredients
  if (recipe.ingredients.length > 0) {
    const ingredientRows = recipe.ingredients.map((ingredient) => ({
      recipe_id: recipeId,
      ingredient_id: null,
      custom_name: ingredient.name,
      quantity:
        ingredient.quantity !== undefined
          ? `${ingredient.quantity}${ingredient.unit ? ` ${ingredient.unit}` : ""}`
          : ingredient.unit ?? null,
    }));

    const { error: ingredientError } = await supabase
      .from("recipe_ingredients")
      .insert(ingredientRows);

    if (ingredientError) {
      await rollbackRecipe(recipeId);

      return {
        recipeId: null,
        error: ingredientError.message,
      };
    }
  }

  // 5. Insert cooking steps
  if (recipe.instructions.length > 0) {
    const stepRows = recipe.instructions.map((step, index) => ({
      recipe_id: recipeId,
      step_number: index + 1,
      instruction: step.description,
      image_url: step.imageUrl ?? null,
      duration_minutes: step.duration ?? null,
    }));

    const { error: stepError } = await supabase
      .from("recipe_steps")
      .insert(stepRows);

    if (stepError) {
      await rollbackRecipe(recipeId);

      return {
        recipeId: null,
        error: stepError.message,
      };
    }
  }

  return {
    recipeId,
    error: null,
  };
}

// ==========================================
// ROLLBACK PARTIALLY SAVED RECIPE
// ==========================================

async function rollbackRecipe(recipeId: string) {
  await supabase
    .from("recipe_steps")
    .delete()
    .eq("recipe_id", recipeId);

  await supabase
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", recipeId);

  await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId);
}
