import { getAllUsers } from "@/lib/queries/admin";
import { updateUserRole } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">{user.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
              <form action={updateUserRole.bind(null, user.id, user.role === "ADMIN" ? "CUSTOMER" : "ADMIN")}>
                <Button size="sm" variant="outline" type="submit">
                  Make {user.role === "ADMIN" ? "Customer" : "Admin"}
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
