"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "maryam@gmail.com" && password === "maryam") {
      localStorage.setItem("isLoggedIn", "true");

      // ✅ Show success message
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome to the Admin Dashboard!",
        showConfirmButton: false,
        timer: 2000, // Auto-close after 2 seconds
      });

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid Credentials",
        text: "Please check your email and password!",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
      {/* ✅ Welcome Text & Link */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Welcome to Admin Panel</h1>
      </div>

      {/* ✅ Login Form */}
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-lg w-96 text-black"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-400 rounded focus:outline-none focus:border-black"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-400 rounded focus:outline-none focus:border-black"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-all"
        >
          Login
        </button>
      </form>
    </div>
  );
}