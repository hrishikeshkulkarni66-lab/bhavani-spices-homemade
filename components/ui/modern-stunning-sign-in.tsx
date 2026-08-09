"use client" 

import * as React from "react"
import { useState } from "react";

interface User {
  name?: string;
  email: string;
  password: string;
}

const SignIn1 = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
 
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
 
  const handleAction = () => {
    setError("");

    if (isSignUp) {
      // Sign Up Validation
      if (!name || !email || !password || !confirmPassword) {
        setError("All fields are required.");
        return;
      }
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Store user in mock database (localStorage)
      const existingUsers: User[] = JSON.parse(
        localStorage.getItem("bhavani_mock_users") || "[]"
      );
      
      const userExists = existingUsers.some((u) => u.email === email.toLowerCase());
      if (userExists) {
        setError("An account with this email already exists.");
        return;
      }

      const newUser: User = { name, email: email.toLowerCase(), password };
      existingUsers.push(newUser);
      localStorage.setItem("bhavani_mock_users", JSON.stringify(existingUsers));

      alert("Sign Up successful! You can now log in with your new credentials.");
      
      // Reset registration fields and switch to Sign In
      setIsSignUp(false);
      setName("");
      setConfirmPassword("");
      setError("");
    } else {
      // Sign In Validation
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      // Check against mock database and default credentials
      const existingUsers: User[] = JSON.parse(
        localStorage.getItem("bhavani_mock_users") || "[]"
      );

      const isValidUser =
        (email.toLowerCase() === "hrishikeshkulkarni66@gmail.com" && password === "Bhavani123!") ||
        (email.toLowerCase() === "bhavani@spices.com" && password === "Bhavani123!") ||
        existingUsers.some((u) => u.email === email.toLowerCase() && u.password === password);

      if (!isValidUser) {
        setError("Invalid email or password.");
        return;
      }

      alert("Sign In successful! (Demo)");
    }
  };
 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-6 shadow-lg">
          <img src="https://hextaui.com/logo.svg" alt="HextaUI Logo" onError={(e) => {
            // Fallback logo if server is down
            (e.target as HTMLImageElement).src = "https://www.svgrepo.com/show/530661/spice.svg";
          }} />
        </div>
        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          {isSignUp ? "Create Account" : "HextaUI"}
        </h2>
        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {isSignUp && (
              <input
                placeholder="Full Name"
                type="text"
                value={name}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 animate-[fadeInDown_0.2s_ease-out]"
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setPassword(e.target.value)}
            />
            {isSignUp && (
              <input
                placeholder="Confirm Password"
                type="password"
                value={confirmPassword}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 animate-[fadeInDown_0.2s_ease-out]"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
            {error && (
              <div className="text-sm text-red-400 text-left">{error}</div>
            )}
          </div>
          <hr className="opacity-10" />
          <div>
            <button
              onClick={handleAction}
              className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm"
            >
              {isSignUp ? "Sign up" : "Sign in"}
            </button>
            {/* Google Sign In */}
            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#232526] to-[#2d2e30] rounded-full px-5 py-3 font-medium text-white shadow hover:brightness-110 transition mb-2 text-sm">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              {isSignUp ? "Sign up with Google" : "Continue with Google"}
            </button>
            <div className="w-full text-center mt-2">
              <span className="text-xs text-gray-400">
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <a
                      href="#"
                      className="underline text-white/80 hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSignUp(false);
                        setError("");
                      }}
                    >
                      Sign in here
                    </a>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <a
                      href="#"
                      className="underline text-white/80 hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSignUp(true);
                        setError("");
                      }}
                    >
                      Sign up, it&apos;s free!
                    </a>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* User count and avatars */}
      <div className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p className="text-gray-400 text-sm mb-2">
          Join <span className="font-medium text-white">thousands</span> of
          developers who are already using HextaUI.
        </p>
        <div className="flex">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/men/54.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
        </div>
      </div>
    </div>
  );
};
 
export { SignIn1 };
