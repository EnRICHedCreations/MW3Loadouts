"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import styles from "./Nav.module.css";

export function Nav({ page }: { page?: string }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoEyebrow}>CALL OF DUTY</span>
          <span className={styles.logoTitle}>LOADOUT VAULT</span>
          <span className={styles.logoSub}>MODERN WARFARE III</span>
        </Link>

        <nav className={styles.links}>
          <Link href="/loadoutvault" className={`${styles.link} ${page === "vault" ? styles.active : ""}`}>LOADOUTS</Link>
          <Link href="/trending" className={`${styles.link} ${page === "trending" ? styles.active : ""}`}>🔥 TRENDING</Link>
          <Link href="/meta" className={`${styles.link} ${page === "meta" ? styles.active : ""}`}>META</Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/feed" className={`${styles.link} ${page === "feed" ? styles.active : ""}`}>FEED</Link>
                  <Link href="/collections" className={`${styles.link} ${page === "collections" ? styles.active : ""}`}>COLLECTIONS</Link>
                  <Link href="/submit" className={`${styles.link} ${page === "submit" ? styles.active : ""}`}>+ SUBMIT</Link>
                  <div className={styles.userPill}>
                    <span className={styles.userDot}>◆</span>
                    <Link href={`/profile/${encodeURIComponent(profile?.username ?? "")}`} className={styles.username}>
                      {profile?.username ?? "OPERATOR"}
                    </Link>
                    <button className={styles.signOutBtn} onClick={handleSignOut}>LOGOUT</button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className={`${styles.link} ${page === "login" ? styles.active : ""}`}>LOGIN</Link>
                  <Link href="/signup" className={styles.ctaBtn}>JOIN</Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
      <div className={styles.divider} />
    </header>
  );
}
