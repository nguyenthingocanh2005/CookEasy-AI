import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentProps, ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";
import { Recipe, RecipeInstruction } from "@/types";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.screenContent, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screenContent, styles.flex, style]}>{children}</View>
  );
  return <SafeAreaView style={styles.screen}>{content}</SafeAreaView>;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ title, onPress, icon, disabled, loading, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : icon ? (
        <Ionicons name={icon} size={19} color={colors.surface} />
      ) : null}
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, icon, disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={19} color={colors.primaryDark} /> : null}
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  active = false,
  label,
  light = false,
}: {
  icon: IconName;
  onPress: () => void;
  active?: boolean;
  label: string;
  light?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        light && styles.iconButtonLight,
        active && styles.iconButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={21}
        color={active ? colors.surface : light ? colors.surface : colors.text}
      />
    </Pressable>
  );
}

interface CustomInputProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  error?: string;
  rightAction?: ReactNode;
}

export function CustomTextInput({
  label,
  icon,
  error,
  rightAction,
  style,
  ...props
}: CustomInputProps) {
  return (
    <View style={styles.inputGroup}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View style={[styles.inputShell, error && styles.inputError]}>
        {icon ? <Ionicons name={icon} color={colors.hint} size={20} /> : null}
        <TextInput
          placeholderTextColor={colors.hint}
          style={[styles.input, style]}
          selectionColor={colors.primary}
          {...props}
        />
        {rightAction}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  onFilter,
  placeholder = "Search recipes or ingredients...",
}: {
  value: string;
  onChangeText: (value: string) => void;
  onFilter?: () => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={21} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.hint}
        style={styles.searchInput}
        returnKeyType="search"
      />
      {onFilter ? (
        <Pressable accessibilityLabel="Open filters" onPress={onFilter} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color={colors.primaryDark} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, selected && styles.filterChipSelected]}>
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IngredientChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <View style={styles.ingredientChip}>
      <Text style={styles.ingredientChipText}>{label}</Text>
      {onRemove ? (
        <Pressable accessibilityLabel={`Remove ${label}`} onPress={onRemove} hitSlop={6}>
          <Ionicons name="close-circle" size={18} color={colors.primaryDark} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function IngredientInput({ onAdd }: { onAdd: (name: string) => void }) {
  const [value, setValue] = useState("");
  const submit = () => {
    const clean = value.trim();
    if (!clean) return;
    onAdd(clean);
    setValue("");
  };
  return (
    <View style={styles.ingredientInput}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="e.g. tomatoes, eggs, basil"
        placeholderTextColor={colors.hint}
        style={styles.ingredientTextInput}
        onSubmitEditing={submit}
        returnKeyType="done"
      />
      <Pressable onPress={submit} accessibilityLabel="Add ingredient" style={styles.addButton}>
        <Ionicons name="add" size={24} color={colors.surface} />
      </Pressable>
    </View>
  );
}

export function UserAvatar({
  uri,
  name,
  size = 44,
}: {
  uri?: string;
  name: string;
  size?: number;
}) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={`${name}'s avatar`}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}

export function RatingDisplay({ value }: { value: number }) {
  return (
    <View style={styles.rating}>
      <Ionicons name="star" size={14} color={colors.orange} />
      <Text style={styles.ratingText}>{value.toFixed(1)}</Text>
    </View>
  );
}

export function CategoryCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={icon} color={colors.primaryDark} size={23} />
      </View>
      <Text numberOfLines={1} style={styles.categoryText}>
        {title}
      </Text>
    </Pressable>
  );
}

