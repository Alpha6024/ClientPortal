import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function Onboarding() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      setEmail(session.user.email);
    });
  }, [navigate]);

  useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://static-bundles.visme.co/forms/vismeforms-embed.js"]'
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://static-bundles.visme.co/forms/vismeforms-embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  function handleContinue() {
    navigate(email === ADMIN_EMAIL ? "/admin" : "/dashboard");
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div
        className="visme_d w-full"
        data-title="Freelance Form"
        data-url="p9nmnkyw-freelance-form?fullPage=true"
        data-domain="forms"
        data-full-page="true"
        data-min-height="100vh"
        data-form-id="179529"
      ></div>

      <div className="w-full flex justify-center py-6 border-t border-gray-200">
        <button
          onClick={handleContinue}
          className="bg-black text-white font-medium px-8 py-3 rounded-xl hover:bg-zinc-800 transition"
        >
          Continue to Dashboard →
        </button>
      </div>
    </div>
  );
}
