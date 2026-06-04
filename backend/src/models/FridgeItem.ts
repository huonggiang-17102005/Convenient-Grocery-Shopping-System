import mongoose, { Schema, Document } from 'mongoose';

export interface IFridgeItem extends Document {
  familyId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
  expirationDate: Date;
  isWasted: boolean;
}

const FridgeItemSchema: Schema = new Schema({
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, default: 'Chưa phân loại' },
  imageUrl: { type: String, default: '' },
  location: { type: String, default: 'Ngăn mát' },
  expirationDate: { type: Date, required: true },
  isWasted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IFridgeItem>('FridgeItem', FridgeItemSchema);