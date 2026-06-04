import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IRecipe extends Document {
  authorId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  image: string;
  cookingTime: number;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  servings: number;
  ingredients: IIngredient[];
  instructions: string[];
  visibility: 'Private' | 'Public';
  likesCount: number;
  likedBy: mongoose.Types.ObjectId[];
}

const RecipeSchema: Schema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  cookingTime: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['Dễ', 'Trung bình', 'Khó'], default: 'Trung bình' },
  servings: { type: Number, required: true },
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  instructions: [{ type: String }],
  visibility: { type: String, enum: ['Private', 'Public'], default: 'Private' },
  likesCount: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);