"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import { Nav } from "@/components/Nav";
import { v4 as uuidv4 } from "uuid";
import styles from "./submit.module.css";

const WEAPON_CLASSES = ["Assault","SMG","Sniper","LMG","Shotgun","Marksman","Handgun","Launcher"];

export default function SubmitPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: "", weapon_class: "", attachments: "", description: "" });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [".png",".jpg",".jpeg",".webp"] }, maxFiles: 1, maxSize: 10 * 1024 * 1024,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) return setError("Loadout title is required.");
    if (!form.weapon_class) return setError("Please select a weapon class.");
    if (!form.attachments.trim()) return setError("Please enter your attachments.");
    if (!user || !profile) return setError("You must be logged in to submit.");
    setIsSubmitting(true);
    try {
      let image_url: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("loadout-screenshots").upload(filename, imageFile, { contentType: imageFile.type });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from("loadout-screenshots").getPublicUrl(filename);
        image_url = publicData.publicUrl;
      }
      const { error: insertError } = await supabase.from("loadouts").insert({
        user_id: user.id, author: profile.username,
        title: form.title.trim(), weapon_class: form.weapon_class,
        attachments: form.attachments.trim(), description: form.description.trim(), image_url,
      });
      if (insertError) throw insertError;
      router.push("/loadoutvault");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav page="submit" />
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div className={styles.mainLabel}><span className={styles.labelDot}>▶</span> DEPLOY A BUILD</div>
          <h1 className={styles.mainTitle}>SUBMIT LOADOUT</h1>
          <div className={styles.authorBadge}>
            <span className={styles.authorDot}>◆</span>
            Submitting as <strong>{profile?.username}</strong>
          </div>
        </div>
        <div className={styles.mainDivider} />
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.col}>
            <div className={styles.section}>
              <label className={styles.sectionLabel}><span className={styles.labelDot}>▶</span> LOADOUT SCREENSHOT<span className={styles.labelOptional}>OPTIONAL</span></label>
              <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""} ${preview ? styles.dropzoneHasImage : ""}`}>
                <input {...getInputProps()} />
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className={styles.previewImage} />
                ) : (
                  <div className={styles.dropzoneContent}>
                    <div className={styles.dropzoneIcon}>⊕</div>
                    <p className={styles.dropzoneText}>{isDragActive ? "DROP IT HERE" : "DRAG & DROP SCREENSHOT"}</p>
                    <p className={styles.dropzoneHint}>or click to browse · PNG, JPG, WEBP · max 10MB</p>
                  </div>
                )}
              </div>
              {preview && <button type="button" className={styles.clearImage} onClick={() => { setPreview(null); setImageFile(null); }}>REMOVE IMAGE</button>}
            </div>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="description"><span className={styles.labelDot}>▶</span> DESCRIPTION<span className={styles.labelOptional}>OPTIONAL</span></label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} className={styles.textarea} placeholder="Playstyle notes, best use cases, tips..." rows={4} />
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="title"><span className={styles.labelDot}>▶</span> LOADOUT NAME<span className={styles.labelRequired}>REQUIRED</span></label>
              <input id="title" name="title" type="text" value={form.title} onChange={handleChange} className={styles.input} placeholder="e.g. RANKED SHREDDER, SNIPER ELITE..." maxLength={80} />
            </div>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="weapon_class"><span className={styles.labelDot}>▶</span> WEAPON CLASS<span className={styles.labelRequired}>REQUIRED</span></label>
              <select id="weapon_class" name="weapon_class" value={form.weapon_class} onChange={handleChange} className={styles.select}>
                <option value="">-- SELECT CLASS --</option>
                {WEAPON_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="attachments"><span className={styles.labelDot}>▶</span> ATTACHMENTS<span className={styles.labelRequired}>REQUIRED</span></label>
              <textarea id="attachments" name="attachments" value={form.attachments} onChange={handleChange} className={styles.textarea}
                placeholder={`Muzzle: Shadowstrike Suppressor\nBarrel: Bruen Venom Long Barrel\nUnderbarrel: VX Pineapple\nMagazine: 45 Round Mag\nStock: Demo Fade Pro Stock`} rows={8} />
              <p className={styles.fieldHint}>List each slot on its own line (e.g. Muzzle: ...)</p>
            </div>
            {error && <div className={styles.error}><span>⚠</span> {error}</div>}
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? <><span className={styles.spinner} /> UPLOADING...</> : <><span>◈</span> DEPLOY LOADOUT</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
