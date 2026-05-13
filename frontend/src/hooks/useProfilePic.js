import { useState } from "react";
import axios from "axios";

export const useProfilePic = () => {
  const [uploading, setUploading] = useState(false);

  const uploadProfilePic = async (file) => {
    setUploading(true);
    try {
      // Convert file to base64
      const base64 = await convertToBase64(file);

      // Send to your backend
      const res = await axios.put("/api/upload/profile-pic", {
        profilePic: base64,
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      return res.data.profilePic; // returns the cloudinary URL
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadProfilePic, uploading };
};

// Helper: convert file to base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
};