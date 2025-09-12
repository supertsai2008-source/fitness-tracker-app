/*
Vision analysis via OpenAI gpt-4o
Returns strict JSON mapped to our UI needs
*/
import { getOpenAIClient } from "./openai";

export interface VisionAnalysis {
  name: string; // canonical item name in English
  nameZh: string; // localized name in zh-TW
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string; // e.g. 1 bowl, 100 g
  servingNameZh: string; // localized serving
  errorRate: number; // 0-100 estimated error range
  detectedName?: string; // model's detected label
  detectedNameZh?: string;
  confidence?: number; // 0-100
}

export async function analyzeFoodImage(base64Jpeg: string): Promise<VisionAnalysis> {
  const client = getOpenAIClient();
  const model = "gpt-4o-2024-11-20"; // multimodal

  const system = `You are a nutrition analyst. Given a food photo, output ONLY strict JSON with these keys:
  {"name","nameZh","calories","protein","carbs","fat","servingSize","servingNameZh","errorRate","detectedName","detectedNameZh","confidence"}
- Units: calories in kcal, macros in grams
- "nameZh" and "servingNameZh" should be Traditional Chinese (zh-TW)
- "errorRate" and "confidence" are integers 0-100
- If multiple foods are present, pick the primary edible portion and note that in names
- Do not include any extra keys, text, or code fences`;

  const userText = "Analyze this food photo and return nutrition estimate as JSON.";

  // Assemble data URL to ensure compatibility
  const dataUrl = `data:image/jpeg;base64,${base64Jpeg}`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: dataUrl } },
        ] as any,
      },
    ],
    temperature: 0.2,
    max_tokens: 400,
    response_format: { type: "json_object" } as any,
  } as any);

  const raw = response.choices?.[0]?.message?.content || "{}";

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Fallback: try to extract JSON with simple heuristics
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      parsed = JSON.parse(raw.slice(start, end + 1));
    } else {
      throw new Error("Invalid JSON from vision model");
    }
  }

  const toNumber = (v: any, def = 0) => {
    const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : def;
    return isFinite(n) ? Math.round(n * 100) / 100 : def;
  };
  const toInt01 = (v: any) => {
    const n = Math.round(toNumber(v, 0));
    return Math.min(100, Math.max(0, n));
  };

  const result: VisionAnalysis = {
    name: (parsed?.name || parsed?.detectedName || "Food").toString(),
    nameZh: (parsed?.nameZh || parsed?.detectedNameZh || "餐點").toString(),
    calories: toNumber(parsed?.calories, 0),
    protein: toNumber(parsed?.protein, 0),
    carbs: toNumber(parsed?.carbs, 0),
    fat: toNumber(parsed?.fat, 0),
    servingSize: (parsed?.servingSize || "1 serving").toString(),
    servingNameZh: (parsed?.servingNameZh || "1 份").toString(),
    errorRate: toInt01(parsed?.errorRate),
    detectedName: parsed?.detectedName ? parsed.detectedName.toString() : undefined,
    detectedNameZh: parsed?.detectedNameZh ? parsed.detectedNameZh.toString() : undefined,
    confidence: parsed?.confidence != null ? toInt01(parsed.confidence) : undefined,
  };

  // Basic sanity: ensure at least calories
  if (result.calories <= 0 && (result.protein > 0 || result.carbs > 0 || result.fat > 0)) {
    result.calories = Math.round(result.protein * 4 + result.carbs * 4 + result.fat * 9);
  }

  // If still empty, throw to let UI handle fallback
  if (result.calories <= 0 && result.nameZh === "餐點") {
    throw new Error("Vision analysis returned insufficient data");
  }

  return result;
}
