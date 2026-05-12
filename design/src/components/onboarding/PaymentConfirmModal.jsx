import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { confirmPayment, uploadReceipt } from "../../api";

export default function PaymentConfirmModal({ invoice, onClose, onConfirmed }) {
  const [note, setNote]         = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [uploading, setUploading]   = useState(false);
  const [saving, setSaving]         = useState(false);

  async function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      const res = await uploadReceipt(fd);
      setReceiptUrl(res.data.url);
      toast.success("Receipt uploaded");
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      await confirmPayment(invoice._id, { paymentNote: note, paymentReceiptUrl: receiptUrl });
      toast.success("Payment confirmed!");
      onConfirmed?.();
      onClose?.();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to confirm payment");
    }
    setSaving(false);
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-3xl shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Confirm Payment</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Invoice summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invoice</span>
              <span className="font-semibold text-gray-700">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Client</span>
              <span className="font-medium text-gray-700">{invoice.clientName}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span className="text-gray-600">Amount</span>
              <span className="text-cyan-600">${Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Receipt upload */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Payment Receipt (optional)</p>
            {receiptUrl ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-green-700 flex-1">Receipt uploaded</span>
                <a href={`http://localhost:5000${receiptUrl}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-600 underline">View</a>
                <button onClick={() => setReceiptUrl("")} className="text-xs text-red-400 hover:text-red-600">Remove</button>
              </div>
            ) : (
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-cyan-300 transition">
                <span className="text-2xl">📎</span>
                <div>
                  <p className="text-sm text-gray-600">{uploading ? "Uploading..." : "Upload receipt"}</p>
                  <p className="text-xs text-gray-400">Image or PDF, max 10MB</p>
                </div>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceiptUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Note */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Payment Note (optional)</p>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="e.g. Received via bank transfer on..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
              {saving ? "Confirming..." : "✓ Confirm Payment"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
