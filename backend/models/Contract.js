import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  role: String,
  signatureUrl: String,
}, { _id: false });

const contractSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientName: String,
  clientEmail: String,
  clientMobile: String,
  freelancers: { type: [freelancerSchema], validate: v => v.length >= 1 && v.length <= 2 },
  body: { type: String, required: true },
  status: { type: String, enum: ["draft", "sent", "viewed", "signed", "completed"], default: "draft" },
  clientSignatureUrl: String,
  termsAccepted: { type: Boolean, default: false },
  sentAt: Date,
  viewedAt: Date,
  signedAt: Date,
  pdfUrl: String,
}, { timestamps: true });

export default mongoose.model("Contract", contractSchema);