export function RecipeCard({
  recipe,
  onPress,
  onFavorite,
  favorite,
  horizontal = false,
}: {
  recipe: Recipe;
  onPress: () => void;
  onFavorite: () => void;
  favorite?: boolean;
  horizontal?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.recipeCard,
        horizontal && styles.recipeCardHorizontal,
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: recipe.imageUrl }}
        style={[styles.recipeImage, horizontal && styles.recipeImageHorizontal]}
      />
      <View style={styles.recipeContent}>
        <View style={styles.recipeTitleRow}>
          <Text numberOfLines={2} style={styles.recipeTitle}>
            {recipe.name}
          </Text>
          <Pressable
            onPress={onFavorite}
            hitSlop={10}
            accessibilityLabel={favorite ? "Remove favorite" : "Save favorite"}
          >
            <Ionicons
              name={favorite ? "heart" : "heart-outline"}
              size={21}
              color={favorite ? colors.primary : colors.textSecondary}
            />
          </Pressable>
        </View>
        <View style={styles.metaRow}>
          <RatingDisplay value={recipe.rating ?? 0} />
          <Text style={styles.metaText}>• {recipe.totalTime} min</Text>
          <Text style={styles.metaText}>• {recipe.difficulty}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function FeaturedRecipeCard({
  recipe,
  onPress,
  onFavorite,
  favorite,
}: {
  recipe: Recipe;
  onPress: () => void;
  onFavorite: () => void;
  favorite?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.featuredCard, pressed && styles.pressed]}
    >
      <Image source={{ uri: recipe.imageUrl }} style={styles.featuredImage} />
      <View style={styles.featuredScrim} />
      <View style={styles.featuredFavorite}>
        <IconButton
          icon={favorite ? "heart" : "heart-outline"}
          label="Toggle favorite"
          onPress={onFavorite}
          active={favorite}
          light={!favorite}
        />
      </View>
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle}>{recipe.name}</Text>
        <View style={styles.featuredMeta}>
          <Ionicons name="time-outline" color={colors.surface} size={16} />
          <Text style={styles.featuredMetaText}>{recipe.totalTime} min</Text>
          <Text style={styles.featuredMetaText}>• {recipe.difficulty}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function AIAssistantBanner({ onPress }: { onPress: () => void }) {
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.aiBanner}
    >
      <View style={styles.aiGlow} />
      <View style={styles.aiIcon}>
        <Ionicons name="sparkles" size={23} color={colors.orange} />
      </View>
      <View style={styles.aiCopy}>
        <Text style={styles.aiEyebrow}>AI COOKING ASSISTANT</Text>
        <Text style={styles.aiTitle}>What’s in your fridge?</Text>
        <Text style={styles.aiDescription}>Turn your ingredients into delicious meals.</Text>
        <Pressable onPress={onPress} style={styles.aiButton}>
          <Text style={styles.aiButtonText}>Start Cooking</Text>
          <Ionicons name="arrow-forward" color={colors.primaryDark} size={17} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

export function CookingStepCard({ step, number }: { step: RecipeInstruction; number: number }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>

        <View style={styles.stepCopy}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
          {step.duration ? (
            <Text style={styles.stepDuration}>{step.duration} minutes</Text>
          ) : null}
        </View>
      </View>

      {step.imageUrl ? (
        <Image
          source={{ uri: step.imageUrl }}
          style={styles.stepImage}
          resizeMode="cover"
          accessibilityLabel={`Photo for step ${number}`}
        />
      ) : null}
    </View>
  );
}

