import mongoose, { Schema, Document } from 'mongoose';

export interface IMeal {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  recipeId: mongoose.Types.ObjectId;
}

export interface IMealPlan extends Document {
  familyId: mongoose.Types.ObjectId;
  date: Date;
  meals: IMeal[];
}

const MealPlanSchema: Schema = new Schema({
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
  date: { type: Date, required: true },
  meals: [{
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true }
  }]
}, { timestamps: true });

export default mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);