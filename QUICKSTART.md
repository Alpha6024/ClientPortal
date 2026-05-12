# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Supabase account (for authentication)

## 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb+srv://db_user:imbatman@clientportal.xg3oamq.mongodb.net/
JWT_SECRET=SECRET_KEY
PORT=5000
```

Start backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

## 2. Frontend Setup

```bash
cd design
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_EMAIL=your-admin@email.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

Start frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 3. First Time Setup

### Default Templates
On first backend start, 4 default templates are automatically seeded:
- ✅ Freelance Project Agreement
- ✅ Welcome Aboard Message
- ✅ Standard Invoice Template
- ✅ Thank You Note

### Admin Access
Login with the email specified in `VITE_ADMIN_EMAIL` to access admin dashboard.

## 4. Using the System

### Admin Workflow

#### Create a Contract
1. Go to **Admin Dashboard** → **Client Onboarding** tab
2. Click **+ New Contract**
3. **Step 1**: Select client from list
4. **Step 2**: Add freelancer details (1-2 freelancers)
   - Upload digital signatures for each freelancer
5. **Step 3**: Edit contract using rich text editor
   - Load default template or start from scratch
6. Click **Save & Send** to send to client

#### Create an Invoice
1. Click **+ New Invoice**
2. Select client
3. Add your freelancer details
4. Add line items (services)
5. Set tax rate (auto-calculates total)
6. Add due date and payment instructions
7. Click **Save & Send**

#### Send Welcome/Thank You Messages
1. Click **+ Welcome** or **+ Thank You**
2. Select client
3. Edit message (load template if needed)
4. Click **Send**

### Client Workflow

#### Sign a Contract
1. Login to **Client Dashboard**
2. Go to **Documents & Onboarding** tab
3. Find contract with "Sent" or "Viewed" status
4. Click **✍️ Sign**
5. Review contract
6. Upload your signature (PNG/JPG)
7. Check "I agree to terms and conditions"
8. Click **Sign Contract**

#### View Documents
- All contracts, invoices, and messages appear in the onboarding tab
- Download PDFs anytime
- Track onboarding progress with visual timeline

## 5. Features Overview

### ✨ What You Can Do

**Admin Side:**
- ✅ Create and send contracts with digital signatures
- ✅ Generate professional invoices with auto-calculations
- ✅ Send welcome messages and thank you notes
- ✅ Track document statuses in real-time
- ✅ Download PDFs for all documents
- ✅ Manage reusable templates
- ✅ Monitor client onboarding progress

**Client Side:**
- ✅ View all received documents
- ✅ Sign contracts digitally
- ✅ Download PDFs
- ✅ Track onboarding timeline
- ✅ See payment status
- ✅ Send feedback to admin

## 6. Document Statuses

### Contract Statuses
- 🟡 **Draft** - Being created
- 🔵 **Sent** - Delivered to client
- 🟣 **Viewed** - Client opened it
- 🟢 **Signed** - Client signed
- 🟢 **Completed** - Finalized

### Invoice Statuses
- 🟡 **Pending** - Awaiting payment
- 🟢 **Paid** - Payment received
- 🔴 **Overdue** - Past due date

## 7. Onboarding Timeline

The system automatically tracks these steps:
1. ✅ Contract Sent
2. ✅ Contract Signed
3. ✅ Welcome Message Sent
4. ✅ Invoice Sent
5. ✅ Client Portal Shared
6. ✅ Payment Received
7. ✅ Thank You Note Sent

Progress is shown as a percentage in both admin and client dashboards.

## 8. PDF Generation

All documents can be downloaded as professional PDFs:
- **Contracts**: Include freelancer and client signatures
- **Invoices**: Show line items, tax, and totals
- **Messages**: Formatted welcome and thank you notes

Click the **📥 PDF** button on any document to download.

## 9. Signature Upload

### Supported Formats
- PNG
- JPG/JPEG
- Max size: 5MB

### Where Signatures Are Used
- **Freelancer signatures**: Added during contract creation
- **Client signatures**: Uploaded when signing contracts
- **PDF generation**: Signatures appear in generated PDFs

## 10. Templates

### Using Templates
1. Go to **Templates** tab in admin dashboard
2. Browse default and custom templates
3. Click **Use Template** when creating documents
4. Edit as needed before sending

### Creating Custom Templates
1. Create a document (contract, welcome, etc.)
2. Save it as a template for future use
3. Templates appear in the template library

## 🎯 Tips & Best Practices

### For Admins
- ✅ Upload freelancer signatures during contract creation
- ✅ Use placeholders like [Client Name], [Amount] in templates
- ✅ Set realistic due dates on invoices
- ✅ Send welcome messages immediately after contract signing
- ✅ Send thank you notes after receiving payment

### For Clients
- ✅ Review contracts carefully before signing
- ✅ Download PDFs for your records
- ✅ Check onboarding timeline regularly
- ✅ Use feedback tab to communicate with admin

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure MongoDB Atlas allows connections from your IP
- Verify port 5000 is not in use

### Frontend won't connect
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Clear browser cache and reload

### Signature upload fails
- Check file format (PNG/JPG only)
- Ensure file size is under 5MB
- Verify `uploads/signatures` folder exists

### PDF generation fails
- Check backend logs for errors
- Ensure PDFKit is installed
- Verify `uploads/pdfs` folder exists

## 📚 Documentation

For detailed documentation, see:
- **ONBOARDING_SYSTEM.md** - Complete system documentation
- **API Endpoints** - Full REST API reference
- **Database Models** - Schema documentation

## 🎉 You're Ready!

The complete client onboarding and document management system is now running. Start by:
1. Creating your first contract
2. Sending it to a client
3. Having the client sign it
4. Generating invoices
5. Tracking the onboarding timeline

**Happy onboarding! 🚀**
