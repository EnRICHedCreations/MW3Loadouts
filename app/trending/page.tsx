import Link from "next/link";
import { supabase, Loadout } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import { LoadoutCard } from "./LoadoutCard";
import styles from "./trending.module.css";

export const revalidate = 3600;

async function getTrending() {
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: today } = await supabase
    .from("loadouts").select("*")
    .gte("created_at", oneDayAgo.toISOString())
    .order("likes", { ascending: false }).limit(3);

  const { data: week } = await supabase
    .from("loadouts").select("*")
    .gte("created_at", oneWeekAgo.toISOString())
    .order("likes", { ascending: false }).limit(10);

  const { data: allTime } = await supabase
    .from("loadouts").select("*")
    .order("views", { ascending: false }).limit(5);

  return { today: today || [], week: week || [], allTime: allTime || [] };
}

export default async function TrendingPage() {
  const { today, week, allTime } = await getTrending();

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav page="trending" />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}><span className={styles.labelDot}>▶</span> COMMUNITY</div>
          <h1 className={styles.pageTitle}>TRENDING</h1>
          <p className={styles.pageSub}>LOADOUTS GAINING MOMENTUM RIGHT NOW</p>
        </div>
        <div className={styles.headerDivider} />

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
