import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useMatch } from "react-router-dom"; // ✅ correct
import { Signup } from './pages/Signup';
import { Signin } from './pages/Signin';
import LandingPage from "./pages/LandingPage";
import AppBar from "./components/AppBar";
import ProjectManager from "./pages/MyProjects";
import { Editor } from "./pages/Editor";
import { Project } from "./pages/Project";


function App() {
  const location = useLocation()
  const matchProjectDetail = useMatch("/projects/:id/editor");

  const hideAppBar = location.pathname === "/signup" || location.pathname === "/signin" 
                    || matchProjectDetail
  return (
    <>
      <div className="">
        <div>
          {!hideAppBar && <AppBar />}
        </div>
       
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/projects" element={<ProjectManager />} />
            <Route path="/projects/:projectId" element={<Project />} />
            <Route path="/projects/:id/editor" element={<Editor />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
          </Routes>
       
      </div>
    </>
  )
}

export default App
