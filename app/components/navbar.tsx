import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter"; // Adjust path if necessary

export default function Navbar() {
    const auth = usePuterStore((s) => s.auth);
    const isAuthenticated = auth?.isAuthenticated;
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = () => {
        const returnTo = location.pathname + location.search;
        navigate(`/auth?next=${encodeURIComponent(returnTo)}`);
    }

    const handleLogout = async () => {
        if (auth.signOut) await auth.signOut();
        navigate("/auth?next=/");
    };

    return (
      <nav className="flex items-center justify-between w-full px-4 py-3 shadow-lg bg-white z-30">
          <div className="flex items-center space-x-6">
              <Link to="/" className="font-bold text-lg text-primary">Re:Match</Link>
              {isAuthenticated && (
                <>
                    <Link to="/upload" className="hover:underline">Analyze Resume</Link>
                    <Link to="/wipe" className="hover:underline text-red-500">Delete All Data</Link>
                </>
              )}
          </div>
          <div>
              {!isAuthenticated ? (
                <button
                  className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary hover:text-white transition"
                  onClick={handleLogin}
                >
                    Login
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                  onClick={handleLogout}
                >
                    Logout
                </button>
              )}
          </div>
      </nav>
    );
}

