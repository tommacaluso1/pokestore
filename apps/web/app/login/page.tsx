import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign In — PokéStore" };

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Poké</span>Store
        </Link>
        <p className="text-muted-foreground text-sm mt-2">Sign in to your account</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <LoginForm />
        <p className="text-sm text-muted-foreground text-center mt-5">
          No account?{" "}
          <Link href="/register" className="text-foreground font-medium hover:text-primary transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
