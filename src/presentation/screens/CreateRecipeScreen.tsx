
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { saveRecipe } from "@/services/recipeService";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  FilterChip,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";

import {
  colors,
  radius,
  spacing,
  typography,
} from "@/constants/theme";

type RecipeIngredient = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
};

type RecipeStep = {
  id: string;
  instruction: string;
  duration: string;
  imageUri?: string;
};

const categories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snack",
  "Soup",
  "Salad",
  "Drinks",
];

const difficulties = ["Easy", "Medium", "Hard"];

export function CreateRecipeScreen() {
  const router = useRouter();

  // Basic recipe information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Dinner");
  const [cookingTime, setCookingTime] = useState("30");
  const [servings, setServings] = useState(2);
  const [difficulty, setDifficulty] = useState("Easy");

  // Recipe images
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Ingredients
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [ingredientUnit, setIngredientUnit] = useState("g");

  // Cooking instructions
  const [steps, setSteps] = useState<RecipeStep[]>([
    {
      id: "step-1",
      instruction: "",
      duration: "",
    },
  ]);

  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const addIngredient = () => {
    const name = ingredientName.trim();

    if (!name) {
      Alert.alert("Missing ingredient", "Please enter an ingredient name.");
      return;
    }

    setIngredients((current) => [
      ...current,
      {
        id: `ingredient-${Date.now()}`,
        name,
        quantity: ingredientQuantity.trim(),
        unit: ingredientUnit,
      },
    ]);

    setIngredientName("");
    setIngredientQuantity("");
    setIngredientUnit("g");
  };

  const removeIngredient = (id: string) => {
    setIngredients((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const addStep = () => {
    setSteps((current) => [
      ...current,
      {
        id: `step-${Date.now()}`,
        instruction: "",
        duration: "",
      },
    ]);
  };

  const updateStep = (
    id: string,
    field: "instruction" | "duration",
    value: string
  ) => {
    setSteps((current) =>
      current.map((step) =>
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  };

  const removeStep = (id: string) => {
    setSteps((current) => {
      if (current.length <= 1) return current;
      return current.filter((step) => step.id !== id);
    });
  };

  const pickImage = async (source: "camera" | "gallery") => {
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permission required",
            "Please allow camera access to take a recipe photo."
          );
          return null;
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permission required",
            "Please allow photo library access to choose an image."
          );
          return null;
        }
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });

      // `assets` can be undefined in some ImagePicker result variants.
      const selectedAsset = result.assets?.[0];
      if (result.canceled || !selectedAsset?.uri) {
        return null;
      }

      return selectedAsset.uri;
    } catch (error) {
      Alert.alert(
        "Image error",
        error instanceof Error ? error.message : "Could not select this image."
      );
      return null;
    }
  };

  const chooseCoverImage = async (source: "camera" | "gallery") => {
    const imageUri = await pickImage(source);
    if (imageUri) {
      setCoverImage(imageUri);
    }
  };

  const chooseStepImage = async (
    id: string,
    source: "camera" | "gallery"
  ) => {
    const imageUri = await pickImage(source);
    if (imageUri) {
      setSteps((current) =>
        current.map((step) =>
          step.id === id ? { ...step, imageUri } : step
        )
      );
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  const removeStepImage = (id: string) => {
    setSteps((current) =>
      current.map((step) =>
        step.id === id ? { ...step, imageUri: undefined } : step
      )
    );
  };

  const uploadRecipeImage = async (uri: string, userId: string, label: string) => {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error("Could not read the selected image.");
    }

    const blob = await response.blob();
    const extension = uri.split("?")[0]?.split(".").pop()?.toLowerCase();    const safeExtension = extension && ["jpg", "jpeg", "png", "webp"].includes(extension)
      ? extension
      : "jpg";
    const contentType = safeExtension === "png"
      ? "image/png"
      : safeExtension === "webp"
        ? "image/webp"
        : "image/jpeg";
    const filePath = `${userId}/${Date.now()}-${label}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(filePath, blob, {
        contentType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handlePublish = async () => {
    if (isSaving) return;

    if (!title.trim()) {
      Alert.alert("Missing information", "Please enter the recipe name.");
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert("Missing ingredients", "Please add at least one ingredient.");
      return;
    }

    if (steps.some((step) => !step.instruction.trim())) {
      Alert.alert(
        "Incomplete instructions",
        "Please complete all cooking steps."
      );
      return;
    }

    const totalCookingTime = Number(cookingTime);
    if (!Number.isFinite(totalCookingTime) || totalCookingTime <= 0) {
      Alert.alert("Invalid cooking time", "Please enter a cooking time greater than 0.");
      return;
    }

    setIsSaving(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) {
        Alert.alert("Sign in required", "Please sign in before saving your recipe.");
        return;
      }

      const userId = authData.user.id;
      let coverImageUrl = "";

      if (coverImage) {
        coverImageUrl = await uploadRecipeImage(coverImage, userId, "cover");
      }

      const stepImageUrls = await Promise.all(
        steps.map((step, index) =>
          step.imageUri
            ? uploadRecipeImage(step.imageUri, userId, `step-${index + 1}`)
            : Promise.resolve(undefined)
        )
      );

      const now = new Date().toISOString();
      const recipe = {
        id: "",
        name: title.trim(),
        description: description.trim(),
        imageUrl: coverImageUrl,
        ingredients: ingredients.map((item) => {
          const numericQuantity = item.quantity.trim()
            ? Number(item.quantity.trim())
            : undefined;
          return {
            id: item.id,
            name: item.name.trim(),
            quantity: numericQuantity !== undefined && Number.isFinite(numericQuantity)
              ? numericQuantity
              : undefined,
            unit: item.unit,
          };
        }),
        instructions: steps.map((step, index) => ({
          id: step.id,
          title: `Step ${index + 1}`,
          description: step.instruction.trim(),
          duration: step.duration.trim() ? Number(step.duration) : undefined,
          imageUrl: stepImageUrls[index],
        })),
        preparationTime: 0,
        cookingTime: totalCookingTime,
        totalTime: totalCookingTime,
        servings,
        difficulty: difficulty as "Easy" | "Medium" | "Hard",
        category,
        cuisine: "Various",
        authorId: userId,
        createdAt: now,
        updatedAt: now,
      };

      const { recipeId, error: saveError } = await saveRecipe({
        recipe,
        source: "manual",
        isPublic,
        });

        if (saveError || !recipeId) {
        throw new Error(saveError ?? "Could not save recipe.");
       }

      Alert.alert(
        isPublic ? "Recipe published!" : "Recipe saved!",
        isPublic
          ? "Your recipe is now available for everyone to discover."
          : "Your private recipe has been saved successfully."
      );
      router.back();
    } catch (error) {
      console.error("Save recipe error:", error);
      Alert.alert(
        "Could not save recipe",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.heading}>
        <View style={styles.headingMark}>
          <Ionicons
            name="create-outline"
            size={24}
            color={colors.primaryDark}
          />
        </View>

        <View style={styles.headingCopy}>
          <Text style={styles.title}>Create Your Recipe</Text>
          <Text style={styles.description}>
            Share your favorite dishes with everyone.
          </Text>
        </View>
      </View>

      {/* Intro tip */}
      <View style={styles.tip}>
        <Ionicons
          name="bulb-outline"
          size={20}
          color={colors.warning}
        />
        <Text style={styles.tipText}>
          Add your ingredients and cooking instructions step by step.
          Your recipe will be ready to share!
        </Text>
      </View>

      {/* Cover photo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recipe photo</Text>

        {coverImage ? (
          <View style={styles.coverPreviewContainer}>
            <Image
              source={{ uri: coverImage }}
              style={styles.coverPreview}
            />
            <View style={styles.coverOverlay}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.coverOverlayText}>Photo selected</Text>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.coverUpload}
            onPress={() => chooseCoverImage("gallery")}
          >
            <View style={styles.uploadIcon}>
              <Ionicons
                name="camera-outline"
                size={30}
                color={colors.primaryDark}
              />
            </View>
            <Text style={styles.uploadTitle}>
              Add a beautiful food photo
            </Text>
            <Text style={styles.helper}>
              Choose from gallery or take a photo
            </Text>
            <View style={styles.uploadButton}>
              <Ionicons
                name="images-outline"
                size={17}
                color={colors.primaryDark}
              />
              <Text style={styles.uploadButtonText}>Choose Photo</Text>
            </View>
          </Pressable>
        )}

        <View style={styles.photoActions}>
          <View style={styles.photoAction}>
            <SecondaryButton
              title="Gallery"
              icon="images-outline"
              onPress={() => chooseCoverImage("gallery")}
            />
          </View>
          <View style={styles.photoAction}>
            <SecondaryButton
              title="Take Photo"
              icon="camera-outline"
              onPress={() => chooseCoverImage("camera")}
            />
          </View>
        </View>

        {coverImage ? (
          <Pressable
            style={styles.removePhotoButton}
            onPress={removeCoverImage}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.removePhotoText}>Remove cover photo</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Basic information */}
      <View style={styles.section}>
        <SectionHeading
          icon="document-text-outline"
          title="Basic information"
        />

        <FieldLabel title="Recipe name" required />

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Vietnamese Beef Pho"
          placeholderTextColor={colors.hint}
          style={styles.input}
          maxLength={100}
        />

        <FieldLabel title="Description" />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Tell everyone what makes this dish special..."
          placeholderTextColor={colors.hint}
          multiline
          textAlignVertical="top"
          maxLength={500}
          style={styles.descriptionInput}
        />

        <Text style={styles.characterCount}>
          {description.length}/500
        </Text>
      </View>

      {/* Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>

        <View style={styles.chipWrap}>
          {categories.map((item) => (
            <FilterChip
              key={item}
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </View>
      </View>

      {/* Cooking details */}
      <View style={styles.section}>
        <SectionHeading
          icon="time-outline"
          title="Cooking details"
        />

        <FieldLabel title="Cooking time (minutes)" />

        <TextInput
          value={cookingTime}
          onChangeText={(value) =>
            setCookingTime(value.replace(/[^0-9]/g, ""))
          }
          keyboardType="number-pad"
          placeholder="30"
          placeholderTextColor={colors.hint}
          style={styles.input}
        />

        <FieldLabel title="Difficulty" />

        <View style={styles.chipWrap}>
          {difficulties.map((item) => (
            <FilterChip
              key={item}
              label={item}
              selected={difficulty === item}
              onPress={() => setDifficulty(item)}
            />
          ))}
        </View>

        <FieldLabel title="Servings" />

        <View style={styles.counter}>
          <Pressable
            onPress={() => setServings(Math.max(1, servings - 1))}
            style={styles.counterButton}
          >
            <Ionicons
              name="remove"
              size={21}
              color={colors.primaryDark}
            />
          </Pressable>

          <Text style={styles.counterValue}>{servings}</Text>

          <Pressable
            onPress={() => setServings(Math.min(20, servings + 1))}
            style={styles.counterButton}
          >
            <Ionicons
              name="add"
              size={21}
              color={colors.primaryDark}
            />
          </Pressable>

          <Text style={styles.helper}>people</Text>
        </View>
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <SectionHeading
          icon="basket-outline"
          title="Ingredients"
        />

        <Text style={styles.helper}>
          Add all ingredients with their quantities and units.
        </Text>

        <FieldLabel title="Ingredient name" required />

        <TextInput
          value={ingredientName}
          onChangeText={setIngredientName}
          placeholder="e.g. Beef"
          placeholderTextColor={colors.hint}
          style={styles.input}
        />

        <View style={styles.ingredientRow}>
          <View style={styles.quantityField}>
            <FieldLabel title="Quantity" />
            <TextInput
              value={ingredientQuantity}
              onChangeText={setIngredientQuantity}
              placeholder="500"
              placeholderTextColor={colors.hint}
              style={styles.input}
            />
          </View>

          <View style={styles.unitField}>
            <FieldLabel title="Unit" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.unitOptions}
            >
              {["g", "kg", "ml", "l", "pcs", "tbsp", "tsp"].map(
                (unit) => (
                  <Pressable
                    key={unit}
                    onPress={() => setIngredientUnit(unit)}
                    style={[
                      styles.unitChip,
                      ingredientUnit === unit &&
                        styles.unitChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        ingredientUnit === unit &&
                          styles.unitTextSelected,
                      ]}
                    >
                      {unit}
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>
          </View>
        </View>

        <SecondaryButton
          title="Add Ingredient"
          icon="add-circle-outline"
          onPress={addIngredient}
        />

        {ingredients.length > 0 && (
          <View style={styles.addedList}>
            {ingredients.map((item, index) => (
              <View key={item.id} style={styles.ingredientItem}>
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.itemCopy}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.helper}>
                    {item.quantity
                      ? `${item.quantity} ${item.unit}`
                      : "Quantity not specified"}
                  </Text>
                </View>

                <Pressable
                  onPress={() => removeIngredient(item.id)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={colors.error}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Cooking steps */}
      <View style={styles.section}>
        <SectionHeading
          icon="list-outline"
          title="Cooking instructions"
        />

        <Text style={styles.helper}>
          Describe each step clearly so others can follow your recipe.
        </Text>

        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>
                  {index + 1}
                </Text>
              </View>

              <Text style={styles.stepTitle}>
                Step {index + 1}
              </Text>

              {steps.length > 1 && (
                <Pressable
                  onPress={() => removeStep(step.id)}
                  hitSlop={8}
                  style={styles.deleteStep}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.error}
                  />
                </Pressable>
              )}
            </View>

            <TextInput
              value={step.instruction}
              onChangeText={(value) =>
                updateStep(step.id, "instruction", value)
              }
              placeholder="Describe what to do in this step..."
              placeholderTextColor={colors.hint}
              multiline
              textAlignVertical="top"
              style={styles.stepInput}
            />

            <FieldLabel title="Duration (minutes)" />

            <TextInput
              value={step.duration}
              onChangeText={(value) =>
                updateStep(
                  step.id,
                  "duration",
                  value.replace(/[^0-9]/g, "")
                )
              }
              placeholder="e.g. 10"
              keyboardType="number-pad"
              placeholderTextColor={colors.hint}
              style={styles.input}
            />

            {step.imageUri ? (
              <View style={styles.stepPhotoContainer}>
                <Image
                  source={{ uri: step.imageUri }}
                  style={styles.stepPhoto}
                />
                <View style={styles.stepPhotoActions}>
                  <Pressable
                    onPress={() => chooseStepImage(step.id, "gallery")}
                    style={styles.stepPhotoAction}
                  >
                    <Ionicons
                      name="images-outline"
                      size={17}
                      color={colors.primaryDark}
                    />
                    <Text style={styles.stepImageText}>Change photo</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => removeStepImage(step.id)}
                    style={styles.stepPhotoAction}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={colors.error}
                    />
                    <Text style={styles.removePhotoText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.stepImageActions}>
                <Pressable
                  onPress={() => chooseStepImage(step.id, "gallery")}
                  style={styles.stepImageButton}
                >
                  <Ionicons
                    name="images-outline"
                    size={19}
                    color={colors.primaryDark}
                  />
                  <Text style={styles.stepImageText}>Gallery</Text>
                </Pressable>
                <Pressable
                  onPress={() => chooseStepImage(step.id, "camera")}
                  style={styles.stepImageButton}
                >
                  <Ionicons
                    name="camera-outline"
                    size={19}
                    color={colors.primaryDark}
                  />
                  <Text style={styles.stepImageText}>Camera</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}

        <SecondaryButton
          title="Add Another Step"
          icon="add-circle-outline"
          onPress={addStep}
        />
      </View>

      {/* Publishing settings */}
      <View style={styles.section}>
        <SectionHeading
          icon="globe-outline"
          title="Publishing"
        />

        <Pressable
          style={styles.visibilityRow}
          onPress={() => setIsPublic((current) => !current)}
        >
          <View style={styles.visibilityIcon}>
            <Ionicons
              name={isPublic ? "earth-outline" : "lock-closed-outline"}
              size={22}
              color={colors.primaryDark}
            />
          </View>

          <View style={styles.visibilityCopy}>
            <Text style={styles.itemName}>
              {isPublic ? "Public recipe" : "Private recipe"}
            </Text>
            <Text style={styles.helper}>
              {isPublic
                ? "Everyone can discover and view this recipe."
                : "Only you can view this recipe."}
            </Text>
          </View>

          <Ionicons
            name={isPublic ? "toggle" : "toggle-outline"}
            size={32}
            color={isPublic ? colors.primary : colors.hint}
          />
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <PrimaryButton
          title={isSaving ? "Saving..." : "Publish Recipe"}
          icon="cloud-upload-outline"
          onPress={handlePublish}
        />

        <SecondaryButton
          title="Cancel"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Ionicons
        name={icon}
        size={20}
        color={colors.primaryDark}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function FieldLabel({
  title,
  required = false,
}: {
  title: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.fieldLabel}>
      {title}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  headingMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  headingCopy: {
    flex: 1,
  },

  title: {
    ...typography.title,
    color: colors.text,
  },

  description: {
    ...typography.description,
    color: colors.textSecondary,
  },

  tip: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.orangeLight,
    borderRadius: radius.input,
    padding: spacing.sm,
  },

  tipText: {
    ...typography.description,
    color: colors.warning,
    flex: 1,
  },

  section: {
    gap: spacing.sm,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  sectionTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },

  fieldLabel: {
    ...typography.description,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  required: {
    color: colors.error,
  },

  helper: {
    ...typography.description,
    color: colors.hint,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.input,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 14,
  },

  descriptionInput: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.input,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },

  characterCount: {
    ...typography.caption,
    color: colors.hint,
    textAlign: "right",
  },

  coverUpload: {
    minHeight: 190,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: radius.card,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: "hidden",
  },

  coverPreviewContainer: {
    width: "100%",
    height: 190,
    position: "relative",
    borderRadius: radius.card,
    overflow: "hidden",
  },

  coverPreview: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
  },

  coverOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 42,
    backgroundColor: "rgba(0,0,0,0.45)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },

  coverOverlayText: {
    ...typography.description,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  photoActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  photoAction: {
    flex: 1,
  },

  removePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },

  removePhotoText: {
    ...typography.description,
    color: colors.error,
  },

  uploadIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  uploadTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
  },

  uploadButtonText: {
    ...typography.description,
    color: colors.primaryDark,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },

  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },

  counterButton: {
    width: 42,
    height: 42,
    borderRadius: radius.input,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  counterValue: {
    ...typography.section,
    color: colors.text,
    minWidth: 28,
    textAlign: "center",
  },

  ingredientRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-end",
  },

  quantityField: {
    flex: 1,
  },

  unitField: {
    flex: 1,
    gap: spacing.xs,
  },

  unitOptions: {
    gap: spacing.xs,
    alignItems: "center",
  },

  unitChip: {
    minWidth: 38,
    height: 42,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },

  unitChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },

  unitText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  unitTextSelected: {
    color: colors.primaryDark,
    fontWeight: "600",
  },

  addedList: {
    gap: spacing.xs,
  },

  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  itemNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  itemNumberText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: "700",
  },

  itemCopy: {
    flex: 1,
    gap: 2,
  },

  itemName: {
    ...typography.description,
    color: colors.text,
    fontWeight: "600",
  },

  stepCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },

  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  stepBadgeText: {
    ...typography.description,
    color: colors.primaryDark,
    fontWeight: "700",
  },

  stepTitle: {
    ...typography.cardTitle,
    color: colors.text,
    flex: 1,
  },

  deleteStep: {
    padding: spacing.xs,
  },

  stepInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.input,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },

  stepImageActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  stepImageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
  },

  stepImageText: {
    ...typography.description,
    color: colors.primaryDark,
    flex: 1,
  },

  stepPhotoContainer: {
    gap: spacing.sm,
  },

  stepPhoto: {
    width: "100%",
    height: 160,
    borderRadius: radius.input,
    resizeMode: "cover",
  },

  stepPhotoActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
  },

  stepPhotoAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.xs,
  },

  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  visibilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  visibilityCopy: {
    flex: 1,
    gap: 3,
  },

  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
