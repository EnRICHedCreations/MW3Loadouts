"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import styles from "./loadout.module.css";

export function StarRating({
  loadoutId,
  initialAvg,
  initialCount,
}: {
  loadoutId: string;
  initialAvg: number;
  initialCount: number;
}) {
  const { user } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [avg, setAvg] = useState(initialAvg ?? 0);
  const [count, setCount] = useState(initialCount ?? 0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hovering, setHovering] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("ratings")
      .select("score")
      .eq("loadout_id", loadoutId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUserRating(data.score);
      });
  }, [user, loadoutId]);

  const handleRate = async (score: number) => {
    if (!user || submitting) return;
    setSubmitting(true);

    const isUpdate = userRating !== null;

    if (isUpdate) {
      await supabase
        .from("ratings")
        .update({ score })
        .eq("loadout_id", loadoutId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("ratings")
        .insert({ loadout_id: loadoutId, user_id: user.id, score });
    }

    setUserRating(score);

    // Refresh avg
    const { data: avgData } = await supabase.rpc("get_avg_rating", { p_loadout_id: loadoutId });
    const { data: countData } = await supabase.rpc("get_rating_count", { p_loadout_id: loadoutId });
    if (avgData !== null) setAvg(avgData);
    if (countData !== null) setCount(countData);

    setSubmitting(false);
  };

  const display = hovering ?? userRating ?? 0;

  return (
    <div className={styles.ratingBlock}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`${styles.star} ${star <= display ? styles.starFilled : ""}`}
            onClick={() => user && handleRate(star)}
            onMouseEnter={() => user && setHovering(star)}
            onMouseLeave={() => setHovering(null)}
            disabled={!user || submitting}
            title={user ? `Rate ${star} star${star !== 1 ? "s" : ""}` : "Log in to rate"}
          >
            ★
          </button>
        ))}
      </div>
      <span className={styles.ratingStats}>
        {avg > 0 ? (
          <>{avg.toFixed(1)} / 5 &nbsp;·&nbsp; {count} rating{count !== 1 ? "s" : ""}</>
        ) : (
          "No ratings yet"
        )}
      </span>
      {!user && <span className={styles.ratingHint}>Log in to rate</span>}
    </div>
  );
}
