import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it in the Secrets configuration panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export interface ExtractedMenuItem {
  categoryName: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
}

export async function parseMenuPDF(base64Pdf: string): Promise<ExtractedMenuItem[]> {
  const ai = getAIClient();

  const pdfPart = {
    inlineData: {
      data: base64Pdf,
      mimeType: "application/pdf"
    }
  };

  const prompt = `You are an expert restaurant menu parser. Read this restaurant menu PDF.
Extract all menu items and food dishes. Group them into their logical categories.
For each item, extract:
1. "categoryName": The category name (e.g. Soups, Starters, Sushi, Noodles, Rice, Main Course, Desserts, Beverages). Try to map the PDF categories to these, or keep the original PDF category name if it is more specific.
2. "name": The clear, elegant name of the item.
3. "description": A delicious, brief, appetizing description of the ingredients/preparation, written in an elegant premium tone. If the description is missing in the PDF, invent a short high-end description based on the dish name.
4. "price": The price as a number. Clean up any currency symbols (e.g., if it is "Rs 350" or "$15", output 350 or 15). If there's no price, guess or put a standard reasonable price.
5. "isVeg": A boolean indicating if the item is vegetarian (does not contain meat, poultry, fish, seafood, or egg). Look for keywords like 'veg', 'mushroom', 'paneer', or a green dot symbol. Default to false if unsure.

Respond strictly in the structured JSON format specified.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [pdfPart, prompt],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  categoryName: {
                    type: Type.STRING,
                    description: "The name of the menu category under which this dish falls."
                  },
                  name: {
                    type: Type.STRING,
                    description: "The name of the menu item."
                  },
                  description: {
                    type: Type.STRING,
                    description: "An appetizing description of the menu item."
                  },
                  price: {
                    type: Type.NUMBER,
                    description: "The price as a number."
                  },
                  isVeg: {
                    type: Type.BOOLEAN,
                    description: "Whether the menu item is vegetarian."
                  }
                },
                required: ["categoryName", "name", "description", "price", "isVeg"]
              }
            }
          },
          required: ["items"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini API.");
    }

    const parsed = JSON.parse(text.trim());
    return parsed.items || [];
  } catch (error: any) {
    console.error("Error parsing menu PDF with Gemini:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}
