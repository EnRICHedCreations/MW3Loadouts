"use client";

import { useState } from "react";
import styles from "./loadout.module.css";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: `MW3 Loadout: ${title}`, url });
        return;
      } catch { /* fallthrough to clipboard */ }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={styles.shareBtn} onClick={handleShare}>
      {copied ? "✓ COPIED" : "⎘ SHARE"}
    </button>
  );
}
