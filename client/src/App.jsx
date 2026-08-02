import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Show, RedirectToSignIn } from "@clerk/react";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard"
              element={
                <>
                  <Show when="signed-in">
                    <DashboardPage />
                  </Show>
                  <Show when="signed-out">
                    <RedirectToSignIn />
                  </Show>
                </>
              } 
            />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Short.ly - Professional URL Management
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;