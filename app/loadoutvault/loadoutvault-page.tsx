import Link from "next/link";
import { supabase, Loadout } from "@/lib/supabase";
import { LoadoutGrid } from "@/components/LoadoutGrid";
import styles from "./page.module.css";

export const revalidate = 0;

async function getLoadouts(): Promise<Loadout[]> {
  const { data, error } = await supabase
    .from("loadouts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching loadouts:", error);
    return [];
  }
  return data || [];
}

export default async function Home() {
  const loadouts = await getLoadouts();

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logoBlock} style={{ textDecoration: "none" }}>
            <div className={styles.logoEyebrow}>CALL OF DUTY: MODERN WARFARE III</div>
            <h1 className={styles.logoTitle}>LOADOUT VAULT</h1>
            <div className={styles.logoSub}>BUILT BY RUSH GAMBINO</div>
          </Link>
          <div className={styles.headerActions}>
            <div className={styles.statPill}>
              <span className={styles.statNum}>{loadouts.length}</span>
              <span className={styles.statLabel}>LOADOUTS</span>
            </div>
            <Link href="/submit" className={styles.submitBtn}>
              <span className={styles.submitIcon}>+</span>
              SUBMIT LOADOUT
            </Link>
          </div>
        </div>
        <div className={styles.headerDivider} />
      </header>

      <main className={styles.main}>
        <LoadoutGrid loadouts={loadouts} />
      </main>

      <footer className={styles.footer}>
        <span>LOADOUT VAULT</span>
        <span>·</span>
        <span>COMMUNITY RESOURCE</span>
        <span>·</span>
        <span>NOT AFFILIATED WITH ACTIVISION</span>
      </footer>
    </div>
  );
}
