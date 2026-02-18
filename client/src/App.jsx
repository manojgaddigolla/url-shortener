import { Route, Routes, BrowserRouter } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    // 3. Wrap the entire application with BrowserRouter
    // This component enables routing capabilities for the entire app.
    <BrowserRouter>
      {/* A Navbar component would typically go here, outside the Routes,
          so it appears on every page. We'll add this later. */}
      <div className="container">
        {/* 4. Define the routes within the Routes component */}
        {/* The Routes component looks through its children <Route>s to find
            the best match and renders that route's component. */}
        <Routes>
          {/* 5. Define each individual route */}
          {/* Each Route maps a URL path to a specific component. */}
          
          {/* Route for the Home page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Route for the Login page */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Route for the Register page */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Route for the User Dashboard page */}
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;