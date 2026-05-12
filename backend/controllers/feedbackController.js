import Feedback from "../models/Feedback.js";

export const addFeedback = async (req, res) => {
  try {
    const { userId, projectId, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required" });
    const feedback = await Feedback.create({ userId, projectId, message: message.trim() });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeedbackByProject = async (req, res) => {
  try {
    const feedback = await Feedback.find({ projectId: req.params.projectId })
      .populate("userId", "name surname email profileImage")
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markFeedbackRead = async (req, res) => {
  try {
    await Feedback.updateMany({ projectId: req.params.projectId }, { read: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
