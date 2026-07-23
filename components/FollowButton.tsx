"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import styles from "./follow.module.css";

export function FollowButton({
  targetUserId,
  targetUsername,
  initialFollowers,
}: {
  targetUserId: string;
  targetUsername: string;
  initialFollowers: number;
}) {
  const { user } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(initialFollowers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === targetUserId) { setLoading(false); return; }
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle()
      .then(({ data }) => {
        setFollowing(!!data);
        setLoading(false);
      });
  }, [user, targetUserId]);

  const handleFollow = async () => {
    if (!user) { window.location.href = "/login"; return; }
    if (user.id === targetUserId) return;
    setLoading(true);

    if (following) {
      await supabase.from("follows").delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);
      setFollowing(false);
      setFollowers((f) => f - 1);
    } else {
      await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: targetUserId,
      });
      setFollowing(true);
      setFollowers((f) => f + 1);
    }
    setLoading(false);
  };

  if (user?.id === targetUserId) return null;

  return (
    <div className={styles.followWrap}>
      <button
        className={`${styles.followBtn} ${following ? styles.followingBtn : ""}`}
        onClick={handleFollow}
        disabled={loading}
      >
        {loading ? "..." : following ? "✓ FOLLOWING" : "+ FOLLOW"}
      </button>
      <span className={styles.followerCount}>
        {followers} {followers === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
}
