"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import { Nav } from "@/components/Nav";
import styles from "./new.module.css";

export default function NewCollectionPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Collection name is required.");
    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("collections")
      .insert({
        user_id: user.id,
        author: profile?.username ?? "operator",
        name: name.trim(),
        description: description.trim(),
        public: true,
      })
      .select()
      .single();

    if (insertError || !data) {
      setError("Failed to create collection. Try again.");
      setSubmitting(false);
      return;
    }

    router.push(`/collections/${data.id}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}><span className={styles.labelDot}>▶</span> COLLECTIONS</div>
          <h1 className={styles.pageTitle}>CREATE COLLECTION</h1>
        </div>
        <div className={styles.headerDivider} />

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name"><span className={styles.labelDot}>▶</span> COLLECTION NAME</label>
            <input id="name" type="text" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Ranked Builds, SMG Meta..." maxLength={60} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="desc"><span className={styles.labelDot}>▶</span> DESCRIPTION <span className={styles.optional}>OPTIONAL</span></label>
            <textarea id="desc" className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this collection about?" maxLength={200} rows={3} />
          </div>
          {error && <div className={styles.error}><span>⚠</span> {error}</div>}
          <button type="submit" disabled={submitting} className={styles.submitBtn}>
            {submitting ? "CREATING..." : <><span>◈</span> CREATE COLLECTION</>}
          </button>
        </form>
      </main>
    </div>
  );
}