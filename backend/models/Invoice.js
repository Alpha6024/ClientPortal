import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientName: String,
  clientEmail: String,
  freelancerName: String,
  freelancerEmail: String,
  lineItems: [lineItemSchema],
  taxRate: { type: Number, default: 0 },
  subtotal: Number,
  tax: Number,
  total: Number,
  dueDate: Date,
  paymentInstructions: String,
  notes: String,
  status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
  paymentStatus: { type: String, enum: ["pending", "awaiting_verification", "confirmed"], default: "pending" },
  paymentConfirmedAt: Date,
  paymentReceiptUrl: String,
  paymentNote: String,
  pdfUrl: String,
}, { timestamps: true });

invoiceSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}`;
  }
  this.subtotal = this.lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  this.tax = +(this.subtotal * (this.taxRate / 100)).toFixed(2);
  this.total = +(this.subtotal + this.tax).toFixed(2);
  next();
});

export default mongoose.model("Invoice", invoiceSchema);
