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

            <Route
              path="/organizer/login"
              element={<OrganizerLogin />}
            />


            <Route
              path="/organizer/dashboard"
              element={
                <ProtectedRoute>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />


            <Route
              path="/organizer/create"
              element={
                <ProtectedRoute>
                  <CreateQuiz />
                </ProtectedRoute>
              }
            />


            <Route
              path="/organizer/add-questions/:quizId"
              element={
                <ProtectedRoute>
                  <AddQuestions />
                </ProtectedRoute>
              }
            />


            <Route
              path="/organizer/quizzes"
              element={
                <ProtectedRoute>
                  <ManageQuizzes />
                </ProtectedRoute>
              }
            />


            <Route
              path="/organizer/results"
              element={
                <ProtectedRoute>
                  <ViewResults />
                </ProtectedRoute>
              }
            />


            <Route
              path="/organizer/profile"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
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