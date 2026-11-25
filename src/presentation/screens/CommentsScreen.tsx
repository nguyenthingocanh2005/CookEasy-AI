
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Screen, UserAvatar } from "@/components/ui";
import { colors, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { getRecipeById } from "@/services/recipeService";
import {
  getComments,
  addComment as saveComment,
  deleteComment as removeComment,
} from "@/services/commentService";
import type { Recipe, Comment } from "@/types";

export function CommentsScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const router = useRouter();
  const { user, authLoading } = useApp();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avatar của người đang đăng nhập
  const [userAvatar, setUserAvatar] = useState<string | undefined>();
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Load recipe và comments
  const loadData = useCallback(async () => {
    if (!recipeId) {
      setError("Recipe not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [recipeResult, commentsResult] = await Promise.all([
        getRecipeById(recipeId),
        getComments(recipeId),
      ]);

      if (recipeResult.error || !recipeResult.recipe) {
        setError(recipeResult.error || "Recipe not found.");
        setRecipe(null);
        setComments([]);
        return;
      }

      setRecipe(recipeResult.recipe);

      if (commentsResult.error) {
        setError(commentsResult.error);
      } else {
        setComments(commentsResult.comments);
      }
    } catch {
      setError("Unable to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load avatar trực tiếp từ Supabase profiles
  useEffect(() => {
    if (!user?.id) {
      setUserAvatar(undefined);
      setAvatarLoading(false);
      return;
    }

    let isMounted = true;

    const loadUserAvatar = async () => {
      setAvatarLoading(true);

      // Metadata dùng làm ảnh dự phòng
      const fallbackAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        undefined;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (!error && data?.avatar_url) {
          setUserAvatar(data.avatar_url);
        } else {
          setUserAvatar(fallbackAvatar);
        }
      } catch {
        if (isMounted) {
          setUserAvatar(fallbackAvatar);
        }
      } finally {
        if (isMounted) {
          setAvatarLoading(false);
        }
      }
    };

    loadUserAvatar();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Đăng bình luận
  const submit = async () => {
    const clean = content.trim();

    if (!clean || !user || !recipeId || submitting) return;

    setSubmitting(true);

    try {
      const result = await saveComment(recipeId, user.id, clean);

      if (result.error || !result.comment) {
        Alert.alert(
          "Unable to post comment",
          result.error || "Please try again.",
        );
        return;
      }

      setComments((current) => [result.comment!, ...current]);
      setContent("");
    } catch {
      Alert.alert("Unable to post comment", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa bình luận
  const confirmDelete = (commentId: string) => {
    Alert.alert(
      "Delete comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) return;

            const result = await removeComment(commentId, user.id);

            if (result.error) {
              Alert.alert("Unable to delete comment", result.error);
              return;
            }

            setComments((current) =>
              current.filter((comment) => comment.id !== commentId),
            );
          },
        },
      ],
    );
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email ||
    "User";

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top navigation */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.text}
            />
          </Pressable>

          <View style={styles.topTitle}>
            <Text style={styles.topTitleText}>Discussion</Text>
            <Text style={styles.topSubtitle}>CookEasy Community</Text>
          </View>

          <View style={styles.topIcon}>
            <Ionicons
              name="chatbubbles-outline"
              size={21}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Recipe introduction */}
        {!loading && !error && (
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons
                name="restaurant-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introLabel}>
                DISCUSSING RECIPE
              </Text>

              <Text style={styles.recipeName} numberOfLines={2}>
                {recipe?.name ?? "Recipe"}
              </Text>

              <Text style={styles.introDescription}>
                Share your experience, tips and ideas.
              </Text>
            </View>
          </View>
        )}

        {/* Comments heading */}
        {!loading && !error && (
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Comments</Text>

              <Text style={styles.sectionSubtitle}>
                {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"} from
                the community
              </Text>
            </View>

            <View style={styles.commentCount}>
              <Ionicons
                name="chatbubble-ellipses"
                size={15}
                color={colors.primary}
              />
              <Text style={styles.commentCountText}>
                {comments.length}
              </Text>
            </View>
          </View>
        )}

        {/* Loading */}
        {loading || authLoading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
            <Text style={styles.statusText}>
              Loading discussion...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={30}
                color={colors.error}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Something went wrong
            </Text>

            <Text style={styles.statusText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={loadData}
            >
              <Ionicons
                name="refresh"
                size={17}
                color="#FFFFFF"
              />
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Comment list */}
            <ScrollView
              style={styles.commentList}
              contentContainerStyle={styles.commentListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <View
                    key={comment.id}
                    style={styles.commentCard}
                  >
                    <UserAvatar
                      name={comment.userName}
                      uri={comment.userPhotoURL}
                      size={46}
                    />

                    <View style={styles.commentMain}>
                      <View style={styles.commentTop}>
                        <View style={styles.authorBlock}>
                          <Text
                            style={styles.authorName}
                            numberOfLines={1}
                          >
                            {comment.userName}
                          </Text>

                          <Text style={styles.commentDate}>
                            {new Date(
                              comment.createdAt,
                            ).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </Text>
                        </View>

                        {user?.id === comment.userId && (
                          <Pressable
                            style={styles.moreButton}
                            onPress={() =>
                              confirmDelete(comment.id)
                            }
                            hitSlop={8}
                          >
                            <Ionicons
                              name="ellipsis-horizontal"
                              size={20}
                              color={colors.textSecondary}
                            />
                          </Pressable>
                        )}
                      </View>

                      <Text style={styles.commentText}>
                        {comment.content}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={32}
                      color={colors.primary}
                    />
                  </View>

                  <Text style={styles.emptyTitle}>
                    Start the conversation
                  </Text>

                  <Text style={styles.statusText}>
                    No comments yet. Share your first cooking
                    experience!
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Composer */}
            {user ? (
              <View style={styles.composerArea}>
                <View style={styles.composer}>
                  {avatarLoading ? (
                    <View style={styles.avatarPlaceholder}>
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                      />
                    </View>
                  ) : (
                    <UserAvatar
                      name={userName}
                      uri={userAvatar}
                      size={42}
                    />
                  )}

                  <TextInput
                    value={content}
                    onChangeText={setContent}
                    placeholder="Write a comment..."
                    placeholderTextColor={colors.hint}
                    style={styles.input}
                    multiline
                    editable={!submitting}
                    maxLength={1000}
                  />

                  <Pressable
                    onPress={submit}
                    disabled={!content.trim() || submitting}
                    style={[
                      styles.sendButton,
                      (!content.trim() || submitting) &&
                        styles.sendButtonDisabled,
                    ]}
                  >
                    {submitting ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Ionicons
                        name="arrow-up"
                        size={22}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>
                </View>

                <Text style={styles.composerHint}>
                  Keep it friendly. Share something helpful!
                </Text>
              </View>
            ) : (
              <Pressable
                style={styles.loginPrompt}
                onPress={() => router.push("/(auth)/login")}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={23}
                  color={colors.primary}
                />

                <Text style={styles.loginText}>
                  Sign in to join the discussion
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  topTitle: {
    flex: 1,
    gap: 2,
  },

  topTitleText: {
    ...typography.title,
    color: colors.text,
    fontSize: 21,
  },

  topSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  topIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    padding: 16,
    gap: 14,
    marginBottom: 22,
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  introContent: {
    flex: 1,
    gap: 4,
  },

  introLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#2E7D32",
  },

  recipeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#252525",
  },

  introDescription: {
    fontSize: 12,
    color: "#5F7561",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#252525",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#8A8A8A",
    marginTop: 4,
  },

  commentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  commentCountText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "800",
  },

  commentList: {
    flex: 1,
  },

  commentListContent: {
    gap: 12,
    paddingBottom: 16,
    flexGrow: 1,
  },

  commentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  commentMain: {
    flex: 1,
    gap: 10,
  },

  commentTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  authorBlock: {
    flex: 1,
    gap: 4,
  },

  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#252525",
  },

  commentDate: {
    fontSize: 11,
    color: "#A0A0A0",
  },

  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
  },

  commentText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555555",
  },

  composerArea: {
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: colors.background,
  },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 8,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
  },

  input: {
    ...typography.body,
    flex: 1,
    color: "#252525",
    minHeight: 42,
    maxHeight: 100,
    paddingHorizontal: 4,
    paddingVertical: 10,
    textAlignVertical: "center",
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#A5D6A7",
    opacity: 0.65,
  },

  composerHint: {
    fontSize: 11,
    color: "#A0A0A0",
    marginTop: 8,
    marginLeft: 12,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },

  statusText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 55,
    gap: 12,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 23,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#252525",
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  loginText: {
    flex: 1,
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "700",
  },
});
