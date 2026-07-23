"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./loadout.module.css";

export function LikeButton({ loadoutId, initialLikes }: { loadoutId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes ?? 0);
  const [liked, setLiked] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("liked_loadouts") || "[]");
      setLiked(stored.includes(loadoutId));
    } catch { /* ignore */ }
  }, [loadoutId]);

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((l) => l + (next ? 1 : -1));
    try {
      const stored: string[] = JSON.parse(localStorage.getItem("liked_loadouts") || "[]");
      const updated = next ? [...stored, loadoutId] : stored.filter((id) => id !== loadoutId);
      localStorage.setItem("liked_loadouts", JSON.stringify(updated));
    } catch { /* ignore */ }
    await supabase.rpc(next ? "increment_likes" : "decrement_likes", { loadout_id: loadoutId });
  };

  return (
    <button className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ""}`} onClick={handleLike}>
      ❤ {likes} {likes === 1 ? "LIKE" : "LIKES"}
    </button>
  );
}
