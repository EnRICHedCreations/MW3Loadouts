"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: existing } = await supabase.from("profiles").select("id").eq("username", username.trim()).maybeSingle();
    if (existing) { setError("That username is already taken."); setLoading(false); return; }

    const { data, error: signupError } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: username.trim() } },
    });

    if (signupError) { setError(signupError.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, username: username.trim() });
    }

    router.push("/loadoutvault");
    router.refresh();
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
          <h1 className={styles.formTitle}>CREATE ACCOUNT</h1>
          <form onSubmit={handleSignup} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username"><span className={styles.labelDot}>▶</span> GAMERTAG / USERNAME</label>
              <input id="username" type="text" className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="YourOperatorTag" required maxLength={30} />
              <span className={styles.hint}>This will appear on all your loadouts</span>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email"><span className={styles.labelDot}>▶</span> EMAIL</label>
              <input id="email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@example.com" required autoComplete="email" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password"><span className={styles.labelDot}>▶</span> PASSWORD</label>
              <input id="password" type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} autoComplete="new-password" />
            </div>
            {error && <div className={styles.error}><span>⚠</span> {error}</div>}
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? <><span className={styles.spinner} /> CREATING ACCOUNT...</> : <><span>◈</span> CREATE ACCOUNT</>}
            </button>
          </form>
          <div className={styles.footer}>
            <span>Already enlisted?</span>
            <Link href="/login" className={styles.footerLink}>LOGIN →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
