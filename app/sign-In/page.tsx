import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignIn from "../components/sign-in";

export default async function SignInPage() {
  const user = await currentUser();
  if (user) {
    redirect("/dashboard");
  }

  return <SignIn />;
}
