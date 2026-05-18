import Template from "../models/Template.js";

const DEFAULTS = [
  {
    type: "contract",
    name: "Freelance Project Agreement",
    isDefault: true,
    content: `<h2>Freelance Project Agreement</h2>
<p>This Agreement is entered into between <strong>[Freelancer Name(s)]</strong> ("Developer") and <strong>[Client Name]</strong> ("Client") on [Date].</p>
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
<p>By proceeding with the project and payment, both parties acknowledge and agree to the terms stated above.</p>`,
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
