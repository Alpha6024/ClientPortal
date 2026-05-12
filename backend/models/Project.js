import mongoose from "mongoose";

const progressUpdateSchema = new mongoose.Schema({
  percentage: { type: Number, required: true, min: 0, max: 100 },
  comment: { type: String, required: true },
  updatedBy: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Client Project" },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    currentStage: { type: String, default: "Not started" },
    progressHistory: [progressUpdateSchema],
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-set completed and stage based on percentage
projectSchema.pre("save", function () {
  this.completed = this.percentage === 100;
  if (this.percentage === 0) this.currentStage = "Not started";
  else if (this.percentage <= 25) this.currentStage = "Resource gathering / planning";
  else if (this.percentage <= 50) this.currentStage = "Frontend designing";
  else if (this.percentage <= 75) this.currentStage = "Backend development";
  else if (this.percentage < 100) this.currentStage = "Final touches";
  else this.currentStage = "Deployment completed";
});

export default mongoose.model("Project", projectSchema);
