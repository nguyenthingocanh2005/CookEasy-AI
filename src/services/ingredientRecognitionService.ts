
import { supabase } from "@/lib/supabase";
import { Ingredient } from "@/types";

type RecognitionResponse = {
  detectedFood: boolean;
  message: string;
  ingredients: {
    name: string;
    quantity: number | null;
    unit: string;
    confidence: number;
  }[];
};

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the selected image."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Could not read the selected image."));
    };

    reader.readAsDataURL(blob);
  });
}

export async function recognizeIngredients(
  imageUri: string,
  mimeType?: string,
): Promise<Ingredient[]> {
  // Read the selected image and convert it to a Base64 data URL.
  const imageResponse = await fetch(imageUri);

  if (!imageResponse.ok) {
    throw new Error("Could not load the selected image.");
  }

  const blob = await imageResponse.blob();
  const dataUrl = await readBlobAsDataUrl(blob);

  const detectedMimeType =
    mimeType?.toLowerCase().split(";")[0] ||
    blob.type ||
    "image/jpeg";

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(detectedMimeType)) {
    throw new Error(
      "Please select a JPG, PNG, or WebP image.",
    );
  }

  const imageBase64 = dataUrl.split(",")[1];

  if (!imageBase64) {
    throw new Error("Could not prepare the image for AI recognition.");
  }

  // Call the Supabase Edge Function.
  const { data, error } = await supabase.functions.invoke(
    "recognize-ingredients",
    {
      body: {
        imageBase64,
        mimeType: detectedMimeType,
      },
    },
  );

  
    if (error) {
    console.error("Ingredient recognition error:", error);

    const response = (error as { context?: Response }).context;

    let serverMessage = error.message;

    if (response) {
        try {
        const errorBody = await response.clone().json();
        console.error("Edge Function error details:", errorBody);

        serverMessage =
            errorBody?.error ||
            errorBody?.message ||
            serverMessage;
        } catch {
        console.error("Could not read Edge Function error response.");
        }
    }

    throw new Error(serverMessage);
    }


  const result = data as RecognitionResponse | null;

  if (!result || !Array.isArray(result.ingredients)) {
    throw new Error("The AI returned an invalid recognition result.");
  }

  if (!result.detectedFood || result.ingredients.length === 0) {
    throw new Error(
      result.message || "No food ingredients were detected in this image.",
    );
  }

  return result.ingredients.map((item, index) => ({
    id: `ai-${Date.now()}-${index}`,
    name: item.name,
    quantity: item.quantity ?? undefined,
    unit: item.unit || undefined,
    confidence: item.confidence,
  }));
}
