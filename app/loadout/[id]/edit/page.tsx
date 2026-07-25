"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import { Nav } from "@/components/Nav";
import { v4 as uuidv4 } from "uuid";
import styles from "./edit.module.css";

const WEAPON_CLASSES = ["Assault","SMG","Sniper","LMG","Shotgun","Marksman","Handgun","Launcher"];

export default function EditLoadoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createSupabaseBrowserClient();

  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [form, setForm] = useState({
    title: "",
    weapon_class: "",
    attachments: "",
    description: "",
  });

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!user) return;

    const fetchLoadout = async () => {
      const { data, error } = await supabase
        .from("loadouts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) { setNotFound(true); setFetching(false); return; }
      if (data.user_id !== user.id) { setUnauthorized(true); setFetching(false); return; }

      setForm({
        title: data.title,
        weapon_class: data.weapon_class,
        attachments: data.attachments,
        description: data.description || "",
      });
      setExistingImageUrl(data.image_url);
      setFetching(false);
    };

    fetchLoadout();
  }, [user, loading, id]);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png",".jpg",".jpeg",".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
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
    setIsSubmitting(true);

    try {
      let image_url = existingImageUrl;

      // Upload new image if provided
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("loadout-screenshots")
          .upload(filename, imageFile, { contentType: imageFile.type });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage
          .from("loadout-screenshots")
          .getPublicUrl(filename);
        image_url = publicData.publicUrl;
      }

      // Remove image if flagged
      if (removeImage) image_url = null;

      const { error: updateError } = await supabase
        .from("loadouts")
        .update({
          title: form.title.trim(),
          weapon_class: form.weapon_class,
          attachments: form.attachments.trim(),
          description: form.description.trim(),
          image_url,
        })
        .eq("id", id)
        .eq("user_id", user!.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push(`/loadout/${id}`), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.scanline} />
        <Nav />
        <main className={styles.main}>
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>◈</div>
            <p className={styles.stateTitle}>LOADING...</p>
          </div>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.scanline} />
        <Nav />
        <main className={styles.main}>
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>✕</div>
            <p className={styles.stateTitle}>LOADOUT NOT FOUND</p>
          </div>
        </main>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.scanline} />
        <Nav />
        <main className={styles.main}>
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>⚠</div>
            <p className={styles.stateTitle}>NOT YOUR LOADOUT</p>
            <p className={styles.stateSub}>You can only edit loadouts you submitted.</p>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.scanline} />
        <Nav />
        <main className={styles.main}>
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>✓</div>
            <p className={styles.stateTitle}>LOADOUT UPDATED</p>
            <p className={styles.stateSub}>Redirecting...</p>
          </div>
        </main>
      </div>
    );
  }

  const currentImage = preview || (!removeImage ? existingImageUrl : null);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div className={styles.mainLabel}><span className={styles.labelDot}>▶</span> EDIT BUILD</div>
          <h1 className={styles.mainTitle}>EDIT LOADOUT</h1>
        </div>
        <div className={styles.mainDivider} />

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Left col */}
          <div className={styles.col}>
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                <span className={styles.labelDot}>▶</span> SCREENSHOT
                <span className={styles.labelOptional}>OPTIONAL</span>
              </label>
              <div
                {...getRootProps()}
                className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""} ${currentImage ? styles.dropzoneHasImage : ""}`}
              >
                <input {...getInputProps()} />
                {currentImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentImage} alt="Preview" className={styles.previewImage} />
                ) : (
                  <div className={styles.dropzoneContent}>
                    <div className={styles.dropzoneIcon}>⊕</div>
                    <p className={styles.dropzoneText}>{isDragActive ? "DROP IT HERE" : "DRAG & DROP SCREENSHOT"}</p>
                    <p className={styles.dropzoneHint}>or click to browse · PNG, JPG, WEBP · max 10MB</p>
                  </div>
                )}
              </div>
              {currentImage && (
                <button
                  type="button"
                  className={styles.clearImage}
                  onClick={() => { setPreview(null); setImageFile(null); setRemoveImage(true); }}
                >
                  REMOVE IMAGE
                </button>
              )}
            </div>

            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="description">
                <span className={styles.labelDot}>▶</span> DESCRIPTION
                <span className={styles.labelOptional}>OPTIONAL</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Playstyle notes, best use cases, tips..."
                rows={4}
              />
            </div>
          </div>

          {/* Right col */}
          <div className={styles.col}>
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="title">
                <span className={styles.labelDot}>▶</span> LOADOUT NAME
                <span className={styles.labelRequired}>REQUIRED</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g. RANKED SHREDDER..."
                maxLength={80}
              />
            </div>

            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="weapon_class">
                <span className={styles.labelDot}>▶</span> WEAPON CLASS
                <span className={styles.labelRequired}>REQUIRED</span>
              </label>
              <select
                id="weapon_class"
                name="weapon_class"
                value={form.weapon_class}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">-- SELECT CLASS --</option>
                {WEAPON_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="attachments">
                <span className={styles.labelDot}>▶</span> ATTACHMENTS
                <span className={styles.labelRequired}>REQUIRED</span>
              </label>
              <textarea
                id="attachments"
                name="attachments"
                value={form.attachments}
                onChange={handleChange}
                className={styles.textarea}
                placeholder={`Muzzle: ...\nBarrel: ...\nUnderbarrel: ...\nMagazine: ...\nStock: ...`}
                rows={8}
              />
              <p className={styles.fieldHint}>One attachment per line (e.g. Muzzle: ...)</p>
            </div>

            {error && <div className={styles.error}><span>⚠</span> {error}</div>}

            <div className={styles.btnRow}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => router.push(`/loadout/${id}`)}
              >
                CANCEL
              </button>
              <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                {isSubmitting
                  ? <><span className={styles.spinner} /> SAVING...</>
                  : <><span>◈</span> SAVE CHANGES</>
                }
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
