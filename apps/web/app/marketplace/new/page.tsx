import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateListingForm } from "./CreateListingForm";

export const metadata = { title: "New listing — PokéStore" };

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a listing</h1>
      <CreateListingForm />
    </div>
  );
}
