"use client";

import Link from "next/link";
import Image from "next/image";
import { Loadout } from "@/lib/supabase";
import styles from "./profile.module.css";

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

export function ProfileLoadoutGrid({ loadouts }: { loadouts: Loadout[] }) {
  if (loadouts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>◈</div>
        <p className={styles.emptyTitle}>NO BUILDS YET</p>
        <p className={styles.emptyText}>This operator hasn&apos;t shared any loadouts yet.</p>
        <Link href="/loadoutvault" className={styles.browseBtn}>BROWSE OTHER LOADOUTS</Link>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {loadouts.map((loadout) => (
        <div key={loadout.id} className={styles.card}>
          <Link href={`/loadout/${loadout.id}`} className={styles.cardImageLink}>
            <div className={styles.cardImage}>
              {loadout.image_url ? (
                <Image src={loadout.image_url} alt={loadout.title} fill style={{ objectFit: "cover" }} />
              ) : (
                <div className={styles.cardImageFallback}><span>NO SCREENSHOT</span></div>
              )}
              <div
                className={styles.weaponBadge}
                style={{
                  borderColor: WEAPON_CLASS_COLORS[loadout.weapon_class] || "var(--green-primary)",
                  color: WEAPON_CLASS_COLORS[loadout.weapon_class] || "var(--green-primary)",
                }}
              >
                {loadout.weapon_class}
              </div>
            </div>
          </Link>
          <div className={styles.cardBody}>
            <Link href={`/loadout/${loadout.id}`} className={styles.cardTitleLink}>
              <h2 className={styles.cardTitle}>{loadout.title}</h2>
            </Link>
            {loadout.description && <p className={styles.cardDesc}>{loadout.description}</p>}
            <div className={styles.cardMeta}>
              <span className={styles.cardDate}>
                {new Date(loadout.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <div className={styles.cardStats}>
                <span className={styles.statBadge}>❤ {loadout.likes ?? 0}</span>
                <span className={styles.statBadge}>◉ {loadout.views ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
