"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-24 items-center justify-center min-h-screen bg-linear-to-br from-green-100 via-white to-green-50">
      <Image
        src="/images/cdclogo.png"
        alt="App Logo"
        width={100}
        height={100}
      />

      <div className="flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="flex flex-col text-2xl md:text-8xl font-bold">
          Group Rubber Statistics
        </h1>
        <h2 className="font-bold text-lg md:text-4xl italic underline text-emerald-500">
          Application
        </h2>
      </div>

      <button
        className="py-2 px-4 rounded-lg hover:bg-green-600 bg-green-500 text-white font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        onClick={() => router.push("/dashboard")}
      >
        sign in
      </button>
    </div>
  );
}
