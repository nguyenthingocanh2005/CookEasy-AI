
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";
import type { Session, User } from "@supabase/supabase-js";

import { initialComments } from "@/data/mockData";
import {
  signUp,
  signIn,
  signOut,
  getCurrentSession,
  subscribeToAuthChanges,
} from "@/services/authService";
import type { AuthResult } from "@/services/authService";
import { supabase } from "@/lib/supabase";
import { Comment, Ingredient } from "@/types";

interface AppContextValue {
  // Authentication
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;

  // App data
  favorites: string[];
  toggleFavorite: (recipeId: string) => Promise<void>;
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  comments: Comment[];
  addComment: (recipeId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Authentication state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize authentication and listen for changes
  useEffect(() => {
    let mounted = true;

    const unsubscribe = subscribeToAuthChanges((currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthLoading(false);
    });

    const initializeAuth = async () => {
      const { session: currentSession, error } =
        await getCurrentSession();

      if (!mounted) return;

      if (error) {
        console.error("Get session error:", error);
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthLoading(false);
    };

    initializeAuth();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Load favorites from Supabase when the user changes
  useEffect(() => {
    let mounted = true;

    const loadFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("recipe_id")
        .eq("user_id", user.id);

      if (!mounted) return;

      if (error) {
        console.error("Load favorites error:", error.message);
        setFavorites([]);
        return;
      }

      setFavorites((data ?? []).map((item) => item.recipe_id));
    };

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Add or remove a favorite in Supabase
  const toggleFavorite = async (recipeId: string) => {
    if (!user) {
      Alert.alert(
        "Login required",
        "Please log in to save your favorite recipes.",
      );
      return;
    }

    const userId = user.id;
    const wasFavorite = favorites.includes(recipeId);

    // Update the UI immediately
    setFavorites((current) =>
      wasFavorite
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId],
    );

    const result = wasFavorite
      ? await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("recipe_id", recipeId)
      : await supabase.from("favorites").insert({
          user_id: userId,
          recipe_id: recipeId,
        });

    if (result.error) {
      console.error("Toggle favorite error:", result.error.message);

      // Restore the previous UI state if Supabase operation fails
      setFavorites((current) =>
        wasFavorite
          ? current.includes(recipeId)
            ? current
            : [...current, recipeId]
          : current.filter((id) => id !== recipeId),
      );

      Alert.alert(
        "Favorite update failed",
        "Please try again. Your change could not be saved.",
      );
    }
  };

  // Add comment
  const addComment = (recipeId: string, content: string) => {
    setComments((current) => [
      ...current,
      {
        id: `comment-${Date.now()}`,
        recipeId,
        userId: user?.id ?? "user-demo",
        userName:
          user?.user_metadata?.full_name ?? "CookEasy User",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  // Delete comment
  const deleteComment = (commentId: string) => {
    setComments((current) =>
      current.filter((comment) => comment.id !== commentId),
    );
  };

  const value = useMemo(
    () => ({
      user,
      session,
      authLoading,
      signUp,
      signIn,
      signOut,
      favorites,
      toggleFavorite,
      ingredients,
      setIngredients,
      comments,
      addComment,
      deleteComment,
    }),
    [
      user,
      session,
      authLoading,
      favorites,
      ingredients,
      comments,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}
