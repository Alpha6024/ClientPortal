import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getContracts, getInvoices, getDocuments, getTemplates,
  getContractPdfUrl, getInvoicePdfUrl, getDocumentPdfUrl,
  sendContract, sendInvoice, sendDocument,
} from "../../api";
import ContractWizard from "./ContractWizard";
import InvoiceCreator from "./InvoiceCreator";
import MessageCreator from "./MessageCreator";
import StatusBadge from "./StatusBadge";
import DocumentViewer from "./DocumentViewer";
import PaymentConfirmModal from "./PaymentConfirmModal";

// ── Reusable modal shell ─────────────────────────────────────────────
function Modal({ isOpen, onClose, title, wide, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full ${wide ? "md:max-w-3xl" : "md:max-w-2xl"} bg-white rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh]`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-800">{title}</h2>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-lg">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Skeleton card ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="flex gap-2 pt-1">
        <div className="h-7 bg-gray-100 rounded-lg flex-1" />
        <div className="h-7 bg-gray-100 rounded-lg flex-1" />
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────
function EmptyState({ emoji, label, action, onAction }) {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-3">{emoji}</p>
      <p className="text-gray-400 text-sm mb-4">No {label} yet</p>
      {action && (
        <button onClick={onAction}
          className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
          {action}
        </button>
      )}
    </div>
  );
}

// ── Contract card ────────────────────────────────────────────────────
function ContractCard({ c, onView, onSend, i }) {
  const signBadge = {
    draft:     { label: "Draft",            cls: "bg-gray-100 text-gray-500" },
    sent:      { label: "Awaiting Signature", cls: "bg-amber-50 text-amber-600" },
    viewed:    { label: "Viewed",           cls: "bg-purple-50 text-purple-600" },
    signed:    { label: "✓ Signed",         cls: "bg-green-50 text-green-600" },
    completed: { label: "Completed",        cls: "bg-teal-50 text-teal-600" },
  }[c.status] || { label: c.status, cls: "bg-gray-100 text-gray-500" };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">Freelance Agreement</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{c.clientName}</p>
        </div>
        <span className={`ml-2 flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${signBadge.cls}`}>
          {signBadge.label}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{c.freelancers?.map(f => f.name).join(", ")}</p>
      <div className="flex gap-2">
        <a href={getContractPdfUrl(c._id)} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">
          📥 PDF
        </a>
        <button onClick={() => onView(c)}
          className="flex-1 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition">
          View
        </button>
        {c.status === "draft" && (
          <button onClick={() => onSend(c._id)}
            className="flex-1 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-100 transition">
            Send
          </button>
        )}
      </div>
      <p className="text-xs text-gray-300 mt-2">{new Date(c.createdAt).toLocaleDateString()}</p>
    </motion.div>
  );
}

// ── Invoice card ─────────────────────────────────────────────────────
function InvoiceCard({ inv, onView, onConfirm, onSend, i }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{inv.invoiceNumber}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{inv.clientName}</p>
        </div>
        <StatusBadge status={inv.status} />
      </div>
      <p className="text-2xl font-bold text-purple-600 mb-1">${Number(inv.total).toFixed(2)}</p>
      {inv.paymentStatus === "confirmed" && (
        <p className="text-xs text-green-600 font-medium mb-2">✓ Payment Confirmed</p>
      )}
      <div className="flex gap-2 flex-wrap">
        <a href={getInvoicePdfUrl(inv._id)} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">
          📥 PDF
        </a>
        <button onClick={() => onView(inv)}
          className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition">
          View
        </button>
        {inv.status !== "paid" && inv.paymentStatus !== "confirmed" && (
          <button onClick={() => onConfirm(inv)}
            className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition">
            ✓ Paid
          </button>
        )}
      </div>
      <p className="text-xs text-gray-300 mt-2">{new Date(inv.createdAt).toLocaleDateString()}</p>
    </motion.div>
  );
}

// ── Document card ────────────────────────────────────────────────────
function DocCard({ doc, onView, onSend, i }) {
  const typeColors = {
    welcome:  "bg-orange-50 text-orange-600",
    thankyou: "bg-green-50 text-green-600",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{doc.title}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{doc.clientId?.name || "—"}</p>
        </div>
        <StatusBadge status={doc.status} />
      </div>
      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-3 capitalize ${typeColors[doc.type] || "bg-gray-100 text-gray-500"}`}>
        {doc.type}
      </span>
      <div className="flex gap-2">
        <a href={getDocumentPdfUrl(doc._id)} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">
          📥 PDF
        </a>
        <button onClick={() => onView(doc)}
          className="flex-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition">
          View
        </button>
        {doc.status === "draft" && (
          <button onClick={() => onSend(doc._id)}
            className="flex-1 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-100 transition">
            Send
          </button>
        )}
      </div>
      <p className="text-xs text-gray-300 mt-2">{new Date(doc.createdAt).toLocaleDateString()}</p>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function OnboardingDashboard() {
  const [tab, setTab]           = useState("contracts");
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);   // "contract"|"invoice"|"welcome"|"thankyou"
  const [viewer, setViewer]       = useState(null);   // { doc, docType }
  const [payModal, setPayModal]   = useState(null);   // invoice object
  const [actionsOpen, setActionsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, inv, d, t] = await Promise.all([
        getContracts({}), getInvoices({}), getDocuments({}), getTemplates({}),
      ]);
      setContracts(c.data);
      setInvoices(inv.data);
      setDocuments(d.data);
      setTemplates(t.data);
    } catch { toast.error("Failed to load data"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSendContract(id) {
    try { await sendContract(id); toast.success("Contract sent!"); load(); }
    catch { toast.error("Failed to send"); }
  }
  async function handleSendInvoice(id) {
    try { await sendInvoice(id); toast.success("Invoice sent!"); load(); }
    catch { toast.error("Failed to send"); }
  }
  async function handleSendDocument(id) {
    try { await sendDocument(id); toast.success("Document sent!"); load(); }
    catch { toast.error("Failed to send"); }
  }

  const tabs = [
    { id: "contracts", label: "Contracts", icon: "📄", count: contracts.length },
    { id: "invoices",  label: "Invoices",  icon: "💰", count: invoices.length  },
    { id: "documents", label: "Messages",  icon: "📝", count: documents.length },
    { id: "templates", label: "Templates", icon: "📋", count: templates.length },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 sm:px-6 pt-5 pb-0 border-b border-gray-100 bg-white">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Client Onboarding</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Contracts · Invoices · Documents</p>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden sm:flex gap-2 flex-wrap justify-end">
            {[
              { label: "+ Contract", key: "contract", cls: "from-cyan-500 to-teal-500" },
              { label: "+ Invoice",  key: "invoice",  cls: "from-purple-500 to-pink-500" },
              { label: "+ Welcome",  key: "welcome",  cls: "from-orange-400 to-amber-400" },
              { label: "+ Thank You",key: "thankyou", cls: "from-green-400 to-emerald-400" },
            ].map(b => (
              <button key={b.key} onClick={() => setModal(b.key)}
                className={`px-3 py-2 bg-gradient-to-r ${b.cls} text-white rounded-xl text-xs font-semibold hover:opacity-90 transition`}>
                {b.label}
              </button>
            ))}
          </div>

          {/* Mobile: single "+" button */}
          <div className="sm:hidden relative">
            <button onClick={() => setActionsOpen(o => !o)}
              className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-xl text-xl font-bold flex items-center justify-center shadow-sm">
              +
            </button>
            <AnimatePresence>
              {actionsOpen && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-30 w-44 space-y-1">
                  {[
                    { label: "New Contract", key: "contract" },
                    { label: "New Invoice",  key: "invoice"  },
                    { label: "Welcome Msg",  key: "welcome"  },
                    { label: "Thank You",    key: "thankyou" },
                  ].map(b => (
                    <button key={b.key} onClick={() => { setModal(b.key); setActionsOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition">
                      {b.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-none">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-medium transition whitespace-nowrap border-b-2 ${
                tab === t.id
                  ? "border-cyan-500 text-cyan-600 bg-cyan-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}>
              <span>{t.icon}</span>
              <span className="hidden xs:inline">{t.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === t.id ? "bg-cyan-200 text-cyan-700" : "bg-gray-100 text-gray-400"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === "contracts" && (
              <motion.div key="contracts" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {contracts.length === 0
                  ? <EmptyState emoji="📄" label="contracts" action="Create First Contract" onAction={() => setModal("contract")} />
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contracts.map((c, i) => (
                        <ContractCard key={c._id} c={c} i={i}
                          onView={c => setViewer({ doc: c, docType: "contract" })}
                          onSend={handleSendContract} />
                      ))}
                    </div>
                }
              </motion.div>
            )}

            {tab === "invoices" && (
              <motion.div key="invoices" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {invoices.length === 0
                  ? <EmptyState emoji="💰" label="invoices" action="Create First Invoice" onAction={() => setModal("invoice")} />
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {invoices.map((inv, i) => (
                        <InvoiceCard key={inv._id} inv={inv} i={i}
                          onView={inv => setViewer({ doc: inv, docType: "invoice" })}
                          onConfirm={inv => setPayModal(inv)}
                          onSend={handleSendInvoice} />
                      ))}
                    </div>
                }
              </motion.div>
            )}

            {tab === "documents" && (
              <motion.div key="documents" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {documents.length === 0
                  ? <EmptyState emoji="📝" label="messages" />
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc, i) => (
                        <DocCard key={doc._id} doc={doc} i={i}
                          onView={doc => setViewer({ doc, docType: doc.type })}
                          onSend={handleSendDocument} />
                      ))}
                    </div>
                }
              </motion.div>
            )}

            {tab === "templates" && (
              <motion.div key="templates" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {templates.length === 0
                  ? <EmptyState emoji="📋" label="templates" />
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((t, i) => (
                        <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{t.name}</p>
                              <p className="text-xs text-gray-400 capitalize mt-0.5">{t.type}</p>
                            </div>
                            {t.isDefault && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium flex-shrink-0">Default</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-300">{new Date(t.createdAt).toLocaleDateString()}</p>
                        </motion.div>
                      ))}
                    </div>
                }
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── Creation modals ── */}
      <Modal isOpen={modal === "contract"} onClose={() => setModal(null)} title="Create Contract" wide>
        <ContractWizard onClose={() => setModal(null)} onCreated={load} />
      </Modal>
      <Modal isOpen={modal === "invoice"} onClose={() => setModal(null)} title="Create Invoice">
        <InvoiceCreator onClose={() => setModal(null)} onCreated={load} />
      </Modal>
      <Modal isOpen={modal === "welcome"} onClose={() => setModal(null)} title="Welcome Message">
        <MessageCreator type="welcome" onClose={() => setModal(null)} onCreated={load} />
      </Modal>
      <Modal isOpen={modal === "thankyou"} onClose={() => setModal(null)} title="Thank You Note">
        <MessageCreator type="thankyou" onClose={() => setModal(null)} onCreated={load} />
      </Modal>

      {/* ── Document viewer ── */}
      {viewer && (
        <DocumentViewer doc={viewer.doc} docType={viewer.docType} onClose={() => setViewer(null)} />
      )}

      {/* ── Payment confirm modal ── */}
      {payModal && (
        <PaymentConfirmModal invoice={payModal} onClose={() => setPayModal(null)} onConfirmed={load} />
      )}
    </div>
  );
}
