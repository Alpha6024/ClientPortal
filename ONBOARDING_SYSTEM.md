# Client Onboarding & Document Management System

## 🎯 Overview

A complete freelancer-client onboarding platform with contract creation, digital signatures, invoice generation, document management, and timeline tracking.

## ✨ Features

### 📄 Contract System
- **3-Step Wizard**: Client selection → Freelancer details → Contract editor
- **Rich Text Editor**: Full formatting with headings, lists, alignment, quotes
- **Digital Signatures**: Upload PNG/JPG signatures for freelancers and clients
- **Terms & Conditions**: Checkbox acceptance before signing
- **PDF Generation**: Professional branded PDFs with signatures
- **Status Tracking**: Draft → Sent → Viewed → Signed → Completed
- **Multi-Freelancer Support**: 1-2 freelancers per contract

### 💰 Invoice System
- **Line Items**: Multiple services with quantity and pricing
- **Tax Calculation**: Automatic tax computation
- **Auto Invoice Numbers**: INV-{timestamp} format
- **Payment Status**: Pending → Paid → Overdue
- **PDF Export**: Professional invoice PDFs
- **Due Date Tracking**: Set payment deadlines
- **Payment Instructions**: Custom payment details

### 📝 Document System
- **Welcome Messages**: Onboard clients with personalized messages
- **Thank You Notes**: Acknowledge payments and milestones
- **Template System**: Save and reuse document templates
- **Rich Content**: Full HTML formatting support
- **PDF Downloads**: Generate PDFs for all documents

### 📋 Template Management
- **Default Templates**: Pre-built contract, welcome, invoice, thank you templates
- **Custom Templates**: Create and save reusable templates
- **Template Library**: Browse and load templates by type

### 🎯 Onboarding Timeline
- **7-Step Tracking**:
  1. Contract Sent
  2. Contract Signed
  3. Welcome Message Sent
  4. Invoice Sent
  5. Client Portal Shared
  6. Payment Received
  7. Thank You Note Sent
- **Progress Visualization**: Percentage-based progress bar
- **Completion Dates**: Track when each step was completed

### 🔐 Client Portal Features
- **Document Access**: View all contracts, invoices, and messages
- **Contract Signing**: Upload signature and accept terms
- **PDF Downloads**: Download all documents as PDFs
- **Timeline View**: See onboarding progress
- **Status Tracking**: Real-time document status updates

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**: REST API
- **MongoDB** + **Mongoose**: Database
- **PDFKit**: PDF generation
- **Multer**: File uploads
- **CORS** + **Helmet**: Security

### Frontend
- **React**: UI framework
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **TipTap**: Rich text editor
- **React Hot Toast**: Notifications
- **Axios**: API calls

## 📁 Project Structure

```
backend/
├── controllers/
│   ├── documentController.js    # All document operations
│   └── templateController.js    # Template management
├── models/
│   ├── Contract.js              # Contract schema
│   ├── Invoice.js               # Invoice schema
│   ├── Document.js              # Generic document schema
│   ├── Template.js              # Template schema
│   └── OnboardingTimeline.js    # Timeline tracking
├── routes/
│   ├── documentRoutes.js        # Document endpoints
│   └── templateRoutes.js        # Template endpoints
├── uploads/
│   ├── signatures/              # Signature images
│   └── pdfs/                    # Generated PDFs
└── server.js                    # Express server

design/src/components/
├── onboarding/
│   ├── OnboardingDashboard.jsx      # Admin onboarding panel
│   ├── ClientOnboardingPanel.jsx    # Client onboarding view
│   ├── ContractWizard.jsx           # Contract creation wizard
│   ├── InvoiceCreator.jsx           # Invoice creator
│   ├── MessageCreator.jsx           # Welcome/Thank you creator
│   ├── RichEditor.jsx               # TipTap editor wrapper
│   ├── SignatureUpload.jsx          # Signature upload component
│   └── StatusBadge.jsx              # Status indicator
├── AdminDashboard.jsx               # Admin dashboard
└── ClientDashboard.jsx              # Client dashboard
```

## 🚀 API Endpoints

### Documents
```
GET    /api/documents              # List all documents
GET    /api/documents/:id          # Get document by ID
POST   /api/documents              # Create document
PATCH  /api/documents/:id          # Update document
DELETE /api/documents/:id          # Delete document
POST   /api/documents/:id/send     # Send document to client
GET    /api/documents/:id/pdf      # Generate PDF
```

### Contracts
```
GET    /api/contracts              # List all contracts
GET    /api/contracts/:id          # Get contract by ID
POST   /api/contracts              # Create contract
PATCH  /api/contracts/:id          # Update contract
POST   /api/contracts/:id/send     # Send contract to client
POST   /api/contracts/:id/sign     # Client signs contract
GET    /api/contracts/:id/pdf      # Generate contract PDF
```

### Invoices
```
GET    /api/invoices               # List all invoices
GET    /api/invoices/:id           # Get invoice by ID
POST   /api/invoices               # Create invoice
PATCH  /api/invoices/:id           # Update invoice
POST   /api/invoices/:id/send      # Send invoice to client
GET    /api/invoices/:id/pdf       # Generate invoice PDF
```

