import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { uploadSignature } from "../../api";
import toast from "react-hot-toast";

export default function SignatureUpload({ value, onChange, label = "Upload Signature" }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Only PNG/JPG allowed");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("signature", file);
      const res = await uploadSignature(fd);
      onChange(`http://localhost:5000${res.data.url}`);
      toast.success("Signature uploaded");
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-cyan-300 transition text-center"
      >
        {value ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={value}
            alt="Signature"
            className="max-h-20 mx-auto object-contain"
          />
        ) : (
          <div className="text-gray-400 text-sm">
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </div>
            ) : (
              <>
                <p className="text-2xl mb-1">✍️</p>
                <p>Click to upload signature</p>
                <p className="text-xs text-gray-300 mt-1">PNG or JPG, max 5MB</p>
              </>
            )}
          </div>
        )}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-red-400 hover:text-red-600 transition"
        >
          Remove signature
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
    </div>
  );
}
