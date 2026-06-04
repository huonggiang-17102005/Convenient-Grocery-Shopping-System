import mongoose, { Schema, Document } from 'mongoose';

export interface IFamily extends Document {
  name: string;
  homemakerId: mongoose.Types.ObjectId; 
  members: mongoose.Types.ObjectId[];
}

const FamilySchema: Schema = new Schema({
  name: { type: String, required: true },
  homemakerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model<IFamily>('Family', FamilySchema);