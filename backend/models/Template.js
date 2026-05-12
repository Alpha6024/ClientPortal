import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  type: { type: String, enum: ["contract", "welcome", "invoice", "thankyou"], required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  metadata: mongoose.Schema.Types.Mixed,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Template", templateSchema);
