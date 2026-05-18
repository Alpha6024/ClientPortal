import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getUsers } from "../../api";
import { createContract, sendContract, getTemplates, getContractPdfUrl } from "../../api";
import RichEditor from "./RichEditor";
import SignatureUpload from "./SignatureUpload";

const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "2-digit" });
const DEFAULT_CONTRACT = `<h2>Freelance Project Agreement</h2>
<p>This Agreement is entered into between <strong>[Freelancer Name(s)]</strong> ("Developer") and <strong>[Client Name]</strong> ("Client") on ${today}.</p>
<h3>1. Project Overview</h3>
<p>The Developer agrees to design and develop a website/project for the Client based on the requirements discussed and approved by both parties.</p>
<h3>2. Deliverables</h3>
<p>The project includes:</p>
<ul>
<li>Custom website design and development</li>
<li>Responsive/mobile-friendly layout</li>
<li>Features and pages agreed upon before development</li>
<li>Final deployment/setup</li>
</ul>
<p>Any additional features or requests outside the agreed scope may result in additional charges.</p>
<h3>3. Project Timeline</h3>
<ul>
<li>Project Start Date: [Start Date]</li>
<li>Estimated Completion Date: [End Date]</li>
<li>Estimated development period: [X weeks]</li>
</ul>
<p>The project workflow includes the following meetings/checkpoints:</p>
<ul>
<li>1. Requirement Analysis Meeting</li>
<li>2. Design Review &amp; Approval Meeting</li>
<li>3. Final Review Before Delivery/Deployment</li>
</ul>
<p><strong>Note:</strong> Timeline may extend if the Client delays required content, approvals, feedback, or communication.</p>
<h3>4. Payment Terms</h3>
<ul>
<li>Total Project Fee: Rs. [Amount]</li>
</ul>
<p>Payment Structure:</p>
<ul>
<li>50% advance payment must be completed before development begins.</li>
<li>Remaining 50% payment must be completed before final delivery, deployment, or source file handover.</li>
</ul>
<p>Work will not begin until the advance payment is received.</p>
<h3>5. Cancellation &amp; Refund Policy</h3>
<ul>
<li>If the project is cancelled before work has started, the Client is eligible for a full refund.</li>
<li>If the project is cancelled after work has commenced, only 50% of the advance payment will be refunded.</li>
</ul>
<p>The remaining amount will be retained to cover design, planning, and development time already invested.</p>
<h3>6. Revision Policy</h3>
<p>The project includes 2 revision rounds:</p>
<ul>
<li>After the design phase</li>
<li>Before final delivery</li>
</ul>
<p>Any additional revisions or change requests beyond these rounds may incur additional charges.</p>
<h3>7. Post-Delivery Updates &amp; Maintenance</h3>
<p>After final delivery:</p>
<ul>
<li>Small updates/minor changes: Rs. 250</li>
<li>Larger updates/design modifications: Rs. 500</li>
<li>Major feature additions or patch updates (e.g. payment gateway integration, dashboard systems, advanced functionality) will be quoted separately based on project complexity.</li>
</ul>
<h3>8. Ownership Rights</h3>
<p>The Client receives ownership of the final deliverables only after full payment has been completed. Source files, code, assets, and deployment credentials will not be transferred until all pending payments are cleared.</p>
<h3>9. Confidentiality</h3>
<p>Both parties agree to keep all project-related information, files, and communications confidential unless otherwise agreed in writing.</p>
<h3>10. Terms &amp; Conditions</h3>
<p>This Agreement represents the complete understanding between both parties. Any modifications, additions, or changes to the project scope or agreement must be confirmed in writing by both parties.</p>
<h3>11. Acceptance</h3>
<p>By proceeding with the project and payment, both parties acknowledge and agree to the terms stated above.</p>`;

const EMPTY_FREELANCER = { name: "", email: "", mobile: "", role: "", signatureUrl: "" };

const steps = ["Select Client", "Freelancer(s)", "Contract Editor"];

