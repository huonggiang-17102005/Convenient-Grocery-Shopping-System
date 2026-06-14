import type { Request, Response, NextFunction } from 'express';
import * as RecipeService from '../services/recipe.service.js';

export const getFamilyRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user || !user.family_id) {
      res.status(400).json({ message: 'User does not belong to a family.' });
      return;
    }
    const recipes = await RecipeService.getFamilyRecipes(user.family_id, user.id);
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getCommunityRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const recipes = await RecipeService.getCommunityRecipes(user?.id);
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getFavoriteRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const recipes = await RecipeService.getFavoriteRecipes(user.id);
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const createRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const recipe = await RecipeService.createRecipe(user.id, req.body);
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

export const updateRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const recipe = await RecipeService.updateRecipe(id, user.id, req.body);
    res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    await RecipeService.deleteRecipe(id, user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const shareToCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const { description } = req.body;
    const recipe = await RecipeService.shareToCommunity(id, user.id, description);
    res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const result = await RecipeService.toggleFavorite(user.id, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const result = await RecipeService.toggleLike(user?.id, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addToShoppingList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    if (!user || !user.family_id) {
      res.status(400).json({ message: 'User does not belong to a family.' });
      return;
    }
    const result = await RecipeService.addToShoppingList(id, user.family_id, user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
