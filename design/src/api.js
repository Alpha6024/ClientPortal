import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Users
export const upsertUser = (data) => api.post("/users/upsert", data);
export const getUsers = (params) => api.get("/users", { params });
export const getStats = () => api.get("/users/stats");
export const getUserById = (id) => api.get(`/users/${id}`);
export const getUserBySupabaseId = (sid) => api.get(`/users/supabase/${sid}`);
export const updateUserStatus = (id, statusColor) => api.patch(`/users/${id}/status`, { statusColor });

// Projects
export const getProjectByUser = (userId) => api.get(`/projects/user/${userId}`);
export const updateProgress = (id, data) => api.patch(`/projects/${id}/progress`, data);
export const undoProgress = (id) => api.patch(`/projects/${id}/undo`);
export const updateProjectDetails = (id, data) => api.patch(`/projects/${id}/details`, data);
export const deleteUser = (userId) => api.delete(`/projects/user/${userId}`);

// Feedback
export const addFeedback = (data) => api.post("/feedback", data);
export const getFeedbackByProject = (projectId) => api.get(`/feedback/project/${projectId}`);
export const markFeedbackRead = (projectId) => api.patch(`/feedback/project/${projectId}/read`);

// Documents
export const getDocuments = (params) => api.get("/documents", { params });
export const getDocumentById = (id) => api.get(`/documents/${id}`);
export const createDocument = (data) => api.post("/documents", data);
export const updateDocument = (id, data) => api.patch(`/documents/${id}`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const sendDocument = (id) => api.post(`/documents/${id}/send`);
export const getDocumentPdfUrl = (id) => `${api.defaults.baseURL}/documents/${id}/pdf`;

// Contracts
export const getContracts = (params) => api.get("/contracts", { params });
export const getContractById = (id) => api.get(`/contracts/${id}`);
export const createContract = (data) => api.post("/contracts", data);
export const updateContract = (id, data) => api.patch(`/contracts/${id}`, data);
export const sendContract = (id) => api.post(`/contracts/${id}/send`);
export const signContract = (id, data) => api.post(`/contracts/${id}/sign`, data);
export const deleteContract = (id) => api.delete(`/contracts/${id}`);
export const getContractPdfUrl = (id) => `${api.defaults.baseURL}/contracts/${id}/pdf`;

// Invoices
export const getInvoices = (params) => api.get("/invoices", { params });
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post("/invoices", data);
export const updateInvoice = (id, data) => api.patch(`/invoices/${id}`, data);
export const sendInvoice = (id) => api.post(`/invoices/${id}/send`);
export const confirmPayment = (id, data) => api.post(`/invoices/${id}/confirm`, data);
export const getInvoicePdfUrl = (id) => `${api.defaults.baseURL}/invoices/${id}/pdf`;

// Receipt upload
export const uploadReceipt = (formData) => api.post("/upload/receipt", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// Templates
export const getTemplates = (params) => api.get("/templates", { params });
export const createTemplate = (data) => api.post("/templates", data);
export const updateTemplate = (id, data) => api.patch(`/templates/${id}`, data);
export const deleteTemplate = (id) => api.delete(`/templates/${id}`);

// Onboarding
export const getOnboarding = (clientId) => api.get(`/onboarding/${clientId}`);
export const updateOnboardingStep = (data) => api.post("/onboarding/step", data);

// Signature upload
export const uploadSignature = (formData) => api.post("/upload/signature", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

export default api;
