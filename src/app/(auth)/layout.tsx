import { ReactNode } from "react";
import AuthWrapper from "@/app/components/auth/AuthWrapper";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthWrapper>{children}</AuthWrapper>;
}