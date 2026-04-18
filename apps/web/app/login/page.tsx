import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign In — PokéStore" };

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>
      <LoginForm />
      <p className="text-sm text-muted-foreground text-center mt-4">
        No account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
