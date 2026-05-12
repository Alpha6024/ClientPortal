import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getContracts, getInvoices, getDocuments, getOnboarding,
  signContract, getContractPdfUrl, getInvoicePdfUrl, getDocumentPdfUrl,
} from "../../api";
import SignatureUpload from "./SignatureUpload";
import StatusBadge from "./StatusBadge";
import DocumentViewer from "./DocumentViewer";

// ── Timeline step icons ──────────────────────────────────────────────
const STEP_META = {
  contract_sent:    { icon: "📄", color: "cyan"   },
  contract_signed:  { icon: "✍️", color: "teal"   },
  welcome_sent:     { icon: "👋", color: "orange" },
  invoice_sent:     { icon: "💰", color: "purple" },
  portal_shared:    { icon: "🔗", color: "blue"   },
  payment_received: { icon: "✅", color: "green"  },
  thankyou_sent:    { icon: "🙏", color: "pink"   },
};

// ── Contract sign modal ──────────────────────────────────────────────
function ContractSignModal({ contract, onClose, onSigned }) {
  const [sig, setSig]       = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);

  async function handleSign() {
    if (!agreed) { toast.error("Please accept the terms and conditions"); return; }
    if (!sig)    { toast.error("Please upload your signature"); return; }
    setSigning(true);
    try {
      await signContract(contract._id, { clientSignatureUrl: sig, termsAccepted: true });
      toast.success("Contract signed successfully!");
      onSigned?.();
      onClose?.();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to sign contract");
    }
    setSigning(false);
  }

  return (
    <div className="space-y-5">
      {/* Contract body preview */}
      <div className="bg-gray-50 rounded-2xl p-5 max-h-56 overflow-y-auto">
        <div className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: contract.body }} />
      </div>

      {/* Freelancer signatures */}
      {contract.freelancers?.some(f => f.signatureUrl) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Freelancer Signature(s)</p>
          <div className="flex gap-5 flex-wrap">
            {contract.freelancers.filter(f => f.signatureUrl).map((f, i) => (
              <div key={i} className="text-center">
                <img src={f.signatureUrl} alt={f.name} className="h-12 object-contain border-b border-gray-300 pb-1 max-w-[140px]" />
                <p className="text-xs text-gray-400 mt-1">{f.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <SignatureUpload value={sig} onChange={setSig} label="Your Signature *" />

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-cyan-500" />
        <span className="text-sm text-gray-600">
          I have read and agree to the <span className="text-cyan-600 font-medium">terms and conditions</span> outlined in this contract.
        </span>
      </label>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        <div className="flex-1" />
        <a href={getContractPdfUrl(contract._id)} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
          📥 PDF
        </a>
        <button onClick={handleSign} disabled={signing || !agreed || !sig}
          className="px-5 py-2 text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
          {signing ? "Signing..." : "✍️ Sign Contract"}
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function ClientOnboardingPanel({ clientId }) {
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [signingContract, setSigningContract] = useState(null);
  const [viewer, setViewer]       = useState(null);

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const [c, inv, d, ob] = await Promise.all([
        getContracts({ clientId }),
        getInvoices({ clientId }),
        getDocuments({ clientId }),
        getOnboarding(clientId),
      ]);
      setContracts(c.data);
      setInvoices(inv.data);
      setDocuments(d.data);
      setTimeline(ob.data);
    } catch { toast.error("Failed to load onboarding data"); }
    setLoading(false);
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const completedSteps = timeline?.steps?.filter(s => s.completed).length || 0;
  const totalSteps     = timeline?.steps?.length || 7;
  const progress       = Math.round((completedSteps / totalSteps) * 100);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Progress hero ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Onboarding Progress</h2>
            <p className="text-cyan-100 text-sm mt-0.5">{completedSteps} of {totalSteps} steps completed</p>
          </div>
          <div className="text-4xl font-black tabular-nums">{progress}%</div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5">
          <motion.div className="h-2.5 rounded-full bg-white"
            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </div>
      </motion.div>

      {/* ── Timeline ── */}
      {timeline && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-5">Onboarding Timeline</h3>
          <div className="space-y-0">
            {timeline.steps.map((step, i) => {
              const meta = STEP_META[step.key] || {};
              const isLast = i === timeline.steps.length - 1;
              return (
                <div key={step.key} className="flex gap-4">
                  {/* Connector column */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    {/* Icon circle */}
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 transition-all ${
                        step.completed
                          ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200"
                          : "bg-white border-gray-200 text-gray-300"
                      }`}
                    >
                      {step.completed
                        ? <span className="text-base">✓</span>
                        : <span className="text-base text-red-300">✕</span>
                      }
                    </motion.div>
                    {/* Vertical line */}
                    {!isLast && (
                      <div className={`w-0.5 flex-1 my-1 min-h-[20px] rounded-full transition-colors ${
                        step.completed ? "bg-green-200" : "bg-gray-100"
                      }`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-4 ${isLast ? "" : ""}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base">{meta.icon || "•"}</span>
                      <p className={`text-sm font-semibold ${step.completed ? "text-gray-800" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      {step.completed && (
                        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">Done</span>
                      )}
                    </div>
                    {step.completedAt && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-6">
                        {new Date(step.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                    {!step.completed && (
                      <p className="text-xs text-gray-300 mt-0.5 ml-6">Pending</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Contracts ── */}
      {contracts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">📄 Contracts</h3>
          <div className="space-y-3">
            {contracts.map(c => (
              <div key={c._id} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">Freelance Project Agreement</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={c.status} />
                <div className="flex gap-2">
                  <button onClick={() => setViewer({ doc: c, docType: "contract" })}
                    className="px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition">
                    View
                  </button>
                  <a href={getContractPdfUrl(c._id)} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                    📥 PDF
                  </a>
                  {(c.status === "sent" || c.status === "viewed") && (
                    <button onClick={() => setSigningContract(c)}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition">
                      ✍️ Sign
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Invoices ── */}
      {invoices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">💰 Invoices</h3>
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv._id} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Upon receipt"}
                  </p>
                </div>
                <span className="text-base font-bold text-purple-600">${Number(inv.total).toFixed(2)}</span>
                {inv.paymentStatus === "confirmed"
                  ? <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">✓ Paid</span>
                  : <StatusBadge status={inv.status} />
                }
                <div className="flex gap-2">
                  <button onClick={() => setViewer({ doc: inv, docType: "invoice" })}
                    className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition">
                    View
                  </button>
                  <a href={getInvoicePdfUrl(inv._id)} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                    📥 PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Messages ── */}
      {documents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">📝 Messages</h3>
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc._id} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">{doc.title}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                    {doc.type} · {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={doc.status} />
                <div className="flex gap-2">
                  <button onClick={() => setViewer({ doc, docType: doc.type })}
                    className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition">
                    View
                  </button>
                  <a href={getDocumentPdfUrl(doc._id)} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                    📥 PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {contracts.length === 0 && invoices.length === 0 && documents.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-gray-400 text-sm">No documents yet.</p>
          <p className="text-gray-300 text-xs mt-1">Your documents will appear here once sent.</p>
        </motion.div>
      )}

      {/* ── Sign contract modal ── */}
      <AnimatePresence>
        {signingContract && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSigningContract(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-base font-bold text-gray-800">Sign Contract</h2>
                <button onClick={() => setSigningContract(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-lg">
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <ContractSignModal
                  contract={signingContract}
                  onClose={() => setSigningContract(null)}
                  onSigned={load}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Document viewer ── */}
      {viewer && (
        <DocumentViewer doc={viewer.doc} docType={viewer.docType} onClose={() => setViewer(null)} />
      )}
    </div>
  );
}