export function LoadingIndicator({
  label = "Preparing something delicious...",
}: {
  label?: string;
}) {
  return (
    <View style={styles.stateWrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.stateDescription}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon = "restaurant-outline",
  title,
  description,
  action,
  onAction,
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.stateWrap}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={32} color={colors.primaryDark} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {action && onAction ? (
        <PrimaryButton title={action} onPress={onAction} style={styles.stateButton} />
      ) : null}
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Something went wrong"
      description="We couldn’t load this content. Please try again."
      action="Try Again"
      onAction={onRetry}
    />
  );
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet} onPress={() => undefined}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <IconButton icon="close" label="Close" onPress={onClose} />
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ConfirmationDialog({
  visible,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialog}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.dialogDescription}>{description}</Text>
          <View style={styles.dialogActions}>
            <SecondaryButton title="Cancel" onPress={onCancel} style={styles.dialogButton} />
            <PrimaryButton title={confirmLabel} onPress={onConfirm} style={styles.dialogButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  primaryButton: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  primaryButtonText: { ...typography.button, color: colors.surface },
  secondaryButton: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  secondaryButtonText: { ...typography.button, color: colors.primaryDark },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonLight: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.28)",
  },
  iconButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  inputGroup: { gap: spacing.xs },
  inputLabel: { ...typography.description, fontFamily: "Inter_600SemiBold", color: colors.text },
  inputShell: {
    minHeight: 52,
    borderRadius: radius.input,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.input,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputError: { borderColor: colors.error },
  input: { ...typography.body, color: colors.text, flex: 1, paddingVertical: spacing.sm },
  errorText: { ...typography.caption, color: colors.error },
  searchBar: {
    minHeight: 52,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  searchInput: { ...typography.body, color: colors.text, flex: 1, paddingVertical: spacing.sm },
  sectionHeader: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { ...typography.section, color: colors.text },
  sectionAction: {
    ...typography.description,
    fontFamily: "Inter_600SemiBold",
    color: colors.primaryDark,
  },
  filterChip: {
    height: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  filterChipSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  filterChipText: { ...typography.description, color: colors.textSecondary },
  filterChipTextSelected: { color: colors.primaryDark, fontFamily: "Inter_600SemiBold" },
  ingredientChip: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ingredientChipText: {
    ...typography.description,
    color: colors.primaryDark,
    fontFamily: "Inter_600SemiBold",
  },
  ingredientInput: {
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: colors.input,
    borderRadius: radius.input,
    padding: spacing.xxs,
    paddingLeft: spacing.md,
    alignItems: "center",
  },
  ingredientTextInput: { ...typography.body, color: colors.text, flex: 1, minHeight: 48 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.small,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallback: {
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...typography.cardTitle, color: colors.primaryDark },
  rating: { flexDirection: "row", alignItems: "center", gap: spacing.xxs },
  ratingText: { ...typography.caption, color: colors.text, fontFamily: "Inter_600SemiBold" },
  categoryCard: { width: 88, alignItems: "center", gap: spacing.xs },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: { ...typography.caption, color: colors.text, fontFamily: "Inter_600SemiBold" },
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: "hidden",
    ...shadows.card,
  },
  recipeCardHorizontal: { width: 238 },
  recipeImage: { width: "100%", height: 172, backgroundColor: colors.input },
  recipeImageHorizontal: { height: 136 },
  recipeContent: { padding: spacing.sm, gap: spacing.xs },
  recipeTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs },
  recipeTitle: { ...typography.cardTitle, color: colors.text, flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.xxs },
  metaText: { ...typography.caption, color: colors.textSecondary },
  featuredCard: {
    height: 252,
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.primaryDark,
    ...shadows.card,
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredScrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(12,31,17,0.34)" },
  featuredFavorite: { position: "absolute", top: spacing.sm, right: spacing.sm },
  featuredContent: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: spacing.xs,
  },
  featuredTitle: { ...typography.section, color: colors.surface },
  featuredMeta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  featuredMetaText: { ...typography.description, color: colors.surface },
  aiBanner: {
    minHeight: 206,
    borderRadius: radius.modal,
    padding: spacing.lg,
    overflow: "hidden",
    ...shadows.card,
  },
  aiGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: -50,
    top: -40,
  },
  aiIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.orangeLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  aiCopy: { alignItems: "flex-start", gap: spacing.xxs },
  aiEyebrow: {
    ...typography.caption,
    color: colors.orangeLight,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  aiTitle: { ...typography.section, color: colors.surface },
  aiDescription: { ...typography.description, color: colors.primaryLight },
  aiButton: {
    marginTop: spacing.sm,
    height: 40,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  aiButtonText: { ...typography.button, color: colors.primaryDark },
  stepCard: {
    flexDirection: "column",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  stepImage: {
    width: "100%",
    height: 210,
    borderRadius: radius.card,
    backgroundColor: colors.input,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { ...typography.cardTitle, color: colors.surface },
  stepCopy: { flex: 1, gap: spacing.xs },
  stepTitle: { ...typography.cardTitle, color: colors.text },
  stepDescription: { ...typography.body, color: colors.textSecondary },
  stepDuration: {
    ...typography.caption,
    color: colors.primaryDark,
    fontFamily: "Inter_600SemiBold",
  },
  stateWrap: {
    flex: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  stateIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  stateTitle: { ...typography.section, color: colors.text, textAlign: "center" },
  stateDescription: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
  stateButton: { marginTop: spacing.sm, minWidth: 160 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dialogOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.modal,
    gap: spacing.md,
  },
  dialogDescription: { ...typography.body, color: colors.textSecondary },
  dialogActions: { flexDirection: "row", gap: spacing.sm },
  dialogButton: { flex: 1 },
});
