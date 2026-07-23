import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
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
      <Nav />

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
            {collections.map((col) => (
              <Link key={col.id} href={`/collections/${col.id}`} className={styles.card}>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{col.name}</h2>
                  {col.description && <p className={styles.cardDesc}>{col.description}</p>}
                  <div className={styles.cardMeta}>
                    <Link href={`/profile/${encodeURIComponent(col.author)}`} className={styles.cardAuthor} onClick={(e) => e.stopPropagation()}>
                      <span className={styles.authorDot}>◆</span>{col.author}
                    </Link>
                    <span className={styles.cardCount}>
                      {col.collection_items?.[0]?.count ?? 0} loadouts
                    </span>
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
