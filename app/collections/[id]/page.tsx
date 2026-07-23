import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { supabase, Loadout } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import { AddToCollectionButton } from "./AddToCollectionButton";
import styles from "./collection.module.css";

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#cc2020", SMG: "#d4691e", Sniper: "#c8a228", LMG: "#b83232",
  Shotgun: "#6a4faa", Marksman: "#2a8a7a", Handgun: "#5a7aaa", Launcher: "#aa5a2a",
};

export const revalidate = 0;

export default async function CollectionPage({ params }: { params: { id: string } }) {
  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!collection) notFound();

  const { data: items } = await supabase
    .from("collection_items")
    .select("loadout_id, created_at")
    .eq("collection_id", params.id)
    .order("created_at", { ascending: false });

  const loadoutIds = (items || []).map((i) => i.loadout_id);

  let loadouts: Loadout[] = [];
  if (loadoutIds.length > 0) {
    const { data } = await supabase.from("loadouts").select("*").in("id", loadoutIds);
    // Preserve order
    const map = Object.fromEntries((data || []).map((l) => [l.id, l]));
    loadouts = loadoutIds.map((id) => map[id]).filter(Boolean);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}>
            <span className={styles.labelDot}>▶</span>
            COLLECTION BY{" "}
            <Link href={`/profile/${encodeURIComponent(collection.author)}`} className={styles.authorLink}>
              {collection.author}
            </Link>
          </div>
          <h1 className={styles.pageTitle}>{collection.name}</h1>
          {collection.description && <p className={styles.pageDesc}>{collection.description}</p>}
          <p className={styles.pageSub}>{loadouts.length} LOADOUT{loadouts.length !== 1 ? "S" : ""}</p>
        </div>
        <div className={styles.headerDivider} />

        {loadouts.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>◈</div>
            <p className={styles.emptyTitle}>COLLECTION IS EMPTY</p>
            <p className={styles.emptyText}>Add loadouts by clicking the bookmark icon on any loadout.</p>
            <Link href="/loadoutvault" className={styles.browseBtn}>BROWSE LOADOUTS</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {loadouts.map((loadout) => (
              <Link key={loadout.id} href={`/loadout/${loadout.id}`} className={styles.card}>
                <div className={styles.cardImage}>
                  {loadout.image_url ? (
                    <Image src={loadout.image_url} alt={loadout.title} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <div className={styles.cardImageFallback}><span>NO SCREENSHOT</span></div>
                  )}
                  <div className={styles.weaponBadge} style={{ borderColor: WEAPON_CLASS_COLORS[loadout.weapon_class], color: WEAPON_CLASS_COLORS[loadout.weapon_class] }}>
                    {loadout.weapon_class}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{loadout.title}</h2>
                  {loadout.description && <p className={styles.cardDesc}>{loadout.description}</p>}
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
