import type { Request, Response, NextFunction } from 'express';
import * as RecipeService from '../services/recipe.service.js';

export const getFamilyRecipes = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || !user.family_id) {
    return res.status(400).json({ message: 'User does not belong to a family.' });
  }
  const recipes = await RecipeService.getFamilyRecipes(user.family_id, user.id);
  return res.status(200).json(recipes);
};

export const getCommunityRecipes = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const recipes = await RecipeService.getCommunityRecipes(user?.id);
  return res.status(200).json(recipes);
};

export const getFavoriteRecipes = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const recipes = await RecipeService.getFavoriteRecipes(user.id);
  return res.status(200).json(recipes);
};

export const createRecipe = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const recipe = await RecipeService.createRecipe(user.id, req.body);
  return res.status(201).json(recipe);
};

export const updateRecipe = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  const recipe = await RecipeService.updateRecipe(id, user.id, req.body);
  return res.status(200).json(recipe);
};

export const deleteRecipe = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  await RecipeService.deleteRecipe(id, user.id);
  return res.status(204).send();
};

export const shareToCommunity = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  const { description } = req.body;
  const recipe = await RecipeService.shareToCommunity(id, user.id, description);
  return res.status(200).json(recipe);
};

export const toggleFavorite = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  const result = await RecipeService.toggleFavorite(user.id, id);
  return res.status(200).json(result);
};

export const toggleLike = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  const result = await RecipeService.toggleLike(id, user);
  return res.status(200).json(result);
};

export const addToShoppingList = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  if (!user || !user.family_id) {
    return res.status(400).json({ message: 'User does not belong to a family.' });
  }
  const result = await RecipeService.addToShoppingList(id, user.family_id, user.id);
  return res.status(200).json(result);
};
