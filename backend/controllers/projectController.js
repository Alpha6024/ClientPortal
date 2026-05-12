import Project from "../models/Project.js";
import User from "../models/User.js";

// Get project by userId
export const getProjectByUser = async (req, res) => {
  try {
    const project = await Project.findOne({ userId: req.params.userId });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update progress (admin only)
export const updateProgress = async (req, res) => {
  try {
    const { percentage, comment } = req.body;
    const pct = Number(percentage);
    
    if (isNaN(pct) || pct < 0 || pct > 100)
      return res.status(400).json({ message: "Percentage must be between 0 and 100" });
    
    if (comment === undefined || comment.trim() === "")
      return res.status(400).json({ message: "Comment is required for every progress update" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.progressHistory.push({ percentage: pct, comment: comment.trim(), updatedBy: "admin" });
    project.percentage = pct;

    const statusColor = pct === 0 ? "red" : pct === 100 ? "green" : "orange";
    await User.findByIdAndUpdate(project.userId, { statusColor });

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("Update progress error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Undo last progress update
export const undoProgress = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.progressHistory.length === 0)
      return res.status(400).json({ message: "Nothing to undo" });

    project.progressHistory.pop();
    const last = project.progressHistory[project.progressHistory.length - 1];
    project.percentage = last ? last.percentage : 0;

    const statusColor = project.percentage === 0 ? "red" : project.percentage === 100 ? "green" : "orange";
    await User.findByIdAndUpdate(project.userId, { statusColor });

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
