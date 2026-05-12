import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  key: String,
  label: String,
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { _id: false });

const onboardingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  steps: {
    type: [stepSchema],
    default: () => [
      { key: "contract_sent",       label: "Contract Sent" },
      { key: "contract_signed",     label: "Contract Signed" },
      { key: "welcome_sent",        label: "Welcome Message Sent" },
      { key: "invoice_sent",        label: "Invoice Sent" },
      { key: "portal_shared",       label: "Client Portal Shared" },
      { key: "payment_received",    label: "Payment Received" },
      { key: "thankyou_sent",       label: "Thank You Note Sent" },
    ],
  },
}, { timestamps: true });

export default mongoose.model("OnboardingTimeline", onboardingSchema);
