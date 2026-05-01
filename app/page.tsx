import Link from "next/link";
import Image from "next/image";
import { supabase, Loadout } from "@/lib/supabase";
import styles from "./page.module.css";

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

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#7ab327",
  SMG: "#d4691e",
  Sniper: "#c8a228",
  LMG: "#b83232",
  Shotgun: "#6a4faa",
  Marksman: "#2a8a7a",
  Handgun: "#5a7aaa",
  Launcher: "#aa5a2a",
};

export default async function Home() {
  const loadouts = await getLoadouts();

  return (
    <div className={styles.wrapper}>
      {/* Scanline overlay */}
      <div className={styles.scanline} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoBlock}>
            <div className={styles.logoEyebrow}>CALL OF DUTY</div>
            <h1 className={styles.logoTitle}>LOADOUT VAULT</h1>
            <div className={styles.logoSub}>MODERN WARFARE III · COMMUNITY</div>
          </div>
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

      {/* Main content */}
      <main className={styles.main}>
        {loadouts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>◈</div>
            <p className={styles.emptyTitle}>NO LOADOUTS FOUND</p>
            <p className={styles.emptyText}>Be the first operator to share your build.</p>
            <Link href="/submit" className={styles.submitBtn}>
              SUBMIT FIRST LOADOUT
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {loadouts.map((loadout) => (
              <Link
                key={loadout.id}
                href={`/loadout/${loadout.id}`}
                className={styles.card}
              >
                {/* Image */}
                <div className={styles.cardImage}>
                  {loadout.image_url ? (
                    <Image
                      src={loadout.image_url}
                      alt={loadout.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className={styles.cardImageFallback}>
                      <span>NO SCREENSHOT</span>
                    </div>
                  )}
                  <div
                    className={styles.weaponBadge}
                    style={{
                      borderColor:
                        WEAPON_CLASS_COLORS[loadout.weapon_class] || "var(--green-primary)",
                      color:
                        WEAPON_CLASS_COLORS[loadout.weapon_class] || "var(--green-primary)",
                    }}
                  >
                    {loadout.weapon_class}
                  </div>
                </div>

                {/* Info */}
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{loadout.title}</h2>
                  {loadout.description && (
                    <p className={styles.cardDesc}>{loadout.description}</p>
                  )}
                  <div className={styles.cardMeta}>
                    <span className={styles.cardAuthor}>
                      <span className={styles.authorDot}>◆</span>
                      {loadout.author}
                    </span>
                    <span className={styles.cardDate}>
                      {new Date(loadout.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
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
