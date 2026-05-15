import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import Alert from "./components/Alert";

import ProtectedRoute from "./components/ProtectedRoute";

/* PAGES */
import Home from "./pages/Home";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateQuiz from "./pages/CreateQuiz";
import AddQuestions from "./pages/AddQuestions";
import JoinQuiz from "./pages/JoinQuiz";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";
import ManageQuizzes from "./pages/ManageQuizzes";
import ViewResults from "./pages/ViewResults";
import ProfileSettings from "./pages/ProfileSettings";
import ThankYou from "./pages/ThankYou";
import DashboardLayout from "./components/DashboardLayout";

/* STYLES */
import "./styles/theme.css";
import "./styles/global.css";

export default function App() {
  return (
    <AuthProvider>

      {/* ALERT PROVIDER */}
      <AlertProvider>

        <BrowserRouter>

          <Routes>

            {/* ================= PUBLIC ROUTES ================= */}

            <Route path="/" element={<Home />} />

            <Route path="/join" element={<JoinQuiz />} />

            <Route
              path="/quiz/:attemptId"
              element={<QuizAttempt />}
            />

            <Route path="/result" element={<QuizResult />} />

            <Route path="/thank-you" element={<ThankYou />} />


            {/* ================= ORGANIZER ROUTES ================= */}

            <Route path="/organizer/login" element={<OrganizerLogin />} />

            <Route
              path="/organizer/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<OrganizerDashboard />} />
                      <Route path="create" element={<CreateQuiz />} />
                      <Route path="add-questions/:quizId" element={<AddQuestions />} />
                      <Route path="quizzes" element={<ManageQuizzes />} />
                      <Route path="results" element={<ViewResults />} />
                      <Route path="profile" element={<ProfileSettings />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />


            {/* ================= 404 FALLBACK ================= */}

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </BrowserRouter>


        {/* GLOBAL ALERT */}
        <Alert />

      </AlertProvider>

    </AuthProvider>
  );
}