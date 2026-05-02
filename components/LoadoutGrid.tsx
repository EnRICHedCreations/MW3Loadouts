"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loadout, supabase } from "@/lib/supabase";
import styles from "./LoadoutGrid.module.css";

const WEAPON_CLASSES = [
  "Assault", "SMG", "Sniper", "LMG",
  "Shotgun", "Marksman", "Handgun", "Launcher",
];

const WEAPON_CLASS_COLORS: Record<string, string> = {
  Assault: "#7ab327",
  SMG: "#d4691e",
  Sniper: "#c8a228",
  LMG: "#b83232",
  Shotgun: "#6a4faa",
  Marksman: "#2a8a7a",
  Handgun: "#5a7aaa",
  Launcher: "#aa5a2a",
};

type SortOption = "newest" | "oldest" | "most_liked" | "most_viewed";

export function LoadoutGrid({ loadouts: initial }: { loadouts: Loadout[] }) {
  const [loadouts, setLoadouts] = useState(initial);
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem("liked_loadouts") || "[]"));
    } catch { return new Set(); }
  });

  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const alreadyLiked = likedIds.has(id);

    setLoadouts((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, likes: l.likes + (alreadyLiked ? -1 : 1) } : l
      )
    );
    const next = new Set(likedIds);
    alreadyLiked ? next.delete(id) : next.add(id);
    setLikedIds(next);
    localStorage.setItem("liked_loadouts", JSON.stringify([...next]));

    await supabase.rpc(alreadyLiked ? "decrement_likes" : "increment_likes", {
      loadout_id: id,
    });
  };

  const filtered = useMemo(() => {
    let result = [...loadouts];

    if (activeClass) result = result.filter((l) => l.weapon_class === activeClass);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.author.toLowerCase().includes(q) ||
          l.attachments.toLowerCase().includes(q) ||
          l.weapon_class.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "newest":      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case "oldest":      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case "most_liked":  result.sort((a, b) => b.likes - a.likes); break;
      case "most_viewed": result.sort((a, b) => b.views - a.views); break;
    }

    return result;
  }, [loadouts, activeClass, search, sort]);

  if (loadouts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>◈</div>
        <p className={styles.emptyTitle}>NO LOADOUTS FOUND</p>
        <p className={styles.emptyText}>Be the first operator to share your build.</p>
        <Link href="/submit" className={styles.submitBtn}>SUBMIT FIRST LOADOUT</Link>
      </div>
    );
  }

  return (
    <>
      {/* Search + Sort bar */}
      <div className={styles.controlBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="SEARCH LOADOUTS, AUTHORS, ATTACHMENTS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <div className={styles.sortWrap}>
          <span className={styles.sortLabel}>SORT:</span>
          {(["newest", "oldest", "most_liked", "most_viewed"] as SortOption[]).map((s) => (
            <button
              key={s}
              className={`${styles.sortBtn} ${sort === s ? styles.sortActive : ""}`}
              onClick={() => setSort(s)}
            >
              {s === "newest" && "NEWEST"}
              {s === "oldest" && "OLDEST"}
              {s === "most_liked" && "❤ LIKED"}
              {s === "most_viewed" && "◉ VIEWED"}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>CLASS:</span>
        <button
          className={`${styles.filterBtn} ${activeClass === null ? styles.filterActive : ""}`}
          onClick={() => setActiveClass(null)}
        >
          ALL <span className={styles.filterCount}>{loadouts.length}</span>
        </button>
        {WEAPON_CLASSES.filter((c) => loadouts.some((l) => l.weapon_class === c)).map((cls) => {
          const count = loadouts.filter((l) => l.weapon_class === cls).length;
          return (
            <button
              key={cls}
              className={`${styles.filterBtn} ${activeClass === cls ? styles.filterActive : ""}`}
              style={activeClass === cls ? { borderColor: WEAPON_CLASS_COLORS[cls], color: WEAPON_CLASS_COLORS[cls] } : {}}
              onClick={() => setActiveClass(activeClass === cls ? null : cls)}
            >
              {cls} <span className={styles.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Results label */}
      <div className={styles.resultsLabel}>
        {filtered.length} {filtered.length === 1 ? "LOADOUT" : "LOADOUTS"}
        {activeClass && <span> · {activeClass.toUpperCase()}</span>}
        {search && <span> · &quot;{search}&quot;</span>}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>NO RESULTS</p>
          <p className={styles.emptyText}>Try a different search or filter.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((loadout) => (
            <Link key={loadout.id} href={`/loadout/${loadout.id}`} className={styles.card}>
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
                <h2 className={styles.cardTitle}>{loadout.title}</h2>
                {loadout.description && <p className={styles.cardDesc}>{loadout.description}</p>}
                <div className={styles.cardMeta}>
                  <span className={styles.cardAuthor}>
                    <span className={styles.authorDot}>◆</span>
                    {loadout.author}
                  </span>
                  <div className={styles.cardStats}>
                    <button
                      className={`${styles.likeBtn} ${likedIds.has(loadout.id) ? styles.likeBtnActive : ""}`}
                      onClick={(e) => handleLike(e, loadout.id)}
                      title={likedIds.has(loadout.id) ? "Unlike" : "Like"}
                    >
                      ❤ {loadout.likes}
                    </button>
                    <span className={styles.viewCount}>◉ {loadout.views}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
