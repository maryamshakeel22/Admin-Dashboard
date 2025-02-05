"use client";

import { useRouter } from "next/navigation";

export default function AdminLandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center text-center items-center h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Admin Panel</h1>
      <p className="text-lg text-gray-400 mb-6">
        Manage orders, products, and users with ease.
      </p>

      {/* ✅ Go to Login Button */}
      <button
        onClick={() => router.push("/admin")}
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
      >
        Go to Admin Login
      </button>
    </div>
  );
}