import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { upsertUser } from "../api";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }

      const { user } = session;
      const meta = user.user_metadata;

      // Read name/surname saved from Visme form — takes priority over Google metadata
      const vismeFirst = localStorage.getItem("visme_first_name") || "";
      const vismeLast  = localStorage.getItem("visme_last_name")  || "";

      // Fall back to Google metadata if Visme data not present
      const fullName = meta?.full_name || meta?.name || "";
      const [googleFirst, ...googleRest] = fullName.split(" ");

      const name    = vismeFirst || googleFirst || user.email.split("@")[0];
      const surname = vismeLast  || googleRest.join(" ") || "";

      // Clear localStorage after use
      localStorage.removeItem("visme_first_name");
      localStorage.removeItem("visme_last_name");

      try {
        await upsertUser({
          supabaseId: user.id,
          email: user.email,
          name,
          surname,
          profileImage: meta?.avatar_url || meta?.picture || "",
          role: user.email === ADMIN_EMAIL ? "admin" : "client",
        });
      } catch (e) {
        console.error("Upsert failed", e);
      }

      const { created_at, last_sign_in_at } = user;
      const isNewUser = Math.abs(new Date(created_at) - new Date(last_sign_in_at)) < 10000;

      if (user.email === ADMIN_EMAIL) {
        navigate("/admin");
      } else if (isNewUser) {
        window.location.href = "/onboarding.html";
      } else {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "white", fontSize: 14 }}>Signing you in...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
