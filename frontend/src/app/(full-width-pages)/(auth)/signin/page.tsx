import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Zento",
  description: "This is the Sign In page for Zento",
};

export default function SignIn() {
  return <SignInForm />;
}
