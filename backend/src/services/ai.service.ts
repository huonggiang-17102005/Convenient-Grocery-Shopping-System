import dotenv from 'dotenv';
dotenv.config({ override: true });

let cachedModelName = 'gemini-1.5-flash';

export const generateRecipe = async (fridgeItems: any[], userPrompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Thiếu GEMINI_API_KEY trong file .env');
  }

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${cachedModelName}:generateContent?key=${apiKey}`;

  const systemInstruction = `Bạn là một đầu bếp thông minh và chuyên gia dinh dưỡng. Dựa vào danh sách nguyên liệu và nhu cầu của người dùng, hãy gợi ý món ăn phù hợp.
Bạn PHẢI trả về một MẢNG JSON (JSON Array) chứa tối đa 3 món ăn tốt nhất. Nếu người dùng yêu cầu số lượng cụ thể, hãy trả về đúng số lượng đó (tối đa 3).
Ưu tiên sử dụng các nguyên liệu sắp hết hạn (nếu có).
Chỉ trả về định dạng JSON thuần túy (KHÔNG CÓ markdown \`\`\`json ở đầu và cuối) với cấu trúc SAU LÀ MỘT MẢNG:
[
  {
    "title": "Tên món ăn",
    "prepTime": "Thời gian nấu (ví dụ: 30 phút)",
    "calories": 300,
    "protein": 20,
    "fat": 10,
    "carbs": 30,
    "ingredients": ["100g thịt bò", "1 củ hành tây"],
    "instructions": ["Bước 1: Thái thịt", "Bước 2: Xào"]
  }
]`;

  const promptText = `Danh sách nguyên liệu trong tủ lạnh:
${JSON.stringify(fridgeItems.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit, expiration_date: i.expiration_date })))}

Nhu cầu của người dùng: ${userPrompt || 'Gợi ý món ăn ngon để tiêu thụ đồ trong tủ lạnh, ưu tiên đồ sắp hết hạn.'}`;

  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (response.status === 404) {
    console.log("Model not found. Fetching available models...");
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const listData = await listRes.json();
      const validModel = listData.models?.find((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini") && m.name.includes("flash")) 
                        || listData.models?.find((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini"));
      
      if (validModel) {
        console.log("Fallback to model:", validModel.name);
        cachedModelName = validModel.name.replace('models/', '');
        url = `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${apiKey}`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      } else {
        throw new Error("Không tìm thấy model nào hỗ trợ generateContent trong tài khoản của bạn.");
      }
    } catch (err: any) {
      console.error("Lỗi khi tự động tìm model:", err);
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API Error:", errorData);
    let errorMessage = errorData.error?.message || 'Unknown error';
    
    // Translate common errors
    if (errorMessage.includes("high demand") || errorMessage.includes("503")) {
        errorMessage = "Hệ thống AI của Google hiện đang quá tải. Vui lòng chờ vài giây và thử lại nhé!";
    }
    
    throw new Error(`Lỗi từ Gemini: ${errorMessage}`);
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (resultText) {
      try {
        const parsedData = JSON.parse(resultText);
        // Ensure the result is an array
        if (Array.isArray(parsedData)) {
            return parsedData;
        } else if (typeof parsedData === 'object' && parsedData !== null) {
            return [parsedData];
        }
        return [];
      } catch (e) {
        console.error("Lỗi parse JSON từ Gemini:", resultText);
        throw new Error("Gemini trả về dữ liệu không đúng định dạng JSON");
      }
  }
  return null;
};
