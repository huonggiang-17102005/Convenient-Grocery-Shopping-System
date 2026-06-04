import mongoose, { Schema, Document } from 'mongoose';

export interface IShoppingItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  isBought: boolean;
  assigneeId: mongoose.Types.ObjectId | null;
}

export interface IShoppingList extends Document {
  familyId: mongoose.Types.ObjectId;
  title: string;
  targetDate: Date;
  items: IShoppingItem[];
  status: 'Planning' | 'Shopping' | 'Completed';
}

const ShoppingListSchema: Schema = new Schema({
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
  title: { type: String, required: true },
  targetDate: { type: Date },
  items: [{
    name: { type: String, required: true },
    category: { type: String, default: 'Chưa phân loại' },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    isBought: { type: Boolean, default: false },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  }],
  status: { type: String, enum: ['Planning', 'Shopping', 'Completed'], default: 'Planning' }
}, { timestamps: true });

export default mongoose.model<IShoppingList>('ShoppingList', ShoppingListSchema);