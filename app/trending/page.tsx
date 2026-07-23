import Link from "next/link";
import Image from "next/image";
import { supabase, Loadout } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import styles from "./trending.module.css";

export const revalidate = 3600; // Rebuild hourly

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

async function getTrending() {
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Hot today — most likes in last 24h
  const { data: today } = await supabase
    .from("loadouts")
    .select("*")
    .gte("created_at", oneDayAgo.toISOString())
    .order("likes", { ascending: false })
    .limit(3);

  // Hot this week
  const { data: week } = await supabase
    .from("loadouts")
    .select("*")
    .gte("created_at", oneWeekAgo.toISOString())
    .order("likes", { ascending: false })
    .limit(10);

  // All time most viewed
  const { data: allTime } = await supabase
    .from("loadouts")
    .select("*")
    .order("views", { ascending: false })
    .limit(5);

  return {
    today: today || [],
    week: week || [],
    allTime: allTime || [],
  };
}

function LoadoutCard({ loadout, rank }: { loadout: Loadout; rank?: number }) {
  return (
    <Link href={`/loadout/${loadout.id}`} className={styles.card}>
      {rank !== undefined && <div className={styles.rank}>#{rank + 1}</div>}
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
        <h3 className={styles.cardTitle}>{loadout.title}</h3>
        <div className={styles.cardMeta}>
          <Link href={`/profile/${encodeURIComponent(loadout.author)}`} className={styles.cardAuthor} onClick={(e) => e.stopPropagation()}>
            <span className={styles.authorDot}>◆</span>{loadout.author}
          </Link>
          <div className={styles.cardStats}>
            <span>❤ {loadout.likes ?? 0}</span>
            <span>◉ {loadout.views ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function TrendingPage() {
  const { today, week, allTime } = await getTrending();

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}><span className={styles.labelDot}>▶</span> COMMUNITY</div>
          <h1 className={styles.pageTitle}>TRENDING</h1>
          <p className={styles.pageSub}>LOADOUTS GAINING MOMENTUM RIGHT NOW</p>
        </div>
        <div className={styles.headerDivider} />

        {/* Hot today */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔥 HOT TODAY</h2>
            <span className={styles.sectionSub}>Most liked in the last 24 hours</span>
          </div>
          {today.length === 0 ? (
            <p className={styles.empty}>No new loadouts in the last 24 hours.</p>
          ) : (
            <div className={styles.gridLarge}>
              {today.map((l, i) => <LoadoutCard key={l.id} loadout={l} rank={i} />)}
            </div>
          )}
        </section>

        {/* Hot this week */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📈 THIS WEEK</h2>
            <span className={styles.sectionSub}>Top loadouts submitted in the last 7 days</span>
          </div>
          {week.length === 0 ? (
            <p className={styles.empty}>No loadouts this week yet.</p>
          ) : (
            <div className={styles.grid}>
              {week.map((l, i) => <LoadoutCard key={l.id} loadout={l} rank={i} />)}
            </div>
          )}
        </section>

        {/* All time most viewed */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>◉ MOST VIEWED ALL TIME</h2>
            <span className={styles.sectionSub}>The builds everyone keeps coming back to</span>
          </div>
          <div className={styles.listView}>
            {allTime.map((l, i) => (
              <Link key={l.id} href={`/loadout/${l.id}`} className={styles.listItem}>
                <span className={styles.listRank}>#{i + 1}</span>
                <div className={styles.listInfo}>
                  <span className={styles.listTitle}>{l.title}</span>
                  <span className={styles.listAuthor}>by {l.author} · {l.weapon_class}</span>
                </div>
                <div className={styles.listStats}>
                  <span>❤ {l.likes ?? 0}</span>
                  <span>◉ {l.views ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
