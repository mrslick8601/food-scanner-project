
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { FoodInfo, SymptomAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API Key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Fallback to prevent crash if key undefined.

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

const FOOD_IDENTIFICATION_PROMPT_TEXT = `
Identify the food item in this image.

If the food is a composite dish (e.g., salad, stir-fry, soup, sandwich), identify the dish by its common name and briefly mention its main typical ingredients.
If no food is clearly identifiable, state that.
If identified (either single ingredient or composite dish), provide its common name.
Also, provide its estimated calories (e.g., 'X kcal per 100g' or 'Y kcal per serving' if more appropriate for a dish).
List its key nutrients as an array of objects, each with 'name' and 'value' (e.g., {name: 'Vitamin C', value: '10mg/100g'}). For composite dishes, this should reflect the overall nutritional profile.
Describe its primary health benefits as an array of strings. For composite dishes, mention benefits derived from key ingredients.
List any potential health hazards or considerations if consumed in excess or by certain individuals, also as an array of strings. For composite dishes, consider common allergens or high-sodium/fat ingredients typically used.

If the food cannot be identified, set 'identified' to false and provide a 'reason'.
Otherwise, set 'identified' to true.

Provide the response strictly in JSON format with the following keys:
'identified' (boolean),
'reason' (string, optional, only if not identified),
'name' (string, if identified, e.g., "Apple" or "Chicken Caesar Salad"),
'calories' (string, if identified),
'nutrients' (array of {name: string, value: string}, if identified),
'benefits' (array of strings, if identified),
'hazards' (array of strings, if identified).

Example for an apple:
{
  "identified": true,
  "name": "Apple",
  "calories": "Approx. 52 kcal per 100g",
  "nutrients": [
    {"name": "Dietary Fiber", "value": "2.4g per 100g"},
    {"name": "Vitamin C", "value": "4.6mg per 100g"}
  ],
  "benefits": [
    "Good source of fiber, aiding digestion.",
    "Contains antioxidants like Vitamin C."
  ],
  "hazards": [
    "Apple seeds contain amygdalin, which can release cyanide if chewed in large quantities."
  ]
}

Example for a composite dish like "Vegetable Stir-fry":
{
  "identified": true,
  "name": "Vegetable Stir-fry (e.g., with broccoli, carrots, soy sauce)",
  "calories": "Approx. 150-250 kcal per serving (can vary widely)",
  "nutrients": [
    {"name": "Dietary Fiber", "value": "Generally high"},
    {"name": "Various Vitamins", "value": "Depends on vegetables used (e.g., Vitamin A, C, K)"},
    {"name": "Sodium", "value": "Can be high depending on sauces used"}
  ],
  "benefits": [
    "Good source of multiple vitamins and minerals from diverse vegetables.",
    "Can be a good source of lean protein if tofu or chicken is added."
  ],
  "hazards": [
    "Often high in sodium due to soy sauce or other seasonings.",
    "Watch out for high oil content if deep-fried or heavily stir-fried."
  ]
}

Example for unidentified:
{
  "identified": false,
  "reason": "The image does not clearly show a food item or recognizable dish."
}
`;

const FOOD_INFO_BY_NAME_PROMPT_TEXT = (foodName: string) => `
Provide detailed information for the food item or dish: "${foodName}".

If "${foodName}" refers to a composite dish (e.g., "Chicken Soup", "Greek Salad"), identify the dish and briefly mention its main typical ingredients.
Include its common name (if ${foodName} is generic, use the most common form or specify if needed).
Provide its estimated calories (e.g., 'X kcal per 100g' or 'Y kcal per serving' if more appropriate for a dish).
List its key nutrients as an array of objects, each with 'name' and 'value' (e.g., {name: 'Vitamin C', value: '10mg/100g'}). For composite dishes, this should reflect the overall nutritional profile.
Describe its primary health benefits as an array of strings. For composite dishes, mention benefits derived from key ingredients.
List any potential health hazards or considerations if consumed in excess or by certain individuals, also as an array of strings. For composite dishes, consider common allergens or high-sodium/fat ingredients typically used.

If information for "${foodName}" cannot be found or is ambiguous, set 'identified' to false and provide a 'reason'.
Otherwise, set 'identified' to true and use "${foodName}" (or its common specific name, possibly including typical ingredients for clarity if a dish) as the 'name' in the response.

Provide the response strictly in JSON format with the following keys:
'identified' (boolean),
'reason' (string, optional, only if not identified or info not found),
'name' (string, if identified),
'calories' (string, if identified),
'nutrients' (array of {name: string, value: string}, if identified),
'benefits' (array of strings, if identified),
'hazards' (array of strings, if identified).

Example for "Banana":
{
  "identified": true,
  "name": "Banana",
  "calories": "Approx. 89 kcal per 100g",
  "nutrients": [
    {"name": "Potassium", "value": "358mg per 100g"},
    {"name": "Vitamin B6", "value": "0.4mg per 100g"}
  ],
  "benefits": [
    "Excellent source of potassium, important for heart health.",
    "Provides quick energy due to natural sugars."
  ],
  "hazards": [
    "High sugar content, consume in moderation, especially for diabetics.",
    "Individuals with kidney problems should monitor potassium intake."
  ]
}

Example for a composite dish like "Minestrone Soup":
{
  "identified": true,
  "name": "Minestrone Soup (typically contains vegetables, pasta, beans)",
  "calories": "Approx. 80-150 kcal per cup",
  "nutrients": [
    {"name": "Fiber", "value": "Good source from vegetables and beans"},
    {"name": "Lycopene", "value": "From tomatoes (if used)"},
    {"name": "Sodium", "value": "Can be high depending on broth and seasoning"}
  ],
  "benefits": [
    "Rich in vegetables, providing various vitamins and minerals.",
    "Beans offer protein and fiber, aiding digestion."
  ],
  "hazards": [
    "Can be high in sodium if using commercial broths or canned ingredients.",
    "Ensure pasta/beans are cooked thoroughly."
  ]
}
`;

const SYMPTOM_ANALYSIS_PROMPT_TEXT = (symptoms: string) => `
A user is experiencing the following symptoms: "${symptoms}".

IMPORTANT: You are an AI assistant providing informational suggestions, NOT a medical professional. Your response MUST NOT be taken as medical advice or diagnosis.

Analyze these symptoms and provide:
1.  'possibleConditions': An array of strings listing potential (but explicitly not definitive) general conditions or categories of issues that *might* be associated with such symptoms. Keep this list general (e.g., "Viral Infection", "Musculoskeletal strain", "Digestive discomfort"). Avoid specific disease names unless extremely common and fitting for very generic symptoms. If symptoms are too vague or too severe, state that a wide range of possibilities exist or that it's not possible to narrow down.
2.  'advice': A string containing general advice. This advice MUST strongly emphasize that this is NOT a medical diagnosis and that the user MUST consult a qualified healthcare professional for any health concerns or before making any decisions related to their health. Suggest general wellness tips if appropriate (e.g., rest, hydration) but always defer to a doctor for actual diagnosis and treatment.
3.  'disclaimer': A string containing a very clear and prominent disclaimer that this tool is for informational purposes ONLY, is AI-generated, and is NOT a substitute for professional medical advice, diagnosis, or treatment.

If the symptoms described are indicative of a medical emergency (e.g., chest pain, difficulty breathing, severe bleeding, loss of consciousness), the 'advice' section should primarily urge the user to seek immediate medical attention.

If the symptoms are too vague to provide any meaningful 'possibleConditions', state this in the 'possibleConditions' array (e.g., ["Symptoms too vague for specific suggestions"]) or in the 'advice'.

Provide the response strictly in JSON format with the keys: 'possibleConditions' (array of strings), 'advice' (string), 'disclaimer' (string).

Example for symptoms "sore throat and runny nose":
{
  "possibleConditions": ["Common Cold", "Flu", "Allergies"],
  "advice": "Symptoms like a sore throat and runny nose can be associated with common viral infections like a cold or flu, or allergic reactions. It's recommended to rest, stay hydrated, and monitor your symptoms. For a proper diagnosis and treatment options, please consult a healthcare professional. This information is not a substitute for medical advice.",
  "disclaimer": "This symptom analysis is AI-generated and for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."
}

Example for "severe chest pain and shortness of breath":
{
  "possibleConditions": ["Symptoms may indicate a serious condition"],
  "advice": "Severe chest pain and shortness of breath can be symptoms of a serious medical emergency. Please seek immediate medical attention by calling emergency services or going to the nearest emergency room. Do not delay seeking professional medical help. This information is not a substitute for medical advice.",
  "disclaimer": "This symptom analysis is AI-generated and for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."
}
`;


const parseGeminiResponse = <T>(responseText: string): T => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON string:", jsonStr, "Original response text:", responseText, "Error:", e);
    // If parsing fails, attempt to return a structured error within the expected type T if possible,
    // or rethrow a more informative error.
    // For FoodInfo, we can return an unidentified object.
    if (typeof ({} as FoodInfo).identified !== 'undefined') {
        return { identified: false, reason: "AI response was not valid JSON or was malformed." } as unknown as T;
    }
    // For SymptomAnalysis, return an error object.
    if (typeof ({} as SymptomAnalysis).error !== 'undefined') {
        return { error: "AI response was not valid JSON or was malformed." } as unknown as T;
    }
    throw new Error(`Failed to parse AI's JSON response. Raw text: ${responseText}`);
  }
};

