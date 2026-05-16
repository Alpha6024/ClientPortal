import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabaseClient";
import { getUserBySupabaseId, addFeedback, getFeedbackByProject } from "../api";
import ClientOnboardingPanel from "./onboarding/ClientOnboardingPanel";

const STATUS = {
  red:    { label: "Not Started", bg: "bg-red-50",    text: "text-red-500",    bar: "#f87171" },
  orange: { label: "In Progress", bg: "bg-orange-50", text: "text-orange-500", bar: "#fb923c" },
  green:  { label: "Completed",   bg: "bg-green-50",  text: "text-green-500",  bar: "#4ade80" },
};

function Avatar({ src, name, size = 14 }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return src
    ? <img src={src} alt={name} className={`w-${size} h-${size} rounded-full object-cover ring-4 ring-white shadow-lg`} />
    : <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl ring-4 ring-white shadow-lg`}>{initials}</div>;
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("progress");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!s) { navigate("/login"); return; }
      setSession(s);
      try {
        const res = await getUserBySupabaseId(s.user.id);
        setUserData(res.data);
        if (res.data.project?._id) {
          const fb = await getFeedbackByProject(res.data.project._id);
          setFeedback(fb.data);
        }
      } catch { /* user may not be in DB yet */ }
      setLoading(false);
    });
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  async function handleFeedback(e) {
    e.preventDefault();
    if (!message.trim()) return;
    if (!userData?.user?._id || !userData?.project?._id) { toast.error("Project not set up yet"); return; }
    setSending(true);
    try {
      await addFeedback({ userId: userData.user._id, projectId: userData.project._id, message });
      toast.success("Feedback sent!");
      setMessage("");
      const fb = await getFeedbackByProject(userData.project._id);
      setFeedback(fb.data);
    } catch { toast.error("Failed to send feedback"); }
    setSending(false);
  }

  const name = userData?.user?.name
    ? `${userData.user.name} ${userData.user.surname || ""}`.trim()
    : session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "Client";

  const project = userData?.project;
  const user = userData?.user;
  const pct = project?.percentage ?? 0;
  const status = STATUS[user?.statusColor || "red"];
  const history = project?.progressHistory || [];

  const milestones = [
    { pct: 25,  label: "Planning",    icon: "📋" },
    { pct: 50,  label: "Design",      icon: "🎨" },
    { pct: 75,  label: "Development", icon: "⚙️" },
    { pct: 100, label: "Deployed",    icon: "🚀" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", fontSize: "13px" } }} />

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <img src="/Freelance.jpeg" alt="AP Studio" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-bold text-gray-800 text-sm">AP Studio</span>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition">Sign out →</button>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-3xl p-8 text-white shadow-xl shadow-cyan-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar src={user?.profileImage || session?.user?.user_metadata?.avatar_url} name={name} size={14} />
            <div className="flex-1">
              <p className="text-cyan-100 text-sm mb-1">Welcome back 👋</p>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-cyan-100 text-sm mt-1">{user?.email || session?.user?.email}</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-sm">
              <p className="text-xs text-white/70 mb-0.5">Status</p>
              <p className="font-semibold text-sm">{status.label}</p>
            </div>
          </div>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
          {[
            { id: "progress",   label: "Project Progress",        icon: "📊" },
            { id: "onboarding", label: "Documents & Onboarding",  icon: "📄" },
            { id: "feedback",   label: "Feedback",                icon: "💬" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === t.id ? "bg-cyan-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
              }`}>
              <span>{t.icon}</span>
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Progress tab */}
          {activeTab === "progress" && (
            <motion.div key="progress" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Progress card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-800">Project Progress</h2>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.bg} ${status.text}`}>{status.label}</span>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-6xl font-black text-gray-800">{pct}</span>
                  <span className="text-2xl text-gray-400 mb-2">%</span>
                  <span className="text-gray-400 text-sm mb-2 ml-1">{project?.currentStage || "Not started"}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
                  <motion.div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, #22d3ee, ${status.bar})` }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {milestones.map(m => (
                    <div key={m.pct} className={`rounded-2xl p-3 text-center transition ${pct >= m.pct ? "bg-cyan-50 border-2 border-cyan-200" : "bg-gray-50 border-2 border-transparent"}`}>
                      <div className="text-xl mb-1">{m.icon}</div>
                      <p className={`text-xs font-medium ${pct >= m.pct ? "text-cyan-600" : "text-gray-400"}`}>{m.label}</p>
                      <p className={`text-xs ${pct >= m.pct ? "text-cyan-400" : "text-gray-300"}`}>{m.pct}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Notes from Admin */}
              {(project?.title || project?.description || project?.notes) && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📌</span>
                    <h2 className="font-bold text-gray-800">Project Info</h2>
                  </div>
                  {project?.title && project.title !== "Client Project" && (
                    <p className="font-semibold text-gray-800 text-base mb-1">{project.title}</p>
                  )}
                  {project?.description && (
                    <p className="text-sm text-gray-500 mb-3">{project.description}</p>
                  )}
                  {project?.notes && (
                    <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-cyan-600 mb-1">Notes from your team</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{project.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-800 mb-5">Progress Timeline</h2>
                {history.length === 0
                  ? <p className="text-gray-400 text-sm text-center py-6">No updates yet. Your project will start soon!</p>
                  : <div className="space-y-4">
                      {[...history].reverse().map((h, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex gap-4 items-start">
                          <div className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">{h.percentage}%</div>
                            {i < history.length - 1 && <div className="w-px h-6 bg-gray-100 mt-1" />}
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="text-sm font-medium text-gray-700">{h.comment}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(h.createdAt).toLocaleString()}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                }
              </div>
            </motion.div>
          )}

          {/* Onboarding tab */}
          {activeTab === "onboarding" && (
            <motion.div key="onboarding" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {user?._id
                ? <ClientOnboardingPanel clientId={user._id} />
                : <div className="text-center py-20 text-gray-400">Your account is being set up. Check back soon!</div>
              }
            </motion.div>
          )}

          {/* Feedback tab */}
          {activeTab === "feedback" && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-800 mb-5">Send Feedback</h2>
                <form onSubmit={handleFeedback} className="flex gap-3 mb-5">
                  <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Share your thoughts or questions..."
                    className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                  <button type="submit" disabled={sending || !message.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-2xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
                    {sending ? "..." : "Send"}
                  </button>
                </form>
                {feedback.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Your previous messages</p>
                    {feedback.map((f, i) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-4">
                        <p className="text-sm text-gray-700">{f.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
