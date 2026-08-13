import { Route, Routes, BrowserRouter } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import ShortenPage from "./pages/ShortenPage";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
        <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#334155', color: '#fff', borderRadius: '12px' } }} />
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shorten" element={<ShortenPage />} />
            <Route path="/dashboard"
              element={
                <>
                  <SignedIn>
                    <DashboardPage />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
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