const validateFoodInfo = (data: any): FoodInfo => {
    if (typeof data.identified !== 'boolean') {
        // If the parsing itself returned our custom error object for FoodInfo.
        if (data.reason && data.reason.includes("AI response was not valid JSON")) {
            return data as FoodInfo;
        }
        throw new Error("Invalid response format from AI: 'identified' field is missing or not a boolean.");
    }
    
    if (data.identified) {
        return {
            identified: true,
            name: data.name || "Name not provided",
            calories: data.calories || "Calories not provided",
            nutrients: Array.isArray(data.nutrients) ? data.nutrients : [],
            benefits: Array.isArray(data.benefits) ? data.benefits : [],
            hazards: Array.isArray(data.hazards) ? data.hazards : [],
         };
    } else {
        return {
            identified: false,
            reason: data.reason || "No specific reason provided by AI for not identifying.",
        };
    }
}

export const identifyFoodAndGetInfo = async (imageBase64: string): Promise<FoodInfo> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    // Return a structured error immediately without calling API
    return { identified: false, reason: "API Key is not configured. Cannot call AI service." };
  }

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: imageBase64,
    },
  };

  const textPart = {
    text: FOOD_IDENTIFICATION_PROMPT_TEXT,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      }
    });
    const parsedData = parseGeminiResponse<any>(response.text);
    return validateFoodInfo(parsedData);
  } catch (error) {
    console.error("Error calling Gemini API (identifyFoodAndGetInfo) or parsing response:", error);
    let message = "An unknown error occurred while communicating with the AI for food identification.";
    if (error instanceof Error) {
        message = error.message.includes("API key not valid") 
            ? "Gemini API Key is invalid. Please check your configuration." 
            : `Gemini API Error: ${error.message}`;
    }
    return { identified: false, reason: message };
  }
};


