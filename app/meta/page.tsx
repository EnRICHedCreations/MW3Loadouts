import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import styles from "./meta.module.css";

export const revalidate = 3600;

const CLASS_ICONS: Record<string, string> = {
  Assault: "🟢", SMG: "🟠", Sniper: "🟡", LMG: "🔴",
  Shotgun: "🟣", Marksman: "🔵", Handgun: "🩵", Launcher: "🟤",
};

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

const ALL_CLASSES = ["Assault","SMG","Sniper","LMG","Shotgun","Marksman","Handgun","Launcher"];

async function getMetaData() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: thisWeek } = await supabase
    .from("loadouts")
    .select("*")
    .gte("created_at", oneWeekAgo.toISOString());

  const { data: allTime } = await supabase
    .from("loadouts")
    .select("weapon_class, likes");

  const { data: topOperators } = await supabase
    .from("loadouts")
    .select("author, likes")
    .gte("created_at", oneWeekAgo.toISOString());

  return { thisWeek: thisWeek || [], allTime: allTime || [], topOperators: topOperators || [] };
}

export default async function MetaPage() {
  const { thisWeek, allTime, topOperators } = await getMetaData();

  const weeklyClass = thisWeek.reduce((acc, l) => {
    if (!acc[l.weapon_class]) acc[l.weapon_class] = { count: 0, likes: 0, views: 0, loadouts: [] };
    acc[l.weapon_class].count++;
    acc[l.weapon_class].likes += l.likes ?? 0;
    acc[l.weapon_class].views += l.views ?? 0;
    acc[l.weapon_class].loadouts.push(l);
    return acc;
  }, {} as Record<string, { count: number; likes: number; views: number; loadouts: typeof thisWeek }>);

  const allTimeClass = allTime.reduce((acc, l) => {
    acc[l.weapon_class] = (acc[l.weapon_class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedWeekly = ALL_CLASSES
    .map((cls) => ({ cls, ...(weeklyClass[cls] || { count: 0, likes: 0, views: 0, loadouts: [] }) }))
    .sort((a, b) => b.count - a.count);

  const maxCount = sortedWeekly[0]?.count || 1;
  const dominantClass = sortedWeekly[0];

  // Top operators this week by likes
  const operatorMap = topOperators.reduce((acc, l) => {
    acc[l.author] = (acc[l.author] || 0) + (l.likes ?? 0);
    return acc;
  }, {} as Record<string, number>);
  const topOps = Object.entries(operatorMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const weekLabel = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}><span className={styles.labelDot}>▶</span> WEEKLY REPORT</div>
          <h1 className={styles.pageTitle}>META REPORT</h1>
          <p className={styles.pageSub}>WEEK OF {weekLabel.toUpperCase()} · {thisWeek.length} BUILDS SUBMITTED</p>
        </div>
        <div className={styles.headerDivider} />

        <div className={styles.layout}>
          <div className={styles.mainCol}>

            {/* Dominant class hero */}
            {dominantClass && dominantClass.count > 0 && (
              <div className={styles.dominantCard} style={{ borderColor: WEAPON_CLASS_COLORS[dominantClass.cls] || "var(--green-primary)" }}>
                <div className={styles.dominantLabel}>
                  <span className={styles.labelDot}>▶</span> DOMINANT CLASS THIS WEEK
                </div>
                <div className={styles.dominantInner}>
                  <div className={styles.dominantIcon}>{CLASS_ICONS[dominantClass.cls]}</div>
                  <div>
                    <div className={styles.dominantClass} style={{ color: WEAPON_CLASS_COLORS[dominantClass.cls] }}>
                      {dominantClass.cls.toUpperCase()}
                    </div>
                    <div className={styles.dominantStats}>
                      {dominantClass.count} builds &nbsp;·&nbsp; ❤ {dominantClass.likes} likes &nbsp;·&nbsp; ◉ {dominantClass.views} views
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Class breakdown bars */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.panelDot}>▶</span> CLASS BREAKDOWN — THIS WEEK</div>
              <div className={styles.panelBody}>
                {sortedWeekly.map(({ cls, count, likes }) => {
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={cls} className={styles.classRow}>
                      <span className={styles.classIcon}>{CLASS_ICONS[cls]}</span>
                      <span className={styles.className}>{cls}</span>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${pct}%`, background: WEAPON_CLASS_COLORS[cls] || "var(--green-primary)" }}
                        />
                      </div>
                      <span className={styles.classCount}>{count} builds</span>
                      <span className={styles.classLikes}>❤ {likes}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All time breakdown */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.panelDot}>▶</span> ALL TIME CLASS DISTRIBUTION</div>
              <div className={styles.panelBody}>
                {ALL_CLASSES
                  .map((cls) => ({ cls, count: allTimeClass[cls] || 0 }))
                  .sort((a, b) => b.count - a.count)
                  .map(({ cls, count }) => {
                    const total = Object.values(allTimeClass).reduce((s, v) => s + v, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={cls} className={styles.classRow}>
                        <span className={styles.classIcon}>{CLASS_ICONS[cls]}</span>
                        <span className={styles.className}>{cls}</span>
                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{ width: `${pct}%`, background: WEAPON_CLASS_COLORS[cls] || "var(--green-primary)" }} />
                        </div>
                        <span className={styles.classCount}>{count} builds</span>
                        <span className={styles.classLikes}>{pct}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sideCol}>
            {/* Top operators this week */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.panelDot}>▶</span> TOP OPERATORS THIS WEEK</div>
              <div className={styles.panelBody}>
                {topOps.length === 0 ? (
                  <p className={styles.empty}>No data yet.</p>
                ) : topOps.map(([author, likes], i) => (
                  <div key={author} className={styles.opRow}>
                    <span className={styles.opRank}>{i + 1}</span>
                    <Link href={`/profile/${encodeURIComponent(author)}`} className={styles.opName}>{author}</Link>
                    <span className={styles.opLikes}>❤ {likes}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.panelDot}>▶</span> WEEK AT A GLANCE</div>
              <div className={styles.panelBody}>
                <div className={styles.glanceRow}>
                  <span className={styles.glanceLabel}>BUILDS THIS WEEK</span>
                  <span className={styles.glanceValue}>{thisWeek.length}</span>
                </div>
                <div className={styles.glanceRow}>
                  <span className={styles.glanceLabel}>TOTAL LIKES THIS WEEK</span>
                  <span className={styles.glanceValue}>{thisWeek.reduce((s, l) => s + (l.likes ?? 0), 0)}</span>
                </div>
                <div className={styles.glanceRow}>
                  <span className={styles.glanceLabel}>CLASSES REPRESENTED</span>
                  <span className={styles.glanceValue}>{Object.keys(weeklyClass).length} / 8</span>
                </div>
                <div className={styles.glanceRow}>
                  <span className={styles.glanceLabel}>UNIQUE OPERATORS</span>
                  <span className={styles.glanceValue}>{new Set(thisWeek.map((l) => l.author)).size}</span>
                </div>
              </div>
            </div>

            <Link href="/loadoutvault" className={styles.browseBtn}>◈ BROWSE ALL LOADOUTS</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
