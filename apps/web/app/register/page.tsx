import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Register — PokéStore" };

export default function RegisterPage() {
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <RegisterForm />
      <p className="text-sm text-muted-foreground text-center mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
