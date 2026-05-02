"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./admin.module.css";

export default function AdminPage() {
  const [status, setStatus] = useState<"idle" | "pinging" | "success" | "error">("idle");
  const [lastPinged, setLastPinged] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const ping = async () => {
    setStatus("pinging");
    try {
      const { count, error } = await supabase
        .from("loadouts")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      setCount(count ?? 0);
      setLastPinged(new Date().toLocaleTimeString());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.backBtn}>← BACK TO VAULT</Link>
          <div className={styles.logoTitle}>ADMIN PANEL</div>
        </div>
        <div className={styles.headerDivider} />
      </header>

      <main className={styles.main}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelDot}>▶</span>
            SUPABASE KEEPALIVE
          </div>
          <div className={styles.panelBody}>
            <p className={styles.desc}>
              Supabase pauses inactive free-tier projects after 7 days.
              Press the button below to ping the database and keep it alive.
            </p>

            <div className={styles.statusRow}>
              <div className={styles.indicator}>
                <span
                  className={`${styles.dot} ${
                    status === "success" ? styles.dotGreen :
                    status === "error" ? styles.dotRed :
                    status === "pinging" ? styles.dotYellow :
                    styles.dotDim
                  }`}
                />
                <span className={styles.statusText}>
                  {status === "idle" && "AWAITING PING"}
                  {status === "pinging" && "PINGING..."}
                  {status === "success" && `ONLINE · ${count} LOADOUTS`}
                  {status === "error" && "CONNECTION FAILED"}
                </span>
              </div>
              {lastPinged && (
                <span className={styles.lastPinged}>LAST PING: {lastPinged}</span>
              )}
            </div>

            <button
              onClick={ping}
              disabled={status === "pinging"}
              className={styles.pingBtn}
            >
              {status === "pinging" ? (
                <><span className={styles.spinner} /> PINGING DATABASE...</>
              ) : (
                <><span>◈</span> PING SUPABASE</>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
