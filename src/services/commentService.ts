
import { supabase } from "@/lib/supabase";
import type { Comment } from "@/types";

interface CommentRow {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export async function getComments(recipeId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("id, recipe_id, user_id, content, created_at")
    .eq("recipe_id", recipeId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      comments: [] as Comment[],
      error: error.message,
    };
  }

  const rows = (data ?? []) as CommentRow[];
  const userIds = [...new Set(rows.map((item) => item.user_id))];

  let profiles: ProfileRow[] = [];

  if (userIds.length > 0) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);

    if (profileError) {
      console.warn("Load comment profiles error:", profileError.message);
    } else {
      profiles = (profileData ?? []) as ProfileRow[];
    }
  }

  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile]),
  );

  const comments: Comment[] = rows.map((item) => {
    const profile = profileMap.get(item.user_id);

    return {
      id: item.id,
      recipeId: item.recipe_id,
      userId: item.user_id,
      userName: profile?.display_name || "CookEasy User",
      userPhotoURL: profile?.avatar_url || undefined,
      content: item.content,
      createdAt: item.created_at,
    };
  });

  return { comments, error: null };
}

export async function addComment(
  recipeId: string,
  userId: string,
  content: string,
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      recipe_id: recipeId,
      user_id: userId,
      content: content.trim(),
    })
    .select("id, recipe_id, user_id, content, created_at")
    .single();

  if (error) {
    return { comment: null, error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const comment: Comment = {
    id: data.id,
    recipeId: data.recipe_id,
    userId: data.user_id,
    userName: profile?.display_name || "CookEasy User",
    userPhotoURL: profile?.avatar_url || undefined,
    content: data.content,
    createdAt: data.created_at,
  };

  return { comment, error: null };
}

export async function deleteComment(
  commentId: string,
  userId: string,
) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  return { error: error?.message ?? null };
}
