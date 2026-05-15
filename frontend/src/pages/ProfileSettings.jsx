import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAlert } from "../context/AlertContext";
import { FaUser, FaEnvelope, FaSave, FaShieldAlt } from "react-icons/fa";

import "../styles/profile.css";

export default function ProfileSettings() {
  const { showAlert } = useAlert();

  const [profile, setProfile] = useState({
    name: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data);
      } catch (err) {
        showAlert(err.response?.data?.message || "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [showAlert]);

  const handleChange = (e) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!profile.name.trim()) {
      showAlert("Name cannot be empty", "warning");
      return;
    }
    if (!profile.email.includes("@")) {
      showAlert("Enter a valid email", "warning");
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/profile", {
        name: profile.name.trim(),
        email: profile.email.trim()
      });
      showAlert("Profile updated successfully", "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Profile update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-loader">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <header className="dash-top-bar">
        <div className="welcome-text">
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences.</p>
        </div>
      </header>

      <div className="profile-grid">
        {/* PROFILE CARD */}
        <div className="profile-main-card">
          <div className="card-header">
            <div className="avatar-placeholder">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="header-info">
              <h3>{profile.name}</h3>
              <p>Administrator</p>
            </div>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label><FaUser /> Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label><FaEnvelope /> Email Address</label>
              <input
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <button className="save-btn" onClick={handleSave} disabled={saving}>
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* INFO CARD */}
        <div className="profile-info-side">
          <div className="info-box blue">
            <FaShieldAlt className="info-icon" />
            <h4>Account Security</h4>
            <p>Your account is protected with secure authentication. Always use a strong password.</p>
          </div>
          
          <div className="info-box yellow">
            <FaUser className="info-icon" />
            <h4>Organizer Access</h4>
            <p>You have full access to create, manage and view results for all quizzes in this platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
