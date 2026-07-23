"use client";

import { useState } from "react";
import styles from "./profile.module.css";

export function ProfileShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${username}'s MW3 Loadouts`, url });
        return;
      } catch { /* fallthrough */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={styles.shareBtn} onClick={handleShare}>
      {copied ? "✓ LINK COPIED" : "⎘ SHARE PROFILE"}
    </button>
  );
}
