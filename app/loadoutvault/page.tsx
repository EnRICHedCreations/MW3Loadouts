import { supabase, Loadout } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import { LoadoutGrid } from "@/components/LoadoutGrid";
import styles from "./page.module.css";

export const revalidate = 0;

async function getLoadouts(): Promise<Loadout[]> {
  const { data, error } = await supabase.from("loadouts").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}

export default async function VaultPage() {
  const loadouts = await getLoadouts();
  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav page="vault" />
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div className={styles.mainLabel}><span className={styles.labelDot}>▶</span> COMMUNITY BUILDS</div>
          <h1 className={styles.mainTitle}>LOADOUT VAULT</h1>
          <p className={styles.mainSub}>{loadouts.length} OPERATOR BUILDS · MODERN WARFARE III</p>
        </div>
        <div className={styles.mainDivider} />
        <div className={styles.content}>
          <LoadoutGrid loadouts={loadouts} />
        </div>
      </main>
      <footer className={styles.footer}>
        <span>LOADOUT VAULT · MW3</span><span>·</span><span>NOT AFFILIATED WITH ACTIVISION</span>
      </footer>
    </div>
  );
}
