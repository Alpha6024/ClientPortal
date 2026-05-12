import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true },
    profileImage: { type: String, default: "" },
    role: { type: String, enum: ["admin", "client"], default: "client" },
    statusColor: { type: String, enum: ["red", "orange", "green"], default: "red" },
    supabaseId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
