import React from "react";
// Change BrowserRouter to HashRouter
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppContextProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgetPassword"
import VerifyOtp from "./pages/VerfiyOtp";
import ResetPassword from "./pages/ResetPassword";
import Setting from './pages/Setting'
import { EditProfile } from "./pages/Setting";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from 'react';
import { setNavigate } from './utils/navigationService';
import { useNavigate } from 'react-router-dom';


const AppRoutes = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate); // Link the hook to the service
  }, [navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" replace /> : <Signup />}
      />
      <Route path="/forget-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Fixed: replace isn't a prop for Route, it's for Navigate */}
      <Route path="/chat/:id" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
      <Route path="/EditProfile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {



  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);


  return (
    // basename is not needed with HashRouter on GH Pages usually, 
    // but you can keep it if your links include /talkapp/
    <Router>
      <AuthProvider>
        <AppContextProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#16161f",
                color: "#e8e8f0",
                border: "1px solid #2a2a3a",
                borderRadius: "12px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#22d3a0", secondary: "#16161f" },
              },
              error: {
                iconTheme: { primary: "#f87171", secondary: "#16161f" },
              },
            }}
          />
        </AppContextProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;