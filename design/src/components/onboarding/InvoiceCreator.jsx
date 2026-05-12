import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getUsers, createInvoice, sendInvoice, getInvoicePdfUrl } from "../../api";

const EMPTY_ITEM = { description: "", quantity: 1, unitPrice: 0 };

export default function InvoiceCreator({ onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [client, setClient] = useState(null);
  const [freelancerName, setFreelancerName] = useState("");
  const [freelancerEmail, setFreelancerEmail] = useState("");
  const [lineItems, setLineItems] = useState([{ ...EMPTY_ITEM }]);
  const [taxRate, setTaxRate] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("Bank Transfer / PayPal / Wise\nAccount details will be shared separately.");
  const [notes, setNotes] = useState("Thank you for your business!");
  const [saving, setSaving] = useState(false);

  useEffect(() => { getUsers({}).then(r => setUsers(r.data)).catch(() => {}); }, []);

  const filtered = users.filter(u =>
    `${u.name} ${u.surname} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  function updateItem(i, field, val) {
    setLineItems(items => items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  const subtotal = lineItems.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice)), 0);
  const tax = +(subtotal * (taxRate / 100)).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  async function handleSave(sendNow = false) {
    if (!client) { toast.error("Select a client"); return; }
    if (!freelancerName) { toast.error("Enter freelancer name"); return; }
    setSaving(true);
    try {
      const payload = {
        clientId: client._id,
        clientName: `${client.name} ${client.surname}`,
        clientEmail: client.email,
        freelancerName,
        freelancerEmail,
        lineItems: lineItems.map(i => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
        taxRate: Number(taxRate),
        dueDate: dueDate || undefined,
        paymentInstructions,
        notes,
      };
      const res = await createInvoice(payload);
      if (sendNow) {
        await sendInvoice(res.data._id);
        toast.success("Invoice sent to client!");
      } else {
        toast.success("Invoice saved!");
      }
      onCreated?.();
      onClose?.();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save invoice");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5 overflow-y-auto max-h-[75vh]">
      {/* Client */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">Client *</p>
        {client ? (
          <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-200 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
              {client.name?.[0]}{client.surname?.[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-cyan-700">{client.name} {client.surname}</p>
              <p className="text-xs text-cyan-500">{client.email}</p>
            </div>
            <button onClick={() => setClient(null)} className="text-xs text-gray-400 hover:text-red-500">Change</button>
          </div>
        ) : (
          <div className="space-y-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filtered.map(u => (
                <div key={u._id} onClick={() => setClient(u)}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {u.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{u.name} {u.surname}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Freelancer */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Freelancer Name *</p>
          <input value={freelancerName} onChange={e => setFreelancerName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Freelancer Email</p>
          <input value={freelancerEmail} onChange={e => setFreelancerEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Services</p>
          <button onClick={() => setLineItems(i => [...i, { ...EMPTY_ITEM }])}
            className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">+ Add Item</button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-1">
            <span className="col-span-6">Description</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-center">Price</span>
            <span className="col-span-2 text-right">Total</span>
          </div>
          {lineItems.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-12 gap-2 items-center">
              <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)}
                placeholder="Service description"
                className="col-span-6 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
              <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)}
                className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-300" />
              <input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)}
                className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-300" />
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="text-sm font-medium text-gray-700">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                {lineItems.length > 1 && (
                  <button onClick={() => setLineItems(items => items.filter((_, idx) => idx !== i))}
                    className="text-red-300 hover:text-red-500 text-xs ml-1">✕</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Tax</span>
            <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(e.target.value)}
              className="w-14 border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-cyan-300" />
            <span className="text-gray-400 text-xs">%</span>
          </div>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-bold border-t border-gray-200 pt-2">
          <span>Total</span>
          <span className="text-cyan-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Due Date & Instructions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Due Date</p>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Payment Instructions</p>
        <textarea value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Notes</p>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        <div className="flex-1" />
        <button onClick={() => handleSave(false)} disabled={saving}
          className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          Save Draft
        </button>
        <button onClick={() => handleSave(true)} disabled={saving}
          className="px-5 py-2 text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save & Send →"}
        </button>
      </div>
    </div>
  );
}
