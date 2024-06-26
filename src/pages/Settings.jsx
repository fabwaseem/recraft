import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const Settings = () => {
  const [formData, setFormData] = useState({
    token: "",
  });
  const [searchParams] = useSearchParams();
  const errorType = searchParams.get("error") || null;

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const parsedData = JSON.parse(formData.token.trim());
      if (parsedData) {
        localStorage.setItem("accessToken", parsedData.accessToken);
        localStorage.setItem("accessTokenExpiresAt", parsedData.expires);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      // Display an error message to the user if needed
    }
  };

  useEffect(() => {
    if (errorType === "token") {
      toast.error("Please! add a token to generate images");
    }
    if (errorType === "expire") {
      toast.error("Token expired! add new one");
    }
  }, []);

  return (
    <div>
      <h1 className="mt-3 text-3xl  ">App Settings</h1>
      <form className="mt-5" onSubmit={handleSave}>
        <div className="relative flex-1">
          <textarea
            className=" peer block h-32 w-full rounded-lg border bg-transparent p-4 text-sm text-dark dark:border-gray-600 dark:text-white"
            min={1}
            value={formData.token}
            onChange={(e) => {
              setFormData((prev) => {
                return { ...prev, token: e.target.value };
              });
            }}
          />
          <label
            className="start-0 pointer-events-none absolute top-0 h-full truncate border border-transparent p-4 transition duration-100 ease-in-out peer-focus:-translate-y-1.5 peer-focus:text-xs peer-focus:text-gray-500
    peer-disabled:pointer-events-none
    peer-disabled:opacity-50
    peer-[:not(:placeholder-shown)]:hidden
    dark:text-white"
          >
            Token
          </label>
          <a
            href="https://app.recraft.ai/api/auth/session"
            className="mt-2 block w-max text-sm hover:text-primary"
          >
            Get token
          </a>
        </div>
        <button
          type="submit"
          className="btn btn-primary mx-auto mt-5 block  bg-primary px-12 py-4 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default Settings;
