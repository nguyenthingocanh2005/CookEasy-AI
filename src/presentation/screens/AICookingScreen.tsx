
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  FilterChip,
  IngredientChip,
  IngredientInput,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";

export function AICookingScreen() {
  const router = useRouter();
  const { ingredients, setIngredients } = useApp();

  const [cuisine, setCuisine] = useState("Any cuisine");
  const [diet, setDiet] = useState("No restrictions");
  const [region, setRegion] = useState("Any region");
  const [spiciness, setSpiciness] = useState("Mild");
  const [saltiness, setSaltiness] = useState("Medium");
  const [sweetness, setSweetness] = useState("Medium");
  const [servings, setServings] = useState(2);
  const [time, setTime] = useState("30 min");
  const [difficulty, setDifficulty] = useState("Easy");
  const [specialRequirements, setSpecialRequirements] = useState("");

  const addIngredient = (name: string) => {
    const normalizedName = name.trim();

    if (!normalizedName) return;

    const exists = ingredients.some(
      (item) => item.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (exists) return;

    setIngredients([
      ...ingredients,
      { id: `manual-${Date.now()}`, name: normalizedName },
    ]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((item) => item.id !== id));
  };

  const generateRecipes = () => {
    router.push({
      pathname: "/recipes/results",
      params: {
        cuisine,
        diet,
        region,
        spiciness,
        saltiness,
        sweetness,
        servings: String(servings),
        time,
        difficulty,
        specialRequirements: specialRequirements.trim(),
      },
    });
  };

  return (
    <Screen>
      <View style={styles.heading}>
        <View style={styles.aiMark}>
          <Ionicons name="sparkles" size={24} color={colors.orange} />
        </View>

        <View style={styles.headingCopy}>
          <Text style={styles.title}>AI Cooking Assistant</Text>
          <Text style={styles.description}>
            Let’s create something delicious.
          </Text>
        </View>
      </View>

      <View style={styles.tip}>
        <Ionicons name="bulb-outline" size={20} color={colors.warning} />
        <Text style={styles.tipText}>
          Add what you have. You’ll review everything before a recipe is generated.
        </Text>
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your ingredients</Text>

        <IngredientInput onAdd={addIngredient} />

        {ingredients.length ? (
          <View style={styles.wrap}>
            {ingredients.map((ingredient) => (
              <IngredientChip
                key={ingredient.id}
                label={ingredient.name}
                onRemove={() => removeIngredient(ingredient.id)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.helper}>
            Add ingredients manually or scan them with your camera.
          </Text>
        )}
      </View>

      {/* Ingredient scanning */}
      <View style={styles.scanActions}>
        <SecondaryButton
          title="Take Photo"
          icon="camera-outline"
          onPress={() =>
            router.push({
              pathname: "/ingredients/scanner",
              params: { source: "camera" },
            })
          }
          style={styles.scanButton}
        />

        <SecondaryButton
          title="Gallery"
          icon="images-outline"
          onPress={() =>
            router.push({
              pathname: "/ingredients/scanner",
              params: { source: "gallery" },
            })
          }
          style={styles.scanButton}
        />
      </View>

      {/* Existing preferences */}
      <PreferenceRow
        title="Cuisine"
        items={["Any cuisine", "Vietnamese", "Italian", "Asian", "Mexican"]}
        selected={cuisine}
        onSelect={setCuisine}
      />

      <PreferenceRow
        title="Dietary preferences"
        items={["No restrictions", "Vegetarian", "High protein"]}
        selected={diet}
        onSelect={setDiet}
      />

      {/* Vietnamese taste */}
      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Ionicons
            name="restaurant-outline"
            size={20}
            color={colors.primaryDark}
          />
          <Text style={styles.sectionTitle}>Vietnamese taste</Text>
        </View>

        <Text style={styles.fieldLabel}>Regional preference</Text>

        <PreferenceRow
          title=""
          items={[
            "Any region",
            "Northern",
            "Central",
            "Southern",
          ]}
          selected={region}
          onSelect={setRegion}
        />

        <Text style={styles.helper}>
          Choose the regional flavor you prefer.
        </Text>
      </View>

      {/* Taste preferences */}
      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Ionicons
            name="options-outline"
            size={20}
            color={colors.primaryDark}
          />
          <Text style={styles.sectionTitle}>Taste preferences</Text>
        </View>

        <PreferenceRow
          title="Spiciness"
          items={["No spicy", "Mild", "Medium", "Spicy"]}
          selected={spiciness}
          onSelect={setSpiciness}
        />

        <PreferenceRow
          title="Saltiness"
          items={["Low", "Medium", "High"]}
          selected={saltiness}
          onSelect={setSaltiness}
        />

        <PreferenceRow
          title="Sweetness"
          items={["Low", "Medium", "High"]}
          selected={sweetness}
          onSelect={setSweetness}
        />
      </View>

      {/* Servings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servings</Text>

        <View style={styles.counter}>
          <Pressable
            onPress={() => setServings(Math.max(1, servings - 1))}
            style={styles.counterButton}
          >
            <Ionicons name="remove" size={21} color={colors.primaryDark} />
          </Pressable>

          <Text style={styles.counterValue}>{servings}</Text>

          <Pressable
            onPress={() => setServings(Math.min(8, servings + 1))}
            style={styles.counterButton}
          >
            <Ionicons name="add" size={21} color={colors.primaryDark} />
          </Pressable>
        </View>
      </View>

      {/* Cooking time */}
      <PreferenceRow
        title="Maximum cooking time"
        items={["20 min", "30 min", "45 min", "60 min"]}
        selected={time}
        onSelect={setTime}
      />

      {/* Difficulty */}
      <PreferenceRow
        title="Difficulty"
        items={["Easy", "Medium", "Any level"]}
        selected={difficulty}
        onSelect={setDifficulty}
      />

      {/* Special requirements */}
      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Ionicons
            name="create-outline"
            size={20}
            color={colors.primaryDark}
          />
          <Text style={styles.sectionTitle}>Special requirements</Text>
        </View>

        <Text style={styles.helper}>
          Tell AI about your dietary needs, allergies or other requirements.
        </Text>

        <TextInput
          value={specialRequirements}
          onChangeText={setSpecialRequirements}
          placeholder={
            "Example:\n- Suitable for people with diabetes\n- Heart-friendly meals\n- No added sugar\n- Avoid peanuts and seafood"
          }
          placeholderTextColor={colors.hint}
          multiline
          textAlignVertical="top"
          maxLength={1000}
          style={styles.requirementsInput}
        />

        <Text style={styles.characterCount}>
          {specialRequirements.length}/1000
        </Text>

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.info}
          />
          <Text style={styles.noticeText}>
            AI suggestions are for meal planning only and do not replace
            professional medical or nutritional advice.
          </Text>
        </View>
      </View>

      <PrimaryButton
        title="Generate Recipes"
        icon="sparkles"
        disabled={!ingredients.length}
        onPress={generateRecipes}
      />
    </Screen>
  );
}

function PreferenceRow({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {items.map((item) => (
          <FilterChip
            key={item}
            label={item}
            selected={selected === item}
            onPress={() => onSelect(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  aiMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.orangeLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headingCopy: { flex: 1 },
  title: { ...typography.title, color: colors.text },
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
  section: { gap: spacing.sm },
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
  },
  helper: {
    ...typography.description,
    color: colors.hint,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  scanActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  scanButton: { flex: 1 },
  chips: {
    gap: spacing.xs,
    paddingRight: spacing.lg,
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
  requirementsInput: {
    minHeight: 125,
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
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: radius.input,
  },
  noticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
});
