import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, sendDocument, generateDocumentPDF,
  getContracts, getContractById, createContract, updateContract, sendContract, signContract, generateContractPDF, deleteContract,
  getInvoices, getInvoiceById, createInvoice, updateInvoice, sendInvoice, generateInvoicePDF, confirmPayment,
  getOnboarding, updateOnboardingStep,
} from "../controllers/documentController.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sigStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, "../uploads/signatures")),
  filename:    (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const receiptStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, "../uploads/receipts")),
  filename:    (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const uploadSig     = multer({ storage: sigStorage,     limits: { fileSize: 5 * 1024 * 1024 } });
const uploadReceipt = multer({ storage: receiptStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// Documents
router.get("/documents",          getDocuments);
router.get("/documents/:id",      getDocumentById);
router.post("/documents",         createDocument);
router.patch("/documents/:id",    updateDocument);
router.delete("/documents/:id",   deleteDocument);
router.post("/documents/:id/send", sendDocument);
router.get("/documents/:id/pdf",  generateDocumentPDF);

// Contracts
router.get("/contracts",              getContracts);
router.get("/contracts/:id",          getContractById);
router.post("/contracts",             createContract);
router.patch("/contracts/:id",        updateContract);
router.post("/contracts/:id/send",    sendContract);
router.post("/contracts/:id/sign",    signContract);
router.delete("/contracts/:id",       deleteContract);
router.get("/contracts/:id/pdf",      generateContractPDF);

// Invoices
router.get("/invoices",               getInvoices);
router.get("/invoices/:id",           getInvoiceById);
router.post("/invoices",              createInvoice);
router.patch("/invoices/:id",         updateInvoice);
router.post("/invoices/:id/send",     sendInvoice);
router.post("/invoices/:id/confirm",  confirmPayment);
router.get("/invoices/:id/pdf",       generateInvoicePDF);

// Onboarding
router.get("/onboarding/:clientId",   getOnboarding);
router.post("/onboarding/step",       updateOnboardingStep);

// File uploads
router.post("/upload/signature", uploadSig.single("signature"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/signatures/${req.file.filename}` });
});

router.post("/upload/receipt", uploadReceipt.single("receipt"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/receipts/${req.file.filename}` });
});

export default router;
