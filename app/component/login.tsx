"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        // Activate the session
        await setActive({ session: result.createdSessionId });
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Handle MFA or other steps if enabled
        console.log(result);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Something went wrong");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-green-100 via-white to-green-50">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-md w-full">
        {/* Branding */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="App Logo"
            className="w-20 h-20 rounded-full shadow-md"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Please sign in to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
