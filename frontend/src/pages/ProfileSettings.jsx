import { useState, useEffect } from "react";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import "../styles/profile.css";

export default function ProfileSettings() {

  const { showAlert } = useAlert();

  const [profile, setProfile] = useState({
    name: "",
    email: ""
  });

  const [loading, setLoading] = useState(true);



  /* ================= LOAD PROFILE ================= */

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const res = await api.get("/auth/profile");

        setProfile(res.data);

      } catch (err) {

        const message =
          err.response?.data?.message ||
          "Failed to load profile";

        showAlert(message, "error");

      } finally {

        setLoading(false);
      }
    };

    loadProfile();

  }, [showAlert]);



  /* ================= CHANGE ================= */

  const handleChange = (e) => {

    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };



  /* ================= SAVE ================= */

  const handleSave = async () => {

    /* VALIDATION */

    if (!profile.name.trim()) {
      showAlert("Name cannot be empty", "warning");
      return;
    }

    if (!profile.email.includes("@")) {
      showAlert("Enter a valid email", "warning");
      return;
    }


    try {

      await api.put("/auth/profile", {
        name: profile.name.trim(),
        email: profile.email.trim()
      });

      showAlert("Profile updated successfully", "success");

    } catch (err) {

      const message =
        err.response?.data?.message ||
        "Profile update failed";

      showAlert(message, "error");
    }
  };



  /* ================= UI ================= */

  if (loading) {
    return (
      <p className="loading-text">
        Loading profile...
      </p>
    );
  }



  return (
    <div className="profile-container">

      <h2>Profile Settings</h2>


      <div className="profile-card">

        <label>Name</label>

        <input
          name="name"
          value={profile.name}
          onChange={handleChange}
        />


        <label>Email</label>

        <input
          name="email"
          value={profile.email}
          onChange={handleChange}
        />


        <button onClick={handleSave}>
          Save Changes
        </button>

      </div>

    </div>
  );
}
