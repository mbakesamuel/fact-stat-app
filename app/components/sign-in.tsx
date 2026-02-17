"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@clerk/nextjs";
import { Key } from "lucide-react";
import { useState } from "react";
import { Spinner } from "../components/spinner";

export default function SignIn() {
  const { signIn, setActive } = useSignIn();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn?.create({
        identifier: username,
        password,
      });
      if (result?.status === "complete") {
        // activate the session
        await setActive?.({ session: result.createdSessionId });
        // redirect to dashboard or home
        window.location.href = "/dashboard";
      } else {
        console.log(result);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-[90vw] md:max-w-sm space-y-4 "
      >
        <h1 className="text-xl font-bold text-center">Sign In</h1>

        <div className="space-y-2">
          <Label htmlFor="trans_date">User Name</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="border-slate-200 w-full rounded px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-slate-200 w-full rounded px-3 py-2"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex justify-center items-center">
          <Button
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-600 text-white"
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Login
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
