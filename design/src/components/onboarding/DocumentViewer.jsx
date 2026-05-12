import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "./StatusBadge";
import { getContractPdfUrl, getInvoicePdfUrl, getDocumentPdfUrl } from "../../api";

// ── helpers ──────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-gray-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  );
}

function SigBlock({ url, name }) {
  if (!url) return null;
  return (
    <div className="text-center">
      <img src={url} alt={name} className="h-14 object-contain mx-auto border-b border-gray-300 pb-1 max-w-[160px]" />
      <p className="text-xs text-gray-400 mt-1">{name}</p>
    </div>
  );
}

// ── Contract viewer ──────────────────────────────────────────────────
function ContractView({ doc, pdfUrl }) {
  return (
    <div className="space-y-5">
      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-4">
        <InfoRow label="Client"    value={`${doc.clientName} · ${doc.clientEmail}`} />
        <InfoRow label="Status"    value={<StatusBadge status={doc.status} />} />
        <InfoRow label="Created"   value={new Date(doc.createdAt).toLocaleString()} />
        <InfoRow label="Sent"      value={doc.sentAt   ? new Date(doc.sentAt).toLocaleString()   : null} />
        <InfoRow label="Viewed"    value={doc.viewedAt ? new Date(doc.viewedAt).toLocaleString() : null} />
        <InfoRow label="Signed"    value={doc.signedAt ? new Date(doc.signedAt).toLocaleString() : null} />
        {doc.freelancers?.map((f, i) => (
          <InfoRow key={i} label={`Freelancer ${doc.freelancers.length > 1 ? i + 1 : ""}`}
            value={`${f.name} · ${f.role}`} />
        ))}
      </div>

      {/* Body */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 max-h-80 overflow-y-auto">
        <div className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: doc.body }} />
      </div>

      {/* Signatures */}
      {(doc.freelancers?.some(f => f.signatureUrl) || doc.clientSignatureUrl) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Signatures</p>
          <div className="flex flex-wrap gap-6">
            {doc.freelancers?.filter(f => f.signatureUrl).map((f, i) => (
              <SigBlock key={i} url={f.signatureUrl} name={`${f.name} (Freelancer)`} />
            ))}
            {doc.clientSignatureUrl && (
              <SigBlock url={doc.clientSignatureUrl} name={`${doc.clientName} (Client)`} />
            )}
          </div>
        </div>
      )}

      {doc.termsAccepted && (
        <p className="text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2">
          ✓ Client accepted terms and conditions
        </p>
      )}

      <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
        📥 Download PDF
      </a>
    </div>
  );
}

// ── Invoice viewer ───────────────────────────────────────────────────
function InvoiceView({ doc, pdfUrl }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-4">
        <InfoRow label="Invoice #"  value={doc.invoiceNumber} />
        <InfoRow label="Status"     value={<StatusBadge status={doc.status} />} />
        <InfoRow label="Client"     value={`${doc.clientName} · ${doc.clientEmail}`} />
        <InfoRow label="From"       value={doc.freelancerName} />
        <InfoRow label="Created"    value={new Date(doc.createdAt).toLocaleString()} />
        <InfoRow label="Due Date"   value={doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : "Upon receipt"} />
      </div>

      {/* Line items */}
      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-2.5 font-medium">Description</th>
              <th className="text-center px-3 py-2.5 font-medium">Qty</th>
              <th className="text-right px-3 py-2.5 font-medium">Price</th>
              <th className="text-right px-4 py-2.5 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {doc.lineItems?.map((item, i) => (
              <tr key={i} className={i % 2 === 1 ? "bg-gray-50/50" : ""}>
                <td className="px-4 py-2.5 text-gray-700">{item.description}</td>
                <td className="px-3 py-2.5 text-center text-gray-500">{item.quantity}</td>
                <td className="px-3 py-2.5 text-right text-gray-500">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-700">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-56 space-y-1.5 bg-gray-50 rounded-2xl p-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>${Number(doc.subtotal).toFixed(2)}</span>
          </div>
          {doc.taxRate > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax ({doc.taxRate}%)</span><span>${Number(doc.tax).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-cyan-600 border-t border-gray-200 pt-1.5">
            <span>Total</span><span>${Number(doc.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment status */}
      {doc.paymentStatus === "confirmed" && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="text-green-500 text-lg">✓</span>
          <div>
            <p className="text-sm font-semibold text-green-700">Payment Confirmed</p>
            {doc.paymentConfirmedAt && (
              <p className="text-xs text-green-500">{new Date(doc.paymentConfirmedAt).toLocaleString()}</p>
            )}
            {doc.paymentNote && <p className="text-xs text-green-600 mt-0.5">{doc.paymentNote}</p>}
          </div>
          {doc.paymentReceiptUrl && (
            <a href={`http://localhost:5000${doc.paymentReceiptUrl}`} target="_blank" rel="noopener noreferrer"
              className="ml-auto text-xs text-green-600 underline">View Receipt</a>
          )}
        </div>
      )}

      {doc.paymentInstructions && (
        <div className="bg-blue-50 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-blue-600 mb-1">Payment Instructions</p>
          <p className="text-sm text-blue-700 whitespace-pre-line">{doc.paymentInstructions}</p>
        </div>
      )}

      <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
        📥 Download PDF
      </a>
    </div>
  );
}

// ── Message viewer (welcome / thankyou) ──────────────────────────────
function MessageView({ doc, pdfUrl }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-4">
        <InfoRow label="To"       value={doc.clientId?.name ? `${doc.clientId.name} ${doc.clientId.surname || ""}` : doc.clientName} />
        <InfoRow label="Status"   value={<StatusBadge status={doc.status} />} />
        <InfoRow label="Created"  value={new Date(doc.createdAt).toLocaleString()} />
        <InfoRow label="Sent"     value={doc.sentAt ? new Date(doc.sentAt).toLocaleString() : null} />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 max-h-80 overflow-y-auto">
        <div className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: doc.content }} />
      </div>

      <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
        📥 Download PDF
      </a>
    </div>
  );
}

// ── Main DocumentViewer ──────────────────────────────────────────────
export default function DocumentViewer({ doc, docType, onClose }) {
  if (!doc) return null;

  const pdfUrl =
    docType === "contract" ? getContractPdfUrl(doc._id) :
    docType === "invoice"  ? getInvoicePdfUrl(doc._id)  :
    getDocumentPdfUrl(doc._id);

  const titles = {
    contract: "📄 Contract",
    invoice:  "💰 Invoice",
    welcome:  "👋 Welcome Message",
    thankyou: "🙏 Thank You Note",
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800">{titles[docType] || "Document"}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-lg">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {docType === "contract" && <ContractView doc={doc} pdfUrl={pdfUrl} />}
          {docType === "invoice"  && <InvoiceView  doc={doc} pdfUrl={pdfUrl} />}
          {(docType === "welcome" || docType === "thankyou") && <MessageView doc={doc} pdfUrl={pdfUrl} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
