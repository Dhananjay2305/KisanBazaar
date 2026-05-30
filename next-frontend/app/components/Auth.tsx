"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // You can attach additional metadata if you want default user roles, etc.
        data: {
          role: "user", // Defaulting to simple 'user' role
        },
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Check your email for the confirmation link!" });
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Logged in successfully!" });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage({ type: "success", text: "Logged out successfully!" });
  };

  if (user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto mt-10 text-center">
        <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
        <p className="text-sm text-gray-600 mb-4">{user.email}</p>
        <p className="text-xs text-blue-500 mb-6 font-mono bg-blue-50 px-2 py-1 rounded inline-block">Role: {user.user_metadata?.role || "user"}</p>
        <br/>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Supabase Auth</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        <div className="flex space-x-3 pt-2">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none transition disabled:opacity-50"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
