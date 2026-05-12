import User from "../models/User.js";
import Project from "../models/Project.js";

// Upsert user from Supabase (called after login)
export const upsertUser = async (req, res) => {
  try {
    const { supabaseId, email, name, surname, profileImage, role } = req.body;
    let user = await User.findOne({ supabaseId });
    if (!user) user = await User.findOne({ email });

    if (user) {
      user.supabaseId = supabaseId;
      user.name = name || user.name;
      user.surname = surname || user.surname;
      user.profileImage = profileImage || user.profileImage;
      await user.save();
    } else {
      user = await User.create({ supabaseId, email, name: name || email.split("@")[0], surname: surname || "", profileImage: profileImage || "", role: role || "client" });
      // Auto-create project for new client
      if (user.role === "client") {
        await Project.create({ userId: user._id });
      }
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users with optional search + status filter
export const getUsers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = { role: "client" };
    if (status) query.statusColor = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { surname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single user with project
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    let project = await Project.findOne({ userId: user._id });
    if (!project) project = await Project.create({ userId: user._id });
    res.json({ user, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user status color
export const updateUserStatus = async (req, res) => {
  try {
    const { statusColor } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { statusColor }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get stats for overview
export const getStats = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: "client" });
    const red = await User.countDocuments({ role: "client", statusColor: "red" });
    const orange = await User.countDocuments({ role: "client", statusColor: "orange" });
    const green = await User.countDocuments({ role: "client", statusColor: "green" });
    const completed = await Project.countDocuments({ completed: true });
    const active = await Project.countDocuments({ completed: false, percentage: { $gt: 0 } });
    const pending = await Project.countDocuments({ percentage: 0 });
    res.json({ total, red, orange, green, completed, active, pending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by supabase ID (for client dashboard)
export const getUserBySupabaseId = async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.params.supabaseId });
    if (!user) return res.status(404).json({ message: "User not found" });
    let project = await Project.findOne({ userId: user._id });
    if (!project) project = await Project.create({ userId: user._id });
    res.json({ user, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
