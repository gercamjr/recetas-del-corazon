import mongoose, { Schema, models, model } from 'mongoose';

export type FamilyUserRole = 'member' | 'admin';

export interface FamilyUserDocument {
  _id: mongoose.Types.ObjectId;
  username: string;
  displayName: string;
  passwordHash: string;
  role: FamilyUserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyUserSchema = new Schema<FamilyUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 2,
      maxlength: 64,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const FamilyUserModel =
  models.FamilyUser || model<FamilyUserDocument>('FamilyUser', FamilyUserSchema);

export default FamilyUserModel;