### Templates
```
GET    /api/templates              # List all templates
POST   /api/templates              # Create template
PATCH  /api/templates/:id          # Update template
DELETE /api/templates/:id          # Delete template
```

### Onboarding
```
GET    /api/onboarding/:clientId   # Get client timeline
POST   /api/onboarding/step        # Update timeline step
```

### Uploads
```
POST   /api/upload/signature       # Upload signature image
```

## 🎨 UI Components

### Admin Dashboard
- **Overview Tab**: Stats and charts
- **Users Tab**: Client management
- **Client Onboarding Tab**: Document management dashboard
  - Contracts list with status badges
  - Invoices list with amounts
  - Documents list (welcome/thank you)
  - Templates library
  - Quick action buttons for creating new items

### Client Dashboard
- **Progress Tab**: Project progress tracking
- **Documents & Onboarding Tab**: 
  - Onboarding progress bar
  - Timeline with completion status
  - Contracts with sign button
  - Invoices with payment status
  - Messages (welcome/thank you)
  - PDF download buttons
- **Feedback Tab**: Send messages to admin

## 🔄 Workflows

### Contract Creation Flow
1. Admin clicks "New Contract"
2. **Step 1**: Select client from database
3. **Step 2**: Add 1-2 freelancers with details and signatures
4. **Step 3**: Edit contract body using rich text editor
5. Save as draft OR send to client
6. Client receives contract in portal
7. Client reviews, uploads signature, accepts terms
8. Contract status updates to "Signed"
9. Timeline automatically updates

### Invoice Creation Flow
1. Admin clicks "New Invoice"
2. Select client
3. Add freelancer details
4. Add line items (description, quantity, price)
5. Set tax rate (auto-calculates)
6. Add due date and payment instructions
7. Save and send to client
8. Client views invoice in portal
9. Client downloads PDF
10. Admin marks as paid when payment received

### Welcome/Thank You Flow
1. Admin clicks "Welcome" or "Thank You"
2. Select client
3. Edit message using rich text editor
4. Load template (optional)
5. Send to client
6. Client views in portal
7. Timeline updates automatically

## 🎯 Status System

### Document Statuses
- **Draft**: Being created
- **Sent**: Delivered to client
- **Viewed**: Client opened document
- **Signed**: Contract signed (contracts only)
- **Completed**: Finalized

### Invoice Statuses
- **Pending**: Awaiting payment
- **Paid**: Payment received
- **Overdue**: Past due date

## 📊 Database Models

### Contract
```javascript
{
  clientId: ObjectId,
  clientName: String,
  clientEmail: String,
  freelancers: [{
    name, email, mobile, role, signatureUrl
  }],
  body: String (HTML),
  status: String,
  clientSignatureUrl: String,
  termsAccepted: Boolean,
  sentAt, viewedAt, signedAt: Date
}
```

### Invoice
```javascript
{
  invoiceNumber: String (auto),
  clientId: ObjectId,
  clientName, clientEmail: String,
  freelancerName, freelancerEmail: String,
  lineItems: [{ description, quantity, unitPrice }],
  taxRate: Number,
  subtotal, tax, total: Number (auto-calculated),
  dueDate: Date,
  paymentInstructions, notes: String,
  status: String
}
```

### OnboardingTimeline
```javascript
{
  clientId: ObjectId,
  steps: [{
    key: String,
    label: String,
    completed: Boolean,
    completedAt: Date
  }]
}
```

## 🎨 Design System

### Colors
- **Primary**: Cyan-500 to Teal-500 gradient
- **Secondary**: Purple-500 to Pink-500
- **Success**: Green-400 to Emerald-400
- **Warning**: Orange-400 to Amber-400
- **Error**: Red-400

### Typography
- **Headings**: Bold, Gray-800
- **Body**: Regular, Gray-700
- **Muted**: Gray-400

### Components
- **Cards**: White background, rounded-3xl, subtle shadow
- **Buttons**: Gradient backgrounds, rounded-xl
- **Inputs**: Border-gray-200, rounded-xl, focus ring
- **Badges**: Rounded-full, colored backgrounds
- **Modals**: Backdrop blur, centered, max-w-3xl

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
npm install
# Configure .env with MONGO_URI
npm run dev
```

### Frontend Setup
```bash
cd design
npm install
npm run dev
```

### Environment Variables
```env
# Backend (.env)
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
PORT=5000

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_EMAIL=admin@example.com
```

## 📝 Default Templates

The system seeds 4 default templates on first run:
1. **Freelance Project Agreement**: Complete contract template
2. **Welcome Aboard**: Client onboarding message
3. **Standard Invoice**: Invoice structure
4. **Thank You Note**: Payment acknowledgment

## 🔒 Security Features

- **File Upload Validation**: Only PNG/JPG for signatures, 5MB limit
- **CORS Protection**: Configured for localhost:5173
- **Helmet Security Headers**: XSS protection
- **Input Sanitization**: HTML content sanitized
- **Status Validation**: Enum-based status checks

## 🎯 Future Enhancements

- Email notifications (SendGrid/Mailgun)
- E-signature integration (DocuSign)
- Payment gateway integration (Stripe)
- Document versioning
- Bulk operations
- Advanced analytics
- Mobile app
- Real-time collaboration

## 📄 License

MIT License - Free to use and modify

---

**Built with ❤️ for freelancers and their clients**
