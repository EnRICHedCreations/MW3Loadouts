"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/loadoutvault"); router.refresh(); }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Link href="/" className={styles.logoLink}>
            <span className={styles.logoEyebrow}>CALL OF DUTY</span>
            <span className={styles.logoTitle}>LOADOUT VAULT</span>
            <span className={styles.logoSub}>MODERN WARFARE III</span>
          </Link>
        </div>
        <div className={styles.cardDivider} />
        <div className={styles.cardBody}>
          <h1 className={styles.formTitle}>OPERATOR LOGIN</h1>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email"><span className={styles.labelDot}>▶</span> EMAIL</label>
              <input id="email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@example.com" required autoComplete="email" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password"><span className={styles.labelDot}>▶</span> PASSWORD</label>
              <input id="password" type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && <div className={styles.error}><span>⚠</span> {error}</div>}
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? <><span className={styles.spinner} /> AUTHENTICATING...</> : <><span>◈</span> LOGIN</>}
            </button>
          </form>
          <div className={styles.footer}>
            <span>No account?</span>
            <Link href="/signup" className={styles.footerLink}>CREATE ONE →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
