import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, Loadout } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import { CollectionLoadoutCard } from "./CollectionLoadoutCard";
import styles from "./collection.module.css";

export const revalidate = 0;

export default async function CollectionPage({ params }: { params: { id: string } }) {
  const { data: collection } = await supabase
    .from("collections").select("*").eq("id", params.id).maybeSingle();

  if (!collection) notFound();

  const { data: items } = await supabase
    .from("collection_items").select("loadout_id, created_at")
    .eq("collection_id", params.id).order("created_at", { ascending: false });

  const loadoutIds = (items || []).map((i) => i.loadout_id);
  let loadouts: Loadout[] = [];

  if (loadoutIds.length > 0) {
    const { data } = await supabase.from("loadouts").select("*").in("id", loadoutIds);
    const map = Object.fromEntries((data || []).map((l) => [l.id, l]));
    loadouts = loadoutIds.map((id) => map[id]).filter(Boolean);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav page="collections" />

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
            <p className={styles.emptyText}>Add loadouts by clicking the 🔖 Save button on any loadout.</p>
            <Link href="/loadoutvault" className={styles.browseBtn}>BROWSE LOADOUTS</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {loadouts.map((loadout) => (
              <CollectionLoadoutCard key={loadout.id} loadout={loadout} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
