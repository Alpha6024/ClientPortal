import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getUsers, createDocument, sendDocument, getTemplates, getDocumentPdfUrl } from "../../api";
import RichEditor from "./RichEditor";

const DEFAULTS = {
  welcome: {
    title: "Welcome Aboard",
    content: `<h2>Welcome Aboard! 🎉</h2>
<p>Hi <strong>[Client Name]</strong>,</p>
<p>Really glad to be working with you. We're excited to bring your vision to life.</p>
<h3>What Happens Next</h3>
<ul><li>We will review your project requirements in detail</li><li>Project planning begins immediately</li><li>Regular updates will be shared inside your client portal</li></ul>
<h3>Communication</h3>
<p>Primary channel: <strong>[WhatsApp/Email]</strong><br/>Working hours: <strong>[Hours]</strong><br/>Response time: <strong>[Timeframe]</strong></p>
<p>Looking forward to working together!</p>
<p>Warm regards,<br/><strong>[Freelancer Name]</strong></p>`,
  },
  thankyou: {
    title: "Thank You Note",
    content: `<h2>Thank You! 🙏</h2>
<p>Hi <strong>[Client Name]</strong>,</p>
<p>Payment received successfully — thank you so much.</p>
<p>We're officially getting started on your project. The first update will be shared by <strong>[Date]</strong>.</p>
<p>We're committed to delivering exceptional work and making this a great experience for you.</p>
<p>Looking forward to this project!</p>
<p>Best regards,<br/><strong>[Freelancer Name]</strong></p>`,
  },
};

export default function MessageCreator({ type, onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [client, setClient] = useState(null);
  const [title, setTitle] = useState(DEFAULTS[type]?.title || "");
  const [content, setContent] = useState(DEFAULTS[type]?.content || "");
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUsers({}).then(r => setUsers(r.data)).catch(() => {});
    getTemplates({ type }).then(r => setTemplates(r.data)).catch(() => {});
  }, [type]);

  const filtered = users.filter(u =>
    `${u.name} ${u.surname} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(sendNow = false) {
    if (!client) { toast.error("Select a client"); return; }
    setSaving(true);
    try {
      const res = await createDocument({ type, title, content, clientId: client._id });
      if (sendNow) {
        await sendDocument(res.data._id);
        toast.success(`${type === "welcome" ? "Welcome message" : "Thank you note"} sent!`);
      } else {
        toast.success("Saved as draft");
      }
      onCreated?.();
      onClose?.();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  }

  const typeLabel = type === "welcome" ? "Welcome Message" : "Thank You Note";
  const typeEmoji = type === "welcome" ? "👋" : "🙏";

  return (
    <div className="space-y-4 overflow-y-auto max-h-[75vh]">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{typeEmoji}</span>
        <h3 className="font-semibold text-gray-700">{typeLabel}</h3>
      </div>

      {/* Client */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">Send To *</p>
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
            <div className="max-h-36 overflow-y-auto space-y-1">
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

      {/* Title */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Subject / Title</p>
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300" />
      </div>

      {/* Template loader */}
      {templates.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Load Template</p>
          <select onChange={e => {
            const t = templates.find(t => t._id === e.target.value);
            if (t) setContent(t.content);
          }} defaultValue=""
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300">
            <option value="" disabled>Select a template...</option>
            {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
      )}

      {/* Editor */}
      <RichEditor value={content} onChange={setContent} />

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
          {saving ? "Sending..." : "Send →"}
        </button>
      </div>
    </div>
  );
}
