import React, { useEffect } from "react";

const signup = () => {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://static-bundles.visme.co/forms/vismeforms-embed.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://static-bundles.visme.co/forms/vismeforms-embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">
      <div
        className="visme_d w-full"
        data-title="Freelance Form"
        data-url="p9nmnkyw-freelance-form?fullPage=true"
        data-domain="forms"
        data-full-page="true"
        data-min-height="100vh"
        data-form-id="179529"
      ></div>
    </div>
  );
};

export default signup;