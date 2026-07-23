"use client";

import Link from "next/link";
import Image from "next/image";
import { Loadout } from "@/lib/supabase";
import styles from "./trending.module.css";

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

export function LoadoutCard({ loadout, rank }: { loadout: Loadout; rank?: number }) {
  return (
    <Link href={`/loadout/${loadout.id}`} className={styles.card}>
      {rank !== undefined && <div className={styles.rank}>#{rank + 1}</div>}
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
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{loadout.title}</h3>
        <div className={styles.cardMeta}>
          <span className={styles.cardAuthor}>
            <span className={styles.authorDot}>◆</span>{loadout.author}
          </span>
          <div className={styles.cardStats}>
            <span>❤ {loadout.likes ?? 0}</span>
            <span>◉ {loadout.views ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
