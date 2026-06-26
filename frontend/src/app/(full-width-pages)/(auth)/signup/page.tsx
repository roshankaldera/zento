import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error 404 | Zento",
  description:
    "This is Error 404 page for Zento",
};
export default function SignUp() {
  return <SignUpForm />;
}