export default function ContractWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientMobile, setClientMobile] = useState("");
  const [freelancers, setFreelancers] = useState([{ ...EMPTY_FREELANCER }]);
  const [body, setBody] = useState(DEFAULT_CONTRACT);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    getUsers({}).then(r => setUsers(r.data)).catch(() => {});
    getTemplates({ type: "contract" }).then(r => setTemplates(r.data)).catch(() => {});
  }, []);

  const filtered = users.filter(u =>
    `${u.name} ${u.surname} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  function addFreelancer() {
    if (freelancers.length >= 2) return;
    setFreelancers(f => [...f, { ...EMPTY_FREELANCER }]);
  }

  function removeFreelancer(i) {
    if (freelancers.length === 1) return;
    setFreelancers(f => f.filter((_, idx) => idx !== i));
  }

  function updateFreelancer(i, field, val) {
    setFreelancers(f => f.map((fr, idx) => idx === i ? { ...fr, [field]: val } : fr));
  }

  function canNext() {
    if (step === 0) return !!selectedClient;
    if (step === 1) return freelancers.every(f => f.name && f.email && f.role);
    return true;
  }

  async function handleSave(sendNow = false) {
    setSaving(true);
    try {
      const payload = {
        clientId: selectedClient._id,
        clientName: `${selectedClient.name} ${selectedClient.surname}`,
        clientEmail: selectedClient.email,
        clientMobile,
        freelancers,
        body,
        status: "draft",
      };
      const res = await createContract(payload);
      if (sendNow) {
        await sendContract(res.data._id);
        toast.success("Contract sent to client!");
      } else {
        toast.success("Contract saved as draft");
      }
      onCreated?.();
      onClose?.();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save contract");
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? "text-cyan-600" : "text-gray-300"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? "bg-cyan-500 border-cyan-500 text-white" : i === step ? "border-cyan-500 text-cyan-600" : "border-gray-200 text-gray-300"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i < step ? "bg-cyan-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* STEP 0: Select Client */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="font-semibold text-gray-700">Select Client</h3>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filtered.map(u => (
                  <motion.div
                    key={u._id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedClient(u)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition ${selectedClient?._id === u._id ? "border-cyan-400 bg-cyan-50" : "border-gray-100 hover:border-gray-200 bg-white"}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                      {u.name?.[0]}{u.surname?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{u.name} {u.surname}</p>
                      <p className="text-gray-400 text-xs truncate">{u.email}</p>
                    </div>
                    <p className="text-xs text-gray-300 font-mono">{u._id.slice(-6)}</p>
                    {selectedClient?._id === u._id && <span className="text-cyan-500 text-sm">✓</span>}
                  </motion.div>
                ))}
                {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No clients found</p>}
              </div>
              {selectedClient && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-sm space-y-2">
                  <p className="font-medium text-cyan-700">Selected: {selectedClient.name} {selectedClient.surname}</p>
                  <p className="text-cyan-500 text-xs">{selectedClient.email} · ID: {selectedClient._id}</p>
                  <input
                    value={clientMobile}
                    onChange={e => setClientMobile(e.target.value)}
                    placeholder="Client Mobile Number (optional)"
                    className="w-full border border-cyan-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 1: Freelancers */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Freelancer Details</h3>
                {freelancers.length < 2 && (
                  <button onClick={addFreelancer} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">+ Add 2nd Freelancer</button>
                )}
              </div>
              {freelancers.map((fr, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Freelancer {i + 1}</p>
                    {i > 0 && (
                      <button onClick={() => removeFreelancer(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { field: "name", placeholder: "Full Name", required: true },
                      { field: "email", placeholder: "Email", required: true },
                      { field: "mobile", placeholder: "Mobile Number" },
                      { field: "role", placeholder: "Role / Title", required: true },
                    ].map(({ field, placeholder, required }) => (
                      <input
                        key={field}
                        value={fr[field]}
                        onChange={e => updateFreelancer(i, field, e.target.value)}
                        placeholder={placeholder + (required ? " *" : "")}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 bg-white"
                      />
                    ))}
                  </div>
                  <SignatureUpload
                    value={fr.signatureUrl}
                    onChange={url => updateFreelancer(i, "signatureUrl", url)}
                    label={`${fr.name || "Freelancer"}'s Signature`}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* STEP 2: Contract Editor */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Contract Editor</h3>
                {templates.length > 0 && (
                  <select
                    onChange={e => {
                      const t = templates.find(t => t._id === e.target.value);
                      if (t) setBody(t.content);
                    }}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    defaultValue=""
                  >
                    <option value="" disabled>Load template...</option>
                    {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                )}
              </div>
              <RichEditor value={body} onChange={setBody} />
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                💡 Use placeholders like [Client Name], [Freelancer Name], [Amount] — they'll be filled in the final document.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
        <button
          onClick={() => step === 0 ? onClose?.() : setStep(s => s - 1)}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          {step === 0 ? "Cancel" : "← Back"}
        </button>
        <div className="flex gap-2">
          {step === 2 && (
            <>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-5 py-2 text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Sending..." : "Save & Send →"}
              </button>
            </>
          )}
          {step < 2 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="px-5 py-2 text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
