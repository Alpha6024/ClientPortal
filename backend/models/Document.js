import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  type: { type: String, enum: ["contract", "welcome", "invoice", "thankyou"], required: true },
  title: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ["draft", "sent", "viewed", "signed", "completed"], default: "draft" },
  sentAt: Date,
  viewedAt: Date,
  signedAt: Date,
  completedAt: Date,
  pdfUrl: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
