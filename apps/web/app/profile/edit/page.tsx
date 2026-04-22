import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { getEditData } from "@/lib/queries/profile";
import { getXPInfo } from "@/lib/services/xp";
import { getOrCreateProfile } from "@/lib/services/profile";
import { EditProfileForm } from "./EditProfileForm";

export const metadata = { title: "Edit profile — PokéStore" };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id as string;

  const [{ badges, inventory }, xpInfo] = await Promise.all([
    getEditData(userId),
    getXPInfo(userId),
  ]);

  const profile = await getOrCreateProfile(userId);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground/80">Edit</span>
      </nav>

      <h1 className="text-2xl font-bold mb-8">Edit profile</h1>

      <EditProfileForm
        userId={userId}
        level={xpInfo.level}
        avatarId={profile.avatarId}
        themeId={profile.themeId}
        bio={profile.bio}
        earnedBadges={badges as any}
        showcaseIds={profile.showcase.map((s) => s.userBadgeId)}
        featuredIds={profile.featured.map((f) => f.userCardId)}
        inventory={inventory as any}
      />
    </div>
  );
}
