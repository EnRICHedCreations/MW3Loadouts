"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import styles from "./loadout.module.css";

export function CloneButton({ loadoutId, loadoutTitle }: { loadoutId: string; loadoutTitle: string }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [cloning, setCloning] = useState(false);

  const handleClone = async () => {
    if (!user || !profile) {
      router.push("/login");
      return;
    }
    setCloning(true);
    const { data, error } = await supabase.rpc("clone_loadout", {
      p_loadout_id: loadoutId,
      p_user_id: user.id,
      p_author: profile.username,
    });
    if (!error && data) {
      router.push(`/loadout/${data}`);
      router.refresh();
    }
    setCloning(false);
  };

  return (
    <button
      className={styles.cloneBtn}
      onClick={handleClone}
      disabled={cloning}
      title={user ? `Clone "${loadoutTitle}" to your profile` : "Log in to clone"}
    >
      {cloning ? "CLONING..." : "⎘ CLONE"}
    </button>
  );
}
