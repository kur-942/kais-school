import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthForm } from "./components/auth/AuthForm";
import { Home } from "./pages/Home";
import { CourseView } from "./pages/CourseView";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Tasks } from "./pages/Tasks";
import { Saved } from "./pages/Saved";
import { Footer } from "./components/layout/Footer";
import { ExamNotifications } from "./components/notifications/ExamNotifications";
import { Tools } from "./pages/Tools";
import { Calculator } from "./pages/tools/Calculator";
import { FunctionEvaluator } from "./pages/tools/FunctionEvaluator";
import { GraphPlotter } from "./pages/tools/GraphPlotter";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Routes>
            <Route path="/login" element={<AuthForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseId"
              element={
                <ProtectedRoute>
                  <CourseView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <Saved />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools"
              element={
                <ProtectedRoute>
                  <Tools />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools/calculator"
              element={
                <ProtectedRoute>
                  <Calculator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools/graph"
              element={
                <ProtectedRoute>
                  <GraphPlotter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools/evaluator"
              element={
                <ProtectedRoute>
                  <FunctionEvaluator />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
          <ExamNotifications />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
