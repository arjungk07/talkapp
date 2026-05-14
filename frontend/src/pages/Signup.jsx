import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import logo from '../assets/image/logo1.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mock validation logic
  const isMinLength = formData.username.length >= 6 || formData.password.length >= 6;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password || formData.username);

  // Fixed: name update from setForm to setFormData
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // RegisterPage.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, name, username, password } = formData;

    if (!email || !name || !username || !password) {
      return toast.error("All fields are required");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (name.trim().length < 3) {
      return toast.error("Name must be at least 3 characters");
    }

    if (username.trim().length < 3) {
      return toast.error("Username must be at least 3 characters");
    }

    if (!hasSpecialChar) {
      return toast.error("Password must contain a special character");
    }

    try {
      setLoading(true);

      const { data } = await api.post("/api/auth/register", {
        email,
        name,
        username,
        password
      });

      // ✅ Persist token so axios interceptor / auth context can use it
      localStorage.setItem("token", data.token);
      console.log("Token", data.token);

      login(data); // pass full user object to context
      toast.success(`Welcome to ChatApp, ${data.name}! 🎉`);
      navigate("/");

    } catch (err) {
      // ✅ Single unified error handler — backend always sends { message }
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);

    } finally {
      setLoading(false);
    }
  };



  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-4 py-12 md:px-8">


      {/* Full screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black" />
          <p className="mt-4 font-medium text-black">Creating account...</p>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col gap-4 google-sans">

        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Logo Placeholder */}
          <div className="w-16 h-16 flex items-center justify-center ">
            <img src={logo} alt="Logo" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Create an account</h1>

          {/* Toggle Tabs (Matches Signup layout) */}
          <div className="flex w-full p-1 bg-gray-100 rounded-xl border border-gray-300">
            <button onClick={() => navigate("/login")} className="flex-1 py-2 text-sm font-semibold text-gray-900 cursor-pointer">
              Log in
            </button>
            <button className="flex-1 py-2 text-sm font-semibold text-gray-900 cursor-pointer rounded-lg bg-white  shadow-sm transition-colors text-center">
              Sign up
            </button>
          </div>

        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit} autoComplete='off'>
          <div className="space-y-4">

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name='email'
                value={formData.email}
                required
                placeholder="Enter your email"
                className="w-full text-sm px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                onChange={handleChange}
              />
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name='name'
                value={formData.name}
                autoComplete='off'
                required
                placeholder="Enter your name"
                className="w-full text-sm  px-4 py-2.5  bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                onChange={handleChange}
              />
            </div>

            {/* userName Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name='username'
                value={formData.username}
                autoComplete='off'
                required
                placeholder="Username"
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                onChange={handleChange}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name='password'
                  value={formData.password}
                  autoComplete='off'
                  required
                  placeholder="Create a password"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
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

            {/* Password Validation UI */}
            <div className="space-y-2">
              {/* Minimum Length Requirement */}
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  className={`transition-colors ${isMinLength ? 'text-green-500' : 'text-gray-300'}`}
                />
                <p className={`text-sm transition-colors ${isMinLength ? 'text-green-700' : 'text-gray-500'}`}>
                  Must be at least 6 characters
                </p>
              </div>

              {/* Special Character Requirement */}
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  className={`transition-colors ${hasSpecialChar ? 'text-green-500' : 'text-gray-300'}`}
                />
                <p className={`text-sm transition-colors ${hasSpecialChar ? 'text-green-700' : 'text-gray-500'}`}>
                  Must contain one special character
                </p>
              </div>
            </div>
          </div>

          {/* Submit & Social Buttons */}
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/90 active:translate-y-px disabled:opacity-50 transition-all"
            >
              {loading ? "singing up..." : "Create account"}
            </button>

          </div>
        </form>

        {/* Footer Link */}
        <div className="flex justify-center gap-1.5 text-sm">
          <span className="text-gray-500">Already have an account?</span>
          <Link to="/login" className="font-semibold text-black underline underline-offset-4">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Signup;