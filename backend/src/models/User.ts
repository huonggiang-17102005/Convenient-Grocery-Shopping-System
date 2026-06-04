import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'Admin' | 'User';
  familyId: mongoose.Types.ObjectId | null;
  favoriteRecipes: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  familyId: { type: Schema.Types.ObjectId, ref: 'Family', default: null },
  favoriteRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);