"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

export default function HomeScreen() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

   useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex flex-col gap-24 items-center justify-center min-h-screen bg-linear-to-br from-green-100 via-white to-green-50">
      <div>
        <Image src="/images/cdclogo.png" alt="App Logo" width={100} height={100} />
      </div>
      <div>
        <h1 className="text-4xl font-bold">
          Factory Statistics{" "}
          <span className="text-6xl  font-semibold text-blue-200">
            App
          </span>{" "}
        </h1>
      </div>
      <div>
        <button className="border py-2 px-4 rounded-lg bg-green-200 border-green-500" onClick={() => router.push("/login")}>Go to Login</button>
      </div>
    </div>
  );
}
