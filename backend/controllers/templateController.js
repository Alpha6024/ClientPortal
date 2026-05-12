import Template from "../models/Template.js";

const DEFAULTS = [
  {
    type: "contract",
    name: "Freelance Project Agreement",
    isDefault: true,
    content: `<h2>Freelance Project Agreement</h2>
<h3>1. Project Overview</h3>
<p>This agreement is between <strong>[Freelancer Name]</strong> and <strong>[Client Name]</strong>, entered into on [Date].</p>
<h3>2. Deliverables</h3>
<p>The project includes:<br/>[Describe deliverables in detail]</p>
<h3>3. Timeline</h3>
<p>Project start date: [Start Date]<br/>Estimated completion: [End Date]</p>
<h3>4. Payment Terms</h3>
<p>Total project fee: <strong>$[Amount]</strong><br/>Deposit (50%) due before work begins: <strong>$[50% Amount]</strong><br/>Remaining balance due upon project completion.</p>
<h3>5. Revision Policy</h3>
<p>This project includes <strong>[Number]</strong> rounds of revisions. Additional revisions will be billed at $[Rate]/hour.</p>
<h3>6. Cancellation Terms</h3>
<p>Either party may cancel this agreement with 7 days written notice. The deposit is non-refundable once work has commenced.</p>
<h3>7. Ownership Rights</h3>
<p>Client receives full ownership of all final deliverables upon receipt of complete payment. Freelancer retains the right to display work in portfolio.</p>
<h3>8. Confidentiality</h3>
<p>Both parties agree to keep all project details, business information, and communications strictly confidential.</p>
<h3>9. Terms and Conditions</h3>
<p>This agreement constitutes the entire understanding between both parties. Any modifications must be agreed upon in writing by both parties.</p>`,
  },
  {
    type: "welcome",
    name: "Welcome Aboard",
    isDefault: true,
    content: `<h2>Welcome Aboard! 🎉</h2>
<p>Hi <strong>[Client Name]</strong>,</p>
<p>Really glad to be working with you. We're excited to bring your vision to life.</p>
<h3>What Happens Next</h3>
<ul>
<li>We will review your project requirements in detail</li>
<li>Project planning begins immediately</li>
<li>Regular updates will be shared inside your client portal</li>
</ul>
<h3>Communication</h3>
<p>Primary channel: <strong>[WhatsApp/Email]</strong><br/>Working hours: <strong>[Hours, e.g. Mon–Fri, 9am–6pm]</strong><br/>Response time: <strong>[e.g. Within 24 hours]</strong></p>
<p>Looking forward to working together and delivering something exceptional.</p>
<p>Warm regards,<br/><strong>[Freelancer Name]</strong></p>`,
  },
  {
    type: "invoice",
    name: "Standard Invoice",
    isDefault: true,
    content: `Standard Invoice Template`,
    metadata: {
      lineItems: [{ description: "Web Design & Development", quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      paymentInstructions: "Bank Transfer / PayPal / Wise\nAccount details will be shared separately.",
      notes: "Thank you for your business!",
    },
  },
  {
    type: "thankyou",
    name: "Thank You Note",
    isDefault: true,
    content: `<h2>Thank You! 🙏</h2>
<p>Hi <strong>[Client Name]</strong>,</p>
<p>Payment received successfully — thank you so much.</p>
<p>We're officially getting started on your project. The first update will be shared by <strong>[Date]</strong>.</p>
<p>We're committed to delivering exceptional work and making this a great experience for you.</p>
<p>Looking forward to this project!</p>
<p>Best regards,<br/><strong>[Freelancer Name]</strong></p>`,
  },
];

export async function seedDefaultTemplates() {
  const count = await Template.countDocuments({ isDefault: true });
  if (count === 0) {
    await Template.insertMany(DEFAULTS);
    console.log("Default templates seeded");
  }
}

export async function getTemplates(req, res, next) {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const templates = await Template.find(filter).sort({ isDefault: -1, createdAt: -1 });
    res.json(templates);
  } catch (e) { next(e); }
}

export async function createTemplate(req, res, next) {
  try {
    const t = await Template.create(req.body);
    res.status(201).json(t);
  } catch (e) { next(e); }
}

export async function updateTemplate(req, res, next) {
  try {
    const t = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json(t);
  } catch (e) { next(e); }
}

export async function deleteTemplate(req, res, next) {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
}
