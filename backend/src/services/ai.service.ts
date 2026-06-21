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
    "ingredients": [
      {
        "name": "thịt bò",
        "amount": 100,
        "unit": "g",
        "category": "Thịt cá"
      },
      {
        "name": "hành tây",
        "amount": 1,
        "unit": "củ",
        "category": "Rau củ quả"
      }
    ],
    "instructions": ["Bước 1: Thái thịt", "Bước 2: Xào"]
  }
]

Quy định về phân loại (category) của nguyên liệu (ingredients):
Mỗi nguyên liệu PHẢI được xếp vào chính xác một trong 7 danh mục sau:
1. 'Thịt cá' (ví dụ: thịt heo, thịt bò, cá rô phi, gà, tôm, mực, hải sản...)
2. 'Rau củ quả' (ví dụ: hành tây, tỏi, cà chua, cà rốt, rau muống, nấm, táo, chuối...)
3. 'Trứng' (ví dụ: trứng gà, trứng vịt, trứng cút...)
4. 'Chất lỏng' (ví dụ: sữa tươi, nước cốt dừa, bia, nước dùng, nước lọc...)
5. 'Đồ khô' (ví dụ: mì gói, bún khô, nấm mèo khô, các loại hạt, đậu...)
6. 'Gia vị' (ví dụ: đường, muối, hạt nêm, nước mắm, tiêu, dầu ăn, rượu vang đỏ, tương ớt, dấm...)
7. 'Khác' (nếu không thuộc các nhóm trên)

Quy định về đơn vị (unit) của nguyên liệu:
- 'Thịt cá', 'Rau củ quả', 'Đồ khô', 'Khác': dùng các đơn vị đo lường thông thường, ưu tiên khối lượng là 'g' nếu có thể xác định được (hoặc 'quả', 'củ', 'tép', 'nhành' tùy loại).
- 'Chất lỏng': dùng đơn vị đo thể tích là 'ml' (hoặc 'hộp', 'lon' nếu phù hợp).
- 'Trứng': dùng đơn vị 'quả'.
- 'Gia vị': để người dùng dễ xác định, đơn vị có thể dùng bất kỳ từ ngữ dân gian / ước lượng nào như 'thìa cà phê', 'thìa canh', 'chén', 'cốc', 'lát', 'nhúm', 'chút', 'tép' hoặc bất kỳ chuỗi ký tự mô tả nào phù hợp, không bắt buộc là g/ml.`;

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
        let cleanText = resultText.trim();
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
        }
        const parsedData = JSON.parse(cleanText);
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

export const estimateRecipeNutrition = async (ingredients: any[], instructions: string[]) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Thiếu GEMINI_API_KEY trong file .env');
  }

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${cachedModelName}:generateContent?key=${apiKey}`;

  const systemInstruction = `Bạn là một chuyên gia dinh dưỡng và đầu bếp chuyên nghiệp. Nhiệm vụ của bạn là phân tích danh sách nguyên liệu và các bước chế biến của một công thức để ước lượng các chỉ số dinh dưỡng (cho 1 phần ăn - per serving).
Bạn phải tự nhận diện và quy đổi các đơn vị đo lường phi tiêu chuẩn hoặc đơn vị dân gian (ví dụ: "thìa cà phê", "thìa canh", "nhúm", "chén", "bát", "lát", "củ", "quả", v.v.) sang khối lượng gam hoặc ml thực tế để tính toán chính xác nhất (ví dụ: 1 thìa cà phê đường khoảng 4g carbs, 1 thìa canh dầu ăn khoảng 14g chất béo).
Bạn PHẢI trả về một đối tượng JSON (JSON Object) có cấu trúc sau:
{
  "calories": 350,
  "protein": 20,
  "fat": 12,
  "carbs": 40
}
Chỉ trả về định dạng JSON thuần túy (KHÔNG CÓ markdown \`\`\`json ở đầu và cuối). Số liệu là các số nguyên hoặc số thực đại diện cho lượng calo (kcal), protein (g), fat (g), carbs (g) trên 1 phần ăn. Hãy tính toán thực tế dựa trên nguyên liệu thô và phương pháp nấu ăn.`;

  const promptText = `Hãy ước tính dinh dưỡng cho công thức sau:
Nguyên liệu: ${JSON.stringify(ingredients)}
Các bước hướng dẫn: ${JSON.stringify(instructions)}`;

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
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const listData = await listRes.json();
      const validModel = listData.models?.find((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini") && m.name.includes("flash")) 
                        || listData.models?.find((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini"));
      
      if (validModel) {
        cachedModelName = validModel.name.replace('models/', '');
        url = `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${apiKey}`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }
    } catch (err: any) {
      console.error("Lỗi khi tự động tìm model:", err);
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = errorData.error?.message || 'Unknown error';
    if (errorMessage.includes("high demand") || errorMessage.includes("503")) {
        errorMessage = "Hệ thống AI hiện đang quá tải. Vui lòng thử lại sau vài giây.";
    }
    throw new Error(`Lỗi từ Gemini: ${errorMessage}`);
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (resultText) {
    try {
      let cleanText = resultText.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
      }
      const parsedData = JSON.parse(cleanText);
      return {
        calories: Math.round(Number(parsedData.calories || 0)),
        protein: Number(parsedData.protein || 0),
        fat: Number(parsedData.fat || 0),
        carbs: Number(parsedData.carbs || 0),
      };
    } catch (e) {
      console.error("Lỗi parse JSON dinh dưỡng:", resultText);
      throw new Error("AI trả về dữ liệu dinh dưỡng không đúng định dạng JSON");
    }
  }
  return null;
};
