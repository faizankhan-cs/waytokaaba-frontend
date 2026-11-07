import { Suspense } from "react";
import { LogoMark } from "@/components/layout/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark className="h-16 w-auto" />
          <h1 className="mt-4 font-display text-3xl text-brand-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-500">Manage packages, hotels and customer inquiries.</p>
        </div>
        <Suspense fallback={<div className="card h-72 animate-pulse" />}>
          {searchParams.then((sp) => (
            <LoginForm next={typeof sp.next === "string" ? sp.next : ""} expired={sp.expired === "1"} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
