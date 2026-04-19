import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Register — PokéStore" };

export default function RegisterPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Poké</span>Store
        </Link>
        <p className="text-muted-foreground text-sm mt-2">Create your account</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <RegisterForm />
        <p className="text-sm text-muted-foreground text-center mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-medium hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
