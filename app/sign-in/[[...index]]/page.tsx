import SignIn from "@/app/components/sign-in";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const user = await currentUser();
  if (user) {
    redirect("/dashboard");
  }

  return <SignIn />;
}
