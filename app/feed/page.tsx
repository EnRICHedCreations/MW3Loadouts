import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Nav } from "@/components/Nav";
import { supabase, Loadout } from "@/lib/supabase";
import styles from "./feed.module.css";

export const revalidate = 0;

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

export default async function FeedPage() {
  // Get session server-side
  const cookieStore = cookies();
  const serverSupabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await serverSupabase.auth.getSession();

  if (!session) redirect("/login");

  const userId = session.user.id;

  // Get who this user follows
  const { data: followData } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = (followData || []).map((f) => f.following_id);

  let feedLoadouts: Loadout[] = [];
  let suggestedOperators: { id: string; username: string; count: number }[] = [];

  if (followingIds.length > 0) {
    const { data } = await supabase
      .from("loadouts")
      .select("*")
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .limit(30);
    feedLoadouts = data || [];
  }

  // Suggest popular operators the user isn't following
  const { data: popularLoadouts } = await supabase
    .from("loadouts")
    .select("user_id, author, likes")
    .not("user_id", "eq", userId);

  if (popularLoadouts) {
    const opMap = popularLoadouts.reduce((acc, l) => {
      if (followingIds.includes(l.user_id)) return acc;
      if (!acc[l.user_id]) acc[l.user_id] = { id: l.user_id, username: l.author, count: 0 };
      acc[l.user_id].count += l.likes ?? 0;
      return acc;
    }, {} as Record<string, { id: string; username: string; count: number }>);

    suggestedOperators = Object.values(opMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />

      <main className={styles.main}>
        <div className={styles.layout}>
          {/* Feed */}
          <div className={styles.feedCol}>
            <div className={styles.feedHeader}>
              <div className={styles.feedLabel}><span className={styles.labelDot}>▶</span> YOUR FEED</div>
              <h1 className={styles.feedTitle}>FOLLOWING</h1>
              {followingIds.length > 0 && (
                <p className={styles.feedSub}>LATEST FROM {followingIds.length} OPERATOR{followingIds.length !== 1 ? "S" : ""} YOU FOLLOW</p>
              )}
            </div>
            <div className={styles.headerDivider} />

            {followingIds.length === 0 ? (
              <div className={styles.emptyFeed}>
                <div className={styles.emptyIcon}>◈</div>
                <h2 className={styles.emptyTitle}>YOUR FEED IS EMPTY</h2>
                <p className={styles.emptyText}>
                  Follow operators to see their loadouts here. Browse the vault or check out suggested operators to get started.
                </p>
                <Link href="/loadoutvault" className={styles.browseBtn}>BROWSE THE VAULT</Link>
              </div>
            ) : feedLoadouts.length === 0 ? (
              <div className={styles.emptyFeed}>
                <div className={styles.emptyIcon}>◈</div>
                <h2 className={styles.emptyTitle}>NOTHING NEW YET</h2>
                <p className={styles.emptyText}>The operators you follow haven&apos;t posted any loadouts yet.</p>
                <Link href="/loadoutvault" className={styles.browseBtn}>BROWSE THE VAULT</Link>
              </div>
            ) : (
              <div className={styles.feedList}>
                {feedLoadouts.map((loadout) => (
                  <Link key={loadout.id} href={`/loadout/${loadout.id}`} className={styles.feedCard}>
                    <div className={styles.feedCardImage}>
                      {loadout.image_url ? (
                        <Image src={loadout.image_url} alt={loadout.title} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <div className={styles.feedCardImageFallback}><span>NO SCREENSHOT</span></div>
                      )}
                    </div>
                    <div className={styles.feedCardBody}>
                      <div className={styles.feedCardTop}>
                        <div className={styles.weaponBadge} style={{ borderColor: WEAPON_CLASS_COLORS[loadout.weapon_class] || "var(--green-primary)", color: WEAPON_CLASS_COLORS[loadout.weapon_class] || "var(--green-primary)" }}>
                          {loadout.weapon_class}
                        </div>
                        <span className={styles.feedCardDate}>
                          {new Date(loadout.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <h2 className={styles.feedCardTitle}>{loadout.title}</h2>
                      {loadout.description && <p className={styles.feedCardDesc}>{loadout.description}</p>}
                      <div className={styles.feedCardMeta}>
                        <Link href={`/profile/${encodeURIComponent(loadout.author)}`} className={styles.feedCardAuthor} onClick={(e) => e.stopPropagation()}>
                          <span className={styles.authorDot}>◆</span>{loadout.author}
                        </Link>
                        <div className={styles.feedCardStats}>
                          <span>❤ {loadout.likes ?? 0}</span>
                          <span>◉ {loadout.views ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={styles.sideCol}>
            {suggestedOperators.length > 0 && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}><span className={styles.panelDot}>▶</span> SUGGESTED OPERATORS</div>
                <div className={styles.panelBody}>
                  {suggestedOperators.map((op) => (
                    <div key={op.id} className={styles.suggestRow}>
                      <div className={styles.suggestAvatar}>{op.username.slice(0, 2).toUpperCase()}</div>
                      <Link href={`/profile/${encodeURIComponent(op.username)}`} className={styles.suggestName}>{op.username}</Link>
                      <Link href={`/profile/${encodeURIComponent(op.username)}`} className={styles.suggestFollow}>VIEW</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.panelDot}>▶</span> DISCOVER</div>
              <div className={styles.panelBody}>
                <Link href="/loadoutvault" className={styles.discoverLink}>◈ Browse All Loadouts</Link>
                <Link href="/trending" className={styles.discoverLink}>🔥 Trending Now</Link>
                <Link href="/meta" className={styles.discoverLink}>📊 Meta Report</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
