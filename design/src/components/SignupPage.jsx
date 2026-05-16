import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_EMAIL_2 = import.meta.env.VITE_ADMIN_EMAIL_2;
const isAdmin = (email) => email === ADMIN_EMAIL || email === ADMIN_EMAIL_2;

export default function SignupPage() {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirectByRole(session.user.email);
    });
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static-bundles.visme.co/forms/vismeforms-embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    function handleVismeSubmit(e) {
      try {
        // Visme posts a message event when form submits
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.type === "form-submit" || data?.event === "form-submit" || data?.formId) {
          const fields = data?.fields || data?.data || data || {};
          // Match "First Name" and "Last Name" field labels
          const firstName = fields["First Name"] || fields["first_name"] || fields["firstname"] || "";
          const lastName  = fields["Last Name"]  || fields["last_name"]  || fields["lastname"]  || "";
          if (firstName || lastName) {
            localStorage.setItem("visme_first_name", firstName.trim());
            localStorage.setItem("visme_last_name",  lastName.trim());
          }
        }
      } catch { /* ignore parse errors */ }
    }
    window.addEventListener("message", handleVismeSubmit);
    return () => window.removeEventListener("message", handleVismeSubmit);
  }, []);

  function redirectByRole(email) {
    navigate(isAdmin(email) ? "/admin" : "/dashboard");
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setGoogleLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Visme form */}
      <div className="flex-1">
        <div
          className="visme_d"
          data-title="Freelance Form"
          data-url="p9nmnkyw-freelance-form?fullPage=true"
          data-domain="forms"
          data-full-page="true"
          data-min-height="100vh"
          data-form-id="179529"
        />
      </div>

      {/* Footer with Google button */}
      <div className="w-full bg-white border-t border-gray-200 px-4 py-5 flex flex-col items-center gap-3">
        <p className="text-gray-500 text-sm">Or sign in with</p>
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full max-w-sm flex items-center justify-center gap-3 bg-black text-white font-medium py-3 rounded-xl hover:bg-zinc-800 transition disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>
        <p className="text-xs text-gray-400 pb-1">AP Studio</p>
      </div>
    </div>
  );
}
