"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import styles from "./collection.module.css";

export function AddToCollectionButton({ loadoutId }: { loadoutId: string }) {
  const { user } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    supabase.from("collections").select("id, name").eq("user_id", user.id).then(({ data }) => {
      setCollections(data || []);
    });
    supabase.from("collection_items").select("collection_id").eq("loadout_id", loadoutId).then(({ data }) => {
      setAdded(new Set((data || []).map((d) => d.collection_id)));
    });
  }, [user, open, loadoutId]);

  const toggle = async (collectionId: string) => {
    if (loading) return;
    setLoading(true);
    if (added.has(collectionId)) {
      await supabase.from("collection_items").delete().eq("collection_id", collectionId).eq("loadout_id", loadoutId);
      setAdded((prev) => { const n = new Set(prev); n.delete(collectionId); return n; });
    } else {
      await supabase.from("collection_items").insert({ collection_id: collectionId, loadout_id: loadoutId });
      setAdded((prev) => new Set([...prev, collectionId]));
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className={styles.addToColWrap}>
      <button className={styles.addToColBtn} onClick={() => setOpen(!open)} title="Save to collection">
        🔖 SAVE
      </button>
      {open && (
        <div className={styles.colDropdown}>
          <div className={styles.colDropdownHeader}>SAVE TO COLLECTION</div>
          {collections.length === 0 ? (
            <div className={styles.colEmpty}>
              <a href="/collections/new" className={styles.colNewLink}>+ Create a collection</a>
            </div>
          ) : (
            collections.map((col) => (
              <button
                key={col.id}
                className={`${styles.colItem} ${added.has(col.id) ? styles.colItemAdded : ""}`}
                onClick={() => toggle(col.id)}
                disabled={loading}
              >
                <span>{added.has(col.id) ? "✓" : "+"}</span>
                {col.name}
              </button>
            ))
          )}
          <a href="/collections/new" className={styles.colNewLink}>+ New collection</a>
        </div>
      )}
    </div>
  );
}
