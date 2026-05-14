import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from 'lucide-react'; // Using Lucide to match Signup
import logo from '../assets/image/logo1.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.username || !formData.password) {
    toast.error("Please fill in all fields");
    return;
  }

  setLoading(true);
  try {
    const { data } = await api.post("/api/auth/login", {
      username: formData.username, 
      password: formData.password,
    });

    login(data);
    toast.success(`Welcome back, ${data.name || 'User'}! 👋`);
    navigate("/");
  } catch (err) {
    console.error("Login err:", err);
    const errorMsg =
      err.response?.data?.message ||
      "Please check your credentials";
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};




  return (
    <section className="min-h-screen flex items-center justify-center p-5">
      
      {/* Full screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black" />
          <p className="mt-4 font-medium text-black">Logging in...</p>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col gap-6  google-sans">
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-1 md:gap-3 text-center">
          {/* Logo Placeholder (Matched to Signup) */}
          <div className="w-16 h-16 flex items-center justify-center ">
            <img src={logo} alt="Logo"    />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl google-sans">Log in</h1>
            <p className="text-gray-500 mb-1 text-sm">Welcome back! Please enter your details.</p>
          </div>

          {/* Toggle Tabs (Matches Signup layout) */}
          <div className="flex w-full p-1 bg-gray-100 rounded-xl border border-gray-300">
            <button className="flex-1 py-2 text-sm font-semibold text-gray-900 cursor-pointer rounded-lg bg-white  shadow-sm transition-colors text-center">
              Log in
            </button>
            <button onClick={() => navigate("/signup")} className="flex-1 py-2 text-sm font-semibold text-gray-900 cursor-pointer">
              Sign up
            </button>
          </div>
        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">username or email</label>
              <input
                type="text"
                name="username"
                required
                placeholder="Enter username or email"
                className="w-full px-4 py-2.5  bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                value={formData.username }
                onChange={handleChange}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forget-password" size="sm" className="text-sm font-semibold text-black underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5  bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit & Social Buttons */}
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center cursor-pointer justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/90 active:translate-y-px disabled:opacity-50 transition-all"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

          </div>
        </form>

        {/* Footer Link */}
        <div className="flex justify-center gap-1.5 text-sm">
          <span className="text-gray-500">Don't have an account?</span>
          <Link to="/signup" className="font-semibold text-black transition-colors underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Login;