import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase, Loadout, Profile } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import { ProfileShareButton } from "./ProfileShareButton";
import { FollowButton } from "@/components/FollowButton";
import styles from "./profile.module.css";

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

async function getProfile(username: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("username", decodeURIComponent(username)).maybeSingle();
  if (error || !data) return null;
  return data;
}

async function getLoadoutsByUser(userId: string): Promise<Loadout[]> {
  const { data } = await supabase.from("loadouts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}

async function getFollowerCount(userId: string): Promise<number> {
  const { data } = await supabase.rpc("get_follower_count", { p_user_id: userId });
  return data ?? 0;
}

async function getFollowingCount(userId: string): Promise<number> {
  const { data } = await supabase.rpc("get_following_count", { p_user_id: userId });
  return data ?? 0;
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const [loadouts, followerCount, followingCount] = await Promise.all([
    getLoadoutsByUser(profile.id),
    getFollowerCount(profile.id),
    getFollowingCount(profile.id),
  ]);

  const totalLikes = loadouts.reduce((sum, l) => sum + (l.likes ?? 0), 0);
  const totalViews = loadouts.reduce((sum, l) => sum + (l.views ?? 0), 0);
  const topClass = loadouts.length > 0
    ? Object.entries(loadouts.reduce((acc, l) => { acc[l.weapon_class] = (acc[l.weapon_class] || 0) + 1; return acc; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />

      <main className={styles.main}>
        <div className={styles.profileHeader}>
          <div className={styles.profileHeaderInner}>
            <div className={styles.avatarBlock}>
              <div className={styles.avatar}>{profile.username.slice(0, 2).toUpperCase()}</div>
              <div className={styles.onlineRing} />
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileLabel}><span className={styles.labelDot}>▶</span> OPERATOR PROFILE</div>
              <h1 className={styles.profileUsername}>{profile.username}</h1>
              <div className={styles.profileMeta}>
                <span className={styles.metaItem}><span className={styles.metaDot}>◆</span>MEMBER SINCE {memberSince.toUpperCase()}</span>
                <span className={styles.metaItem}><span className={styles.metaDot}>◆</span>{followerCount} FOLLOWERS</span>
                <span className={styles.metaItem}><span className={styles.metaDot}>◆</span>{followingCount} FOLLOWING</span>
              </div>
              <div className={styles.profileActions}>
                <FollowButton
                  targetUserId={profile.id}
                  targetUsername={profile.username}
                  initialFollowers={followerCount}
                />
              </div>
            </div>
            <ProfileShareButton username={profile.username} />
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}><span className={styles.statValue}>{loadouts.length}</span><span className={styles.statLabel}>LOADOUTS</span></div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}><span className={styles.statValue}>{totalLikes}</span><span className={styles.statLabel}>TOTAL LIKES</span></div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}><span className={styles.statValue}>{totalViews}</span><span className={styles.statLabel}>TOTAL VIEWS</span></div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: WEAPON_CLASS_COLORS[topClass ?? ""] || "var(--green-primary)" }}>{topClass ?? "—"}</span>
              <span className={styles.statLabel}>MAIN CLASS</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}><span className={styles.statValue}>{followerCount}</span><span className={styles.statLabel}>FOLLOWERS</span></div>
          </div>
          <div className={styles.headerDividerBottom} />
        </div>

        <div className={styles.content}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelDot}>▶</span>
            {loadouts.length === 0 ? "NO LOADOUTS SUBMITTED YET" : `${loadouts.length} ${loadouts.length === 1 ? "LOADOUT" : "LOADOUTS"}`}
          </div>

          {loadouts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>◈</div>
              <p className={styles.emptyTitle}>NO BUILDS YET</p>
              <p className={styles.emptyText}>This operator hasn&apos;t shared any loadouts yet.</p>
              <Link href="/loadoutvault" className={styles.browseBtn}>BROWSE OTHER LOADOUTS</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {loadouts.map((loadout) => (
                <Link key={loadout.id} href={`/loadout/${loadout.id}`} className={styles.card}>
                  <div className={styles.cardImage}>
                    {loadout.image_url ? (
                      <Image src={loadout.image_url} alt={loadout.title} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div className={styles.cardImageFallback}><span>NO SCREENSHOT</span></div>
                    )}
                    <div className={styles.weaponBadge} style={{ borderColor: WEAPON_CLASS_COLORS[loadout.weapon_class] || "var(--green-primary)", color: WEAPON_CLASS_COLORS[loadout.weapon_class] || "var(--green-primary)" }}>
                      {loadout.weapon_class}
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{loadout.title}</h2>
                    {loadout.description && <p className={styles.cardDesc}>{loadout.description}</p>}
                    <div className={styles.cardMeta}>
                      <span className={styles.cardDate}>{new Date(loadout.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <div className={styles.cardStats}>
                        <span className={styles.statBadge}>❤ {loadout.likes ?? 0}</span>
                        <span className={styles.statBadge}>◉ {loadout.views ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
