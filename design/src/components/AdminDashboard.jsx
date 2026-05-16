import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  Tooltip, PieChart, Pie, Cell,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabaseClient";
import {
  getStats, getUsers, getUserById,
  updateProgress, undoProgress, getFeedbackByProject,
  getContracts, getInvoices, getDocuments, getOnboarding,
  sendContract, confirmPayment, deleteContract, deleteUser, updateProjectDetails,
  getContractPdfUrl, getInvoicePdfUrl, getDocumentPdfUrl,
} from "../api";
import OnboardingDashboard from "./onboarding/OnboardingDashboard";
import DocumentViewer from "./onboarding/DocumentViewer";
import PaymentConfirmModal from "./onboarding/PaymentConfirmModal";
import StatusBadge from "./onboarding/StatusBadge";

const BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_EMAIL_2 = import.meta.env.VITE_ADMIN_EMAIL_2;
const isAdmin = (email) => email === ADMIN_EMAIL || email === ADMIN_EMAIL_2;

const STATUS = {
  red:    { label: "Not Started", color: "#f87171", bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-400" },
  orange: { label: "In Progress", color: "#fb923c", bg: "bg-orange-100", text: "text-orange-600", dot: "bg-orange-400" },
  green:  { label: "Completed",   color: "#4ade80", bg: "bg-green-100",  text: "text-green-600",  dot: "bg-green-400" },
};

// ── Helpers ────────────────────────────────────────────────────────
function Avatar({ src, name, size = 10 }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return src
    ? <img src={src} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />
    : <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{initials}</div>;
}

function StatCard({ label, value, color, icon }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value ?? "—"}</p>
    </motion.div>
  );
}

