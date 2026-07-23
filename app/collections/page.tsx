import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import { CollectionCard } from "./CollectionCard";
import styles from "./collections.module.css";

export const revalidate = 0;

export default async function CollectionsPage() {
  const { data: collections } = await supabase
    .from("collections")
    .select("*, collection_items(count)")
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav page="collections" />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}><span className={styles.labelDot}>▶</span> COMMUNITY</div>
          <h1 className={styles.pageTitle}>COLLECTIONS</h1>
          <p className={styles.pageSub}>CURATED LOADOUT SETS FROM THE COMMUNITY</p>
        </div>
        <div className={styles.headerDivider} />

        <div className={styles.topBar}>
          <span className={styles.count}>{(collections || []).length} PUBLIC COLLECTIONS</span>
          <Link href="/collections/new" className={styles.newBtn}>+ CREATE COLLECTION</Link>
        </div>

        {!collections?.length ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>◈</div>
            <p className={styles.emptyTitle}>NO COLLECTIONS YET</p>
            <p className={styles.emptyText}>Be the first to curate a collection of loadouts.</p>
            <Link href="/collections/new" className={styles.newBtn}>CREATE ONE</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {collections.map((col) => <CollectionCard key={col.id} col={col} />)}
          </div>
        )}
      </main>
    </div>
  );
}
