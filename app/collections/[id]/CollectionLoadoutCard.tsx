"use client";

import Link from "next/link";
import Image from "next/image";
import { Loadout } from "@/lib/supabase";
import styles from "./collection.module.css";

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

export function CollectionLoadoutCard({ loadout }: { loadout: Loadout }) {
  return (
    <div className={styles.card}>
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
              borderColor: WEAPON_CLASS_COLORS[loadout.weapon_class],
              color: WEAPON_CLASS_COLORS[loadout.weapon_class],
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
          <Link href={`/profile/${encodeURIComponent(loadout.author)}`} className={styles.cardAuthor}>
            <span className={styles.authorDot}>◆</span>{loadout.author}
          </Link>
          <div className={styles.cardStats}>
            <span>❤ {loadout.likes ?? 0}</span>
            <span>◉ {loadout.views ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