function ProgressBar({ pct }) {
  const color = pct === 100 ? "#4ade80" : pct >= 50 ? "#22d3ee" : "#fb923c";
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <motion.div
        className="h-2 rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// ── Tabs inside UserDetailPanel ────────────────────────────────────
const DETAIL_TABS = [
  { id: "progress",  label: "Progress",  icon: "📈" },
  { id: "notes",     label: "Notes",     icon: "📌" },
  { id: "contracts", label: "Contracts", icon: "📝" },
  { id: "invoices",  label: "Invoices",  icon: "🧾" },
  { id: "timeline",  label: "Timeline",  icon: "🗓️" },
  { id: "messages",  label: "Messages",  icon: "📄" },
];

const STEP_META = {
  contract_sent:    "📄", contract_signed: "✍️", welcome_sent: "👋",
  invoice_sent:     "💰", portal_shared:   "🔗", payment_received: "✅", thankyou_sent: "🙏",
};

// ── User Detail Panel ──────────────────────────────────────────────
function UserDetailPanel({ userId, onClose }) {
  const [data, setData]           = useState(null);
  const [feedback, setFeedback]   = useState([]);
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline]   = useState(null);
  const [pct, setPct]             = useState(0);
  const [comment, setComment]     = useState("");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState("progress");
  const [viewer, setViewer]       = useState(null);
  const [payModal, setPayModal]   = useState(null);
  const [noteTitle, setNoteTitle]   = useState("");
  const [noteDesc, setNoteDesc]     = useState("");
  const [noteText, setNoteText]     = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const uRes = await getUserById(userId);
      setData(uRes.data);
      setPct(uRes.data.project?.percentage ?? 0);
      const clientMongoId = uRes.data.user?._id;
      const [fb, c, inv, d, ob] = await Promise.all([
        uRes.data.project?._id ? getFeedbackByProject(uRes.data.project._id) : Promise.resolve({ data: [] }),
        clientMongoId ? getContracts({ clientId: clientMongoId }) : Promise.resolve({ data: [] }),
        clientMongoId ? getInvoices({ clientId: clientMongoId })  : Promise.resolve({ data: [] }),
        clientMongoId ? getDocuments({ clientId: clientMongoId }) : Promise.resolve({ data: [] }),
        clientMongoId ? getOnboarding(clientMongoId)              : Promise.resolve({ data: null }),
      ]);
      setFeedback(fb.data);
      setContracts(c.data);
      setInvoices(inv.data);
      setDocuments(d.data);
      setTimeline(ob.data);
      setNoteTitle(uRes.data.project?.title || "");
      setNoteDesc(uRes.data.project?.description || "");
      setNoteText(uRes.data.project?.notes || "");
    } catch { toast.error("Failed to load user"); }
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function handleUpdateProgress() {
    if (!comment.trim()) { toast.error("Comment is required"); return; }
    setSaving(true);
    try {
      await updateProgress(data.project._id, { percentage: pct, comment });
      toast.success("Progress updated");
      setComment("");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Failed to connect to server");
    }
    setSaving(false);
  }

  async function handleUndo() {
    try {
      await undoProgress(data.project._id);
      toast.success("Undone");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Failed to connect to server");
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Failed to load user.</p>
    </div>
  );

  const { user, project } = data;
  const history = project?.progressHistory || [];

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-0 space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">←</button>
          <Avatar src={user.profileImage} name={`${user.name} ${user.surname}`} size={12} />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 truncate">{user.name} {user.surname}</h2>
            <p className="text-gray-400 text-sm truncate">{user.email}</p>
            <p className="text-gray-300 text-xs">ID: {user._id}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-medium flex-shrink-0 ${STATUS[user.statusColor]?.bg} ${STATUS[user.statusColor]?.text}`}>
            {STATUS[user.statusColor]?.label}
          </div>
          <button onClick={async () => {
            if (!confirm(`Delete ${user.name} ${user.surname} and all their data? This cannot be undone.`)) return;
            try { await deleteUser(user._id); toast.success("User deleted"); onClose(); }
            catch { toast.error("Failed to delete user"); }
          }} className="px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-medium hover:bg-red-100 transition flex-shrink-0">
            🗑 Delete
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {DETAIL_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                activeTab === t.id
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* ── PROGRESS TAB ── */}
            {activeTab === "progress" && (
              <>
                {/* Progress editor */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-4">Project Progress</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl font-bold text-cyan-500">{project?.percentage ?? 0}%</span>
                    <div className="flex-1"><ProgressBar pct={project?.percentage ?? 0} /></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{project?.currentStage}</p>
                  <div className="flex gap-3 mb-3 flex-wrap">
                    <input
                      type="number" min={0} max={100} value={pct}
                      onChange={e => setPct(Number(e.target.value))}
                      className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                    <input
                      type="text" placeholder="Add a comment (required)..." value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProgress} disabled={saving}
                      className="bg-cyan-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-cyan-600 transition disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Update Progress"}
                    </button>
                    <button
                      onClick={handleUndo}
                      className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                    >
                      ↩ Undo
                    </button>
                  </div>
                </div>

                {/* Progress timeline */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-4">Progress History</h3>
                  {history.length === 0
                    ? <p className="text-gray-400 text-sm">No updates yet.</p>
                    : (
                      <div className="space-y-3">
                        {[...history].reverse().map((h, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="mt-1 w-8 h-8 rounded-full bg-cyan-50 border-2 border-cyan-200 flex items-center justify-center text-xs font-bold text-cyan-600 flex-shrink-0">
                              {h.percentage}%
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700">{h.comment}</p>
                              <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>

                {/* Client feedback */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-4">Client Feedback</h3>
                  {feedback.length === 0
                    ? <p className="text-gray-400 text-sm">No feedback yet.</p>
                    : (
                      <div className="space-y-3">
                        {feedback.map((f, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-sm text-gray-700">{f.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              </>
            )}

            {/* ── NOTES TAB ── */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-1">Project Details</h3>
                  <p className="text-xs text-gray-400 mb-4">Visible to client in their dashboard</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Project Name</p>
                      <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
                        placeholder="e.g. E-commerce Website Redesign"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Project Description</p>
                      <textarea value={noteDesc} onChange={e => setNoteDesc(e.target.value)} rows={3}
                        placeholder="Brief description of the project scope..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notes for Client</p>
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
                        placeholder="Any important notes, instructions, or updates for the client..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none" />
                    </div>
                    <button
                      disabled={savingNote}
                      onClick={async () => {
                        setSavingNote(true);
                        try {
                          await updateProjectDetails(data.project._id, { title: noteTitle, description: noteDesc, notes: noteText });
                          toast.success("Notes saved — client can now see them");
                        } catch { toast.error("Failed to save"); }
                        setSavingNote(false);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
                      {savingNote ? "Saving..." : "💾 Save Notes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── CONTRACTS TAB ── */}
            {activeTab === "contracts" && (
              <div className="space-y-3">
                {contracts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-2">📝</p><p className="text-sm">No contracts yet</p>
                  </div>
                ) : contracts.map(c => {
                  const badge = {
                    draft: { label: "Draft", cls: "bg-gray-100 text-gray-500" },
                    sent:  { label: "Awaiting Signature", cls: "bg-amber-50 text-amber-600" },
                    viewed:{ label: "Viewed", cls: "bg-purple-50 text-purple-600" },
                    signed:{ label: "✓ Signed", cls: "bg-green-50 text-green-600" },
                    completed: { label: "Completed", cls: "bg-teal-50 text-teal-600" },
                  }[c.status] || { label: c.status, cls: "bg-gray-100 text-gray-500" };
                  return (
                    <div key={c._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800 text-sm">Freelance Agreement</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{c.freelancers?.map(f => f.name).join(", ")}</p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-400 mb-3">
                        <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                        {c.sentAt   && <span>Sent: {new Date(c.sentAt).toLocaleDateString()}</span>}
                        {c.viewedAt && <span>Viewed: {new Date(c.viewedAt).toLocaleDateString()}</span>}
                        {c.signedAt && <span className="text-green-600 font-medium">Signed: {new Date(c.signedAt).toLocaleDateString()}</span>}
                      </div>
                      {c.clientSignatureUrl && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 mb-1">Client Signature</p>
                          <img src={c.clientSignatureUrl} alt="sig" className="h-10 object-contain border-b border-gray-200" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => setViewer({ doc: c, docType: "contract" })}
                          className="flex-1 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition">View</button>
                        <a href={getContractPdfUrl(c._id)} target="_blank" rel="noopener noreferrer"
                          className="flex-1 text-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">📥 PDF</a>
                        {c.status === "draft" && (
                          <button onClick={async () => { try { await sendContract(c._id); toast.success("Sent!"); load(); } catch { toast.error("Failed"); } }}
                            className="flex-1 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-100 transition">Send</button>
                        )}
                        <button onClick={async () => {
                          if (!confirm("Delete this contract? This cannot be undone.")) return;
                          try { await deleteContract(c._id); toast.success("Contract deleted"); load(); }
                          catch { toast.error("Failed to delete"); }
                        }} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition">🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── INVOICES TAB ── */}
            {activeTab === "invoices" && (
              <div className="space-y-3">
                {invoices.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-2">🧾</p><p className="text-sm">No invoices yet</p>
                  </div>
                ) : invoices.map(inv => (
                  <div key={inv._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-800 text-sm">{inv.invoiceNumber}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mb-1">${Number(inv.total).toFixed(2)}</p>
                    {inv.paymentStatus === "confirmed" && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs text-green-600 font-semibold">✓ Payment Confirmed</span>
                        {inv.paymentConfirmedAt && <span className="text-xs text-gray-400">· {new Date(inv.paymentConfirmedAt).toLocaleDateString()}</span>}
                      </div>
                    )}
                    {inv.paymentNote && <p className="text-xs text-gray-500 mb-2 italic">{inv.paymentNote}</p>}
                    {inv.paymentReceiptUrl && (
                      <a href={`${BASE}${inv.paymentReceiptUrl}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 underline mb-2 block">View Receipt</a>
                    )}
                    <p className="text-xs text-gray-400 mb-3">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Upon receipt"}</p>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setViewer({ doc: inv, docType: "invoice" })}
                        className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition">View</button>
                      <a href={getInvoicePdfUrl(inv._id)} target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">📥 PDF</a>
                      {inv.status !== "paid" && inv.paymentStatus !== "confirmed" && (
                        <button onClick={() => setPayModal(inv)}
                          className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition">✓ Confirm Paid</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── TIMELINE TAB ── */}
            {activeTab === "timeline" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-5">Onboarding Timeline</h3>
                {!timeline ? (
                  <p className="text-gray-400 text-sm">No timeline data yet.</p>
                ) : (
                  <div className="space-y-0">
                    {timeline.steps?.map((step, i) => {
                      const isLast = i === timeline.steps.length - 1;
                      return (
                        <div key={step.key} className="flex gap-4">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                              step.completed ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200 text-gray-300"
                            }`}>
                              {step.completed ? "✓" : "✕"}
                            </div>
                            {!isLast && <div className={`w-0.5 flex-1 my-1 min-h-[18px] rounded-full ${step.completed ? "bg-green-200" : "bg-gray-100"}`} />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2">
                              <span>{STEP_META[step.key] || "•"}</span>
                              <p className={`text-sm font-medium ${step.completed ? "text-gray-800" : "text-gray-400"}`}>{step.label}</p>
                              {step.completed && <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Done</span>}
                            </div>
                            {step.completedAt && <p className="text-xs text-gray-400 mt-0.5 ml-6">{new Date(step.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                            {!step.completed && <p className="text-xs text-gray-300 mt-0.5 ml-6">Pending</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── MESSAGES TAB ── */}
            {activeTab === "messages" && (
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-2">📄</p><p className="text-sm">No messages yet</p>
                  </div>
                ) : documents.map(doc => (
                  <div key={doc._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="text-xs text-gray-400 capitalize mb-3">{doc.type} · {new Date(doc.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setViewer({ doc, docType: doc.type })}
                        className="flex-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition">View</button>
                      <a href={getDocumentPdfUrl(doc._id)} target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">📥 PDF</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Document viewer */}
      {viewer && (
        <DocumentViewer doc={viewer.doc} docType={viewer.docType} onClose={() => setViewer(null)} />
      )}

      {/* Payment confirm modal */}
      {payModal && (
        <PaymentConfirmModal invoice={payModal} onClose={() => setPayModal(null)} onConfirmed={load} />
      )}
    </motion.div>
  );
}

// ── Users Panel ────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ search, status: filter });
      setUsers(res.data);
    } catch { toast.error("Failed to load users"); }
    setLoading(false);
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  if (selected) return <UserDetailPanel userId={selected} onClose={() => { setSelected(null); load(); }} />;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
        />
        <div className="flex gap-2 flex-wrap">
          {["", "red", "orange", "green"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition ${filter === s ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s === "" ? "All" : STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading
        ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        )
        : users.length === 0
          ? <div className="text-center py-20 text-gray-400">No users found</div>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u, i) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                  onClick={() => setSelected(u._id)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={u.profileImage} name={`${u.name} ${u.surname}`} size={10} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{u.name} {u.surname}</p>
                      <p className="text-gray-400 text-xs truncate">{u.email}</p>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS[u.statusColor]?.dot}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS[u.statusColor]?.bg} ${STATUS[u.statusColor]?.text}`}>
                      {STATUS[u.statusColor]?.label}
                    </span>
                    <span className="text-xs text-gray-300">#{String(i + 1).padStart(3, "0")}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )
      }
    </div>
  );
}

// ── Overview Panel ─────────────────────────────────────────────────
function OverviewPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => toast.error("Failed to load stats"));
  }, []);

  const pieData = stats ? [
    { name: "Not Started", value: stats.red,    color: "#f87171" },
    { name: "In Progress", value: stats.orange, color: "#fb923c" },
    { name: "Completed",   value: stats.green,  color: "#4ade80" },
  ] : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clients"   value={stats?.total}     color="#22d3ee" icon="👥" />
        <StatCard label="Active Projects" value={stats?.active}    color="#fb923c" icon="⚡" />
        <StatCard label="Completed"       value={stats?.completed} color="#4ade80" icon="✅" />
        <StatCard label="Pending"         value={stats?.pending}   color="#f87171" icon="⏳" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Client Status Distribution</h3>
          {stats && (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-xs text-gray-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Project Stages</h3>
          {stats && (
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%"
                data={[
                  { name: "Pending",   value: stats.pending,   fill: "#f87171" },
                  { name: "Active",    value: stats.active,    fill: "#fb923c" },
                  { name: "Completed", value: stats.completed, fill: "#4ade80" },
                ]}>
                <RadialBar dataKey="value" cornerRadius={6} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [tab, setTab]             = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile

  // On desktop (≥1024px) open sidebar by default
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mq.matches);
    const handler = e => setSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      if (!isAdmin(session.user.email)) { navigate("/dashboard"); return; }
      setUser(session.user);
    });
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // Close sidebar on mobile after nav
  function handleNavClick(id) {
    setTab(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }

  const navItems = [
    { id: "overview",   label: "Overview",          icon: "📊" },
    { id: "users",      label: "Users",              icon: "👥" },
    { id: "onboarding", label: "Client Onboarding",  icon: "📄" },
  ];

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", fontSize: "13px" } }} />

      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-10 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-60 bg-white border-r border-gray-100 flex flex-col shadow-sm fixed h-full z-20 lg:relative lg:z-auto"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/Freelance.jpeg" alt="AP Studio" className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">AP Studio</p>
                  <p className="text-xs text-cyan-500 font-medium">Admin Panel</p>
                </div>
              </div>
              {/* Close button visible on mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-700 text-lg leading-none"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    tab === item.id ? "bg-cyan-50 text-cyan-600" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={user?.user_metadata?.avatar_url} name={user?.email} size={8} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{user?.email}</p>
                  <p className="text-xs text-cyan-500">Admin</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full text-xs text-gray-400 hover:text-red-500 transition text-left px-2">
                Sign out →
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(o => !o)} className="text-gray-400 hover:text-gray-700 text-lg">☰</button>
          <h1 className="font-bold text-gray-800 capitalize">{tab}</h1>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {tab === "overview"   && <OverviewPanel />}
            {tab === "users"      && <UsersPanel />}
            {tab === "onboarding" && <OnboardingDashboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}