import { Metadata } from "next";

import WelcomeBoard from "./WelcomeBoard";

export const metadata: Metadata = {
  title: "Home | Zento",
  description: "Welcome to Zento — your back-office dashboard",
};

export default function RootPage() {
  return <WelcomeBoard />;
}
