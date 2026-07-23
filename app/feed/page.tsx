"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import { Nav } from "@/components/Nav";
import { Loadout } from "@/lib/supabase";
import styles from "./feed.module.css";

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

export default function FeedPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [feedLoadouts, setFeedLoadouts] = useState<Loadout[]>([]);
  const [suggested, setSuggested] = useState<{ id: string; username: string }[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!user) return;

    const load = async () => {
      // Who the user follows
      const { data: followData } = await supabase
        .from("follows").select("following_id").eq("follower_id", user.id);
      const followingIds = (followData || []).map((f) => f.following_id);
      setFollowingCount(followingIds.length);

      // Feed loadouts
      if (followingIds.length > 0) {
        const { data } = await supabase
          .from("loadouts").select("*")
          .in("user_id", followingIds)
          .order("created_at", { ascending: false }).limit(30);
        setFeedLoadouts(data || []);
      }

      // Suggested operators (popular, not following, not self)
      const { data: popular } = await supabase
        .from("loadouts").select("user_id, author, likes")
        .neq("user_id", user.id);

      if (popular) {
        const opMap = popular.reduce((acc, l) => {
          if (followingIds.includes(l.user_id)) return acc;
          if (!acc[l.user_id]) acc[l.user_id] = { id: l.user_id, username: l.author, likes: 0 };
          acc[l.user_id].likes += l.likes ?? 0;
          return acc;
        }, {} as Record<string, { id: string; username: string; likes: number }>);
        setSuggested(Object.values(opMap).sort((a, b) => b.likes - a.likes).slice(0, 5));
      }

      setFetching(false);
    };

    load();
  }, [user, loading]);

  if (loading || fetching) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.scanline} />
        <Nav page="feed" />
        <main className={styles.main}>
          <div className={styles.loadingState}>
            <div className={styles.emptyIcon}>◈</div>
            <p className={styles.emptyTitle}>LOADING FEED...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav page="feed" />

      <main className={styles.main}>
        <div className={styles.layout}>
          <div className={styles.feedCol}>
            <div className={styles.feedHeader}>
              <div className={styles.feedLabel}><span className={styles.labelDot}>▶</span> YOUR FEED</div>
              <h1 className={styles.feedTitle}>FOLLOWING</h1>
              {followingCount > 0 && (
                <p className={styles.feedSub}>LATEST FROM {followingCount} OPERATOR{followingCount !== 1 ? "S" : ""} YOU FOLLOW</p>
              )}
            </div>
            <div className={styles.headerDivider} />

            {followingCount === 0 ? (
              <div className={styles.emptyFeed}>
                <div className={styles.emptyIcon}>◈</div>
                <h2 className={styles.emptyTitle}>YOUR FEED IS EMPTY</h2>
                <p className={styles.emptyText}>Follow operators to see their loadouts here.</p>
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
                        <span className={styles.feedCardAuthor}>
                          <span className={styles.authorDot}>◆</span>{loadout.author}
                        </span>
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
            {profile && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}><span className={styles.panelDot}>▶</span> MY ACCOUNT</div>
                <div className={styles.panelBody}>
                  <Link href={`/profile/${encodeURIComponent(profile.username)}`} className={styles.discoverLink}>◆ My Profile</Link>
                  <Link href="/collections" className={styles.discoverLink}>🔖 My Collections</Link>
                  <Link href="/submit" className={styles.discoverLink}>+ Submit Loadout</Link>
                </div>
              </div>
            )}

            {suggested.length > 0 && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}><span className={styles.panelDot}>▶</span> SUGGESTED OPERATORS</div>
                <div className={styles.panelBody}>
                  {suggested.map((op) => (
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
                <Link href="/collections" className={styles.discoverLink}>🔖 Collections</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
