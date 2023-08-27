import { Schema, model } from "mongoose";

interface IUser {
  email: string;
  password: string;
}

const schema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, String, required: true },
});

export const User = model<IUser>("User", schema);
