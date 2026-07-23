import Link from "next/link";
import Image from "next/image";
import { supabase, Loadout } from "@/lib/supabase";
import styles from "./related.module.css";

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

export async function RelatedLoadouts({ currentId, weaponClass }: { currentId: string; weaponClass: string }) {
  const { data } = await supabase
    .from("loadouts")
    .select("*")
    .eq("weapon_class", weaponClass)
    .neq("id", currentId)
    .order("likes", { ascending: false })
    .limit(3);

  if (!data?.length) return null;

  return (
    <div className={styles.related}>
      <div className={styles.relatedHeader}>
        <span className={styles.labelDot}>▶</span>
        MORE {weaponClass.toUpperCase()} LOADOUTS
      </div>
      <div className={styles.relatedGrid}>
        {data.map((l: Loadout) => (
          <Link key={l.id} href={`/loadout/${l.id}`} className={styles.relatedCard}>
            <div className={styles.relatedImage}>
              {l.image_url ? (
                <Image src={l.image_url} alt={l.title} fill style={{ objectFit: "cover" }} />
              ) : (
                <div className={styles.relatedFallback}><span>NO IMG</span></div>
              )}
              <div className={styles.relatedBadge} style={{ borderColor: WEAPON_CLASS_COLORS[l.weapon_class], color: WEAPON_CLASS_COLORS[l.weapon_class] }}>
                {l.weapon_class}
              </div>
            </div>
            <div className={styles.relatedBody}>
              <span className={styles.relatedTitle}>{l.title}</span>
              <span className={styles.relatedAuthor}>by {l.author}</span>
              <span className={styles.relatedStats}>❤ {l.likes ?? 0} · ◉ {l.views ?? 0}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
