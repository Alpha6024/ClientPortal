# Freelance Studio — Client Portal

A full-stack freelancer–client management platform with contract creation, digital signatures, invoice generation, document management, onboarding timelines, and payment confirmation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Animations | Framer Motion, GSAP, Lenis |
| Rich Text | TipTap |
| Charts | Recharts |
| Auth | Supabase |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| PDF Generation | PDFKit |
| File Uploads | Multer |

---

## Project Structure

```
ClientPortal/
├── backend/                  # Express API server
│   ├── controllers/
│   │   ├── documentController.js   # Contracts, invoices, documents, PDFs
│   │   ├── templateController.js   # Template management + seeding
│   │   ├── projectController.js    # Project progress tracking
│   │   ├── feedbackController.js   # Client feedback
│   │   └── userController.js       # User management
│   ├── models/
│   │   ├── Contract.js
│   │   ├── Invoice.js
│   │   ├── Document.js
│   │   ├── Template.js
│   │   ├── OnboardingTimeline.js
│   │   ├── Project.js
│   │   ├── Feedback.js
│   │   └── User.js
│   ├── routes/
│   │   ├── documentRoutes.js
│   │   ├── templateRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/
│   │   ├── signatures/       # Uploaded signature images
│   │   ├── pdfs/             # Generated PDFs
│   │   └── receipts/         # Payment receipt uploads
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── design/                   # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── onboarding/
    │   │   │   ├── OnboardingDashboard.jsx   # Admin document management
    │   │   │   ├── ClientOnboardingPanel.jsx # Client-facing onboarding view
    │   │   │   ├── ContractWizard.jsx        # 3-step contract creation
    │   │   │   ├── InvoiceCreator.jsx        # Invoice builder
    │   │   │   ├── MessageCreator.jsx        # Welcome / thank you notes
    │   │   │   ├── DocumentViewer.jsx        # Universal document preview modal
    │   │   │   ├── PaymentConfirmModal.jsx   # Payment confirmation + receipt
    │   │   │   ├── RichEditor.jsx            # TipTap editor wrapper
    │   │   │   ├── SignatureUpload.jsx        # Signature image uploader
    │   │   │   └── StatusBadge.jsx           # Colored status indicators
    │   │   ├── AdminDashboard.jsx
    │   │   ├── ClientDashboard.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── SignupPage.jsx
    │   ├── api.js             # Axios API client + all endpoint functions
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## Features

### Admin Dashboard
- Overview with stats and charts (pie, radial bar)
- User/client management with search and status filters
- Per-client detail panel with tabs:
  - **Progress** — update project percentage, progress history, client feedback
  - **Contracts** — view, send, see signing status, download PDF
  - **Invoices** — view, confirm payment, upload receipt, download PDF
  - **Timeline** — onboarding step tracker with green ✓ / red ✕ indicators
  - **Messages** — welcome notes and thank you notes
- Mobile-responsive sidebar with overlay and auto-close

### Client Onboarding (Admin)
- Create contracts with a 3-step wizard (client → freelancers → editor)
- Rich text contract editor with full formatting toolbar
- Upload digital signatures for freelancers (PNG/JPG)
- Create professional invoices with line items, tax, due dates
- Send welcome messages and thank you notes
- Save and reuse document templates
- Confirm payments with receipt upload and notes
- Download PDFs for all document types

### Client Dashboard
- Project progress with milestone tracker
- **Documents & Onboarding tab:**
  - Onboarding progress bar
  - Timeline with step-by-step status
  - View and download all received documents
  - Sign contracts (upload signature + accept terms)
  - View payment confirmation and receipt
- Feedback tab to message the admin

### PDF Generation
- Professional branded PDFs for all document types
- Contract PDFs: parties, timeline, agreement body, signature blocks
- Invoice PDFs: itemized table, totals, tax, payment status
- Message PDFs: formatted letter layout
- Multi-page support with page numbers and footer

### Onboarding Timeline (7 steps)
1. Contract Sent
2. Contract Signed
3. Welcome Message Sent
4. Invoice Sent
5. Client Portal Shared
6. Payment Received
7. Thank You Note Sent

Steps auto-complete when the corresponding action is performed.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Supabase account (for authentication)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ClientPortal.git
cd ClientPortal
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

Start the backend:

```bash
npm run dev       # development (auto-restart)
npm start         # production
```

The server runs on `http://localhost:5000`.

On first start, 4 default templates are automatically seeded into the database.

---

### 3. Frontend setup

```bash
cd design
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_ADMIN_EMAIL=admin@yourdomain.com
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

---

### 4. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Email** authentication under Authentication → Providers
3. Copy your **Project URL** and **anon public key** into `design/.env`
4. Set `VITE_ADMIN_EMAIL` to the email address that should have admin access

---

## API Reference

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/:id` | Get document (marks as viewed) |
| POST | `/api/documents` | Create document |
| PATCH | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/documents/:id/send` | Send to client |
| GET | `/api/documents/:id/pdf` | Download PDF |

### Contracts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contracts` | List contracts (`?clientId=`) |
| GET | `/api/contracts/:id` | Get contract |
| POST | `/api/contracts` | Create contract |
| PATCH | `/api/contracts/:id` | Update contract |
| POST | `/api/contracts/:id/send` | Send to client |
| POST | `/api/contracts/:id/sign` | Client signs contract |
| GET | `/api/contracts/:id/pdf` | Download PDF |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices (`?clientId=`) |
| GET | `/api/invoices/:id` | Get invoice |
| POST | `/api/invoices` | Create invoice |
| PATCH | `/api/invoices/:id` | Update invoice |
| POST | `/api/invoices/:id/send` | Send to client |
| POST | `/api/invoices/:id/confirm` | Confirm payment |
| GET | `/api/invoices/:id/pdf` | Download PDF |

### Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List templates (`?type=`) |
| POST | `/api/templates` | Create template |
| PATCH | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |

### Onboarding
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/onboarding/:clientId` | Get client timeline |
| POST | `/api/onboarding/step` | Update a timeline step |

### Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/signature` | Upload signature image |
| POST | `/api/upload/receipt` | Upload payment receipt |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PORT` | Server port (default: 5000) |

### Frontend (`design/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_ADMIN_EMAIL` | Email address with admin access |
| `VITE_API_URL` | Backend API base URL |

---

## Default Templates

On first backend start, these templates are seeded automatically:

| Type | Name |
|------|------|
| Contract | Freelance Project Agreement |
| Welcome | Welcome Aboard |
| Invoice | Standard Invoice |
| Thank You | Thank You Note |

---

## Document Status Flow

```
Contract:  Draft → Sent → Viewed → Signed → Completed
Invoice:   Pending → Paid / Overdue
Payment:   Pending → Awaiting Verification → Confirmed
Message:   Draft → Sent → Viewed
```

---

## Scripts

### Backend
```bash
npm run dev     # Start with auto-restart (node --watch)
npm start       # Start for production
```

### Frontend
```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

---

## License

MIT — free to use and modify.
