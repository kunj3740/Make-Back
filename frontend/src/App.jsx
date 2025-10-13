import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useMatch } from "react-router-dom";
import { Signup } from './pages/Signup';
import { Signin } from './pages/Signin';
import LandingPage from "./pages/LandingPage";
import AppBar from "./components/AppBar";
import ProjectManager from "./pages/MyProjects";
import { Editor } from "./pages/Editor";
import { Project } from "./pages/Project";
import ReactPlayground from "./pages/ReactPlayground";
import { GitHubCallback } from "./components/GitHubCallback ";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

function App() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  console.log(token)
  const matchProjectDetail = useMatch("/projects/:id/editor");

  const hideAppBar =
    location.pathname === "/signup" ||
    location.pathname === "/signin" ||
    matchProjectDetail ||
    location.pathname === "/auth/github/callback";

  return (
    <div>
      {!hideAppBar && <AppBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />

        {/* Protected Routes */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <ReactPlayground />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/editor"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />

        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
