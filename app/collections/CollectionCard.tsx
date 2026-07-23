"use client";

import Link from "next/link";
import styles from "./collections.module.css";

type Collection = {
  id: string;
  name: string;
  description?: string;
  author: string;
  collection_items?: { count: number }[];
};

export function CollectionCard({ col }: { col: Collection }) {
  return (
    <div className={styles.card}>
      <Link href={`/collections/${col.id}`} className={styles.cardLink}>
        <div className={styles.cardBody}>
          <h2 className={styles.cardTitle}>{col.name}</h2>
          {col.description && <p className={styles.cardDesc}>{col.description}</p>}
        </div>
      </Link>
      <div className={styles.cardMeta}>
        <Link href={`/profile/${encodeURIComponent(col.author)}`} className={styles.cardAuthor}>
          <span className={styles.authorDot}>◆</span>{col.author}
        </Link>
        <span className={styles.cardCount}>
          {col.collection_items?.[0]?.count ?? 0} loadouts
        </span>
      </div>
    </div>
  );
}
