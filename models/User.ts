import { Schema, model } from "mongoose";

interface IUser {
  email: string;
  password: string;
  channels: {
    keyboard: any; name: string; isActive: boolean; message: string; quickButtons: string[]; urlButtons: string[] 
}[];
}

const schema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, String, required: true },
  channels: [
    {
      name: String,
      isActive: Boolean,
      message: String,
      keyboard: String,
      quickButtons: Array,
      urlButtons: Array,
    },
    {
      name: String,
      isActive: Boolean,
      message: String,
      keyboard: String,
      quickButtons: Array,
      urlButtons: Array,
    },
    {
      name: String,
      isActive: Boolean,
      message: String,
      keyboard: String,
      quickButtons: Array,
      urlButtons: Array,
    },
    {
      name: String,
      isActive: Boolean,
      message: String,
      keyboard: String,
      quickButtons: Array,
      urlButtons: Array,
    },
  ],
});

export const User = model<IUser>("User", schema);