export const getFoodInfoByName = async (foodName: string): Promise<FoodInfo> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
     return { identified: false, reason: "API Key is not configured. Cannot call AI service." };
  }
   if (!foodName.trim()) {
    return { identified: false, reason: "Please enter a food name." };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: FOOD_INFO_BY_NAME_PROMPT_TEXT(foodName),
      config: {
        responseMimeType: "application/json",
      }
    });
    const parsedData = parseGeminiResponse<any>(response.text);
    return validateFoodInfo(parsedData);
  } catch (error) {
    console.error("Error calling Gemini API (getFoodInfoByName) or parsing response:", error);
    let message = `An unknown error occurred while fetching information for ${foodName}.`;
     if (error instanceof Error) {
        message = error.message.includes("API key not valid") 
            ? "Gemini API Key is invalid. Please check your configuration." 
            : `Gemini API Error: ${error.message}`;
    }
    return { identified: false, reason: message };
  }
};

export const analyzeSymptoms = async (symptoms: string): Promise<SymptomAnalysis> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    return { error: "API Key is not configured. Cannot call AI service." };
  }
  if (!symptoms.trim()) {
    return { error: "Please describe your symptoms." };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: SYMPTOM_ANALYSIS_PROMPT_TEXT(symptoms),
      config: {
        responseMimeType: "application/json",
      }
    });
    const parsedData = parseGeminiResponse<SymptomAnalysis>(response.text);
    if (parsedData.error) { // If parseGeminiResponse itself returned an error structure
        return parsedData;
    }
    if (!parsedData.advice || !parsedData.disclaimer) {
        // This indicates a valid JSON but missing required fields from AI logic
        return { error: "AI response for symptom analysis is missing crucial fields (advice/disclaimer)." };
    }
    return parsedData;
  } catch (error) {
    console.error("Error calling Gemini API (analyzeSymptoms) or parsing response:", error);
    let message = "An unknown error occurred while analyzing symptoms with the AI.";
     if (error instanceof Error) {
        message = error.message.includes("API key not valid") 
            ? "Gemini API Key is invalid. Please check your configuration." 
            : `Gemini API Error: ${error.message}`;
    }
    return { error: message };
  }
};
