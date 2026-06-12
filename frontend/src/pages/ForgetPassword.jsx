import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import api from "../utils/api";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("api/auth/send-otp", {
        email,
      });

      localStorage.setItem("email", email);
      toast.success(data.message || "OTP sent successfully");
      navigate("/verify-otp");
    } catch (error) {
      console.error("API Error:", error);

      toast.error(
        error.response?.data?.message ||
        "Network error. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden h-screen flex items-center justify-center ">
      {/* Full screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
          <p className="mt-4 font-medium text-black">Sending OTP...</p>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-md p-8">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-lg bg-gray-100">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-gray-600"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <path d="M17 9a2 2 0 0 0-2-2m0 8a6 6 0 1 0-6-6l-5 5v3h3l5-5" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Forgot Password?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we'll send you a 4-digit code.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" >
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full px-3 py-2 border rounded-lg focus-visible:ring-2 focus-visible:ring-black outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading} // Disable input while loading
            />
          </div>

          <button
            type="submit"
            disabled={loading} // Prevent double-submit
            className={`inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/90 active:translate-y-px transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Processing..." : "Send OTP"}
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          <span
            onClick={() => !loading && navigate("/login")}
            className={`text-black font-medium hover:underline cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Back to login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;