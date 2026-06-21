import type { Request, Response } from 'express';
import * as aiService from '../services/ai.service.js';
import * as fridgeService from '../services/fridge.service.js';

export const generateRecipe = async (req: Request, res: Response) => {
  try {
    const { familyId, prompt } = req.body;
    
    if (!familyId) {
      return res.status(400).json({ success: false, message: 'Thiếu familyId' });
    }

    // 1. Lấy đồ trong tủ lạnh của gia đình
    const fridgeItems = await fridgeService.getFamilyFridge(familyId);
    
    // 2. Gửi sang AI
    const recipe = await aiService.generateRecipe(fridgeItems, prompt);

    return res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error: any) {
    console.error('AI Service Error:', error);
    return res.status(500).json({ 
        success: false, 
        message: error.message || 'Lỗi khi gọi AI' 
    });
  }
};

export const estimateNutrition = async (req: Request, res: Response) => {
  try {
    const { ingredients, instructions } = req.body;
    
    if (!ingredients || !instructions) {
      return res.status(400).json({ success: false, message: 'Thiếu nguyên liệu hoặc hướng dẫn nấu ăn.' });
    }

    const nutrition = await aiService.estimateRecipeNutrition(ingredients, instructions);

    return res.status(200).json({
      success: true,
      data: nutrition
    });
  } catch (error: any) {
    console.error('AI Estimate Nutrition Error:', error);
    return res.status(500).json({ 
        success: false, 
        message: error.message || 'Lỗi khi ước tính dinh dưỡng bằng AI' 
    });
  }
};
