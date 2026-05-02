import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { supabase, Loadout } from "@/lib/supabase";
import { ShareButton } from "./ShareButton";
import { LikeButton } from "./LikeButton";
import styles from "./loadout.module.css";

async function getLoadout(id: string): Promise<Loadout | null> {
  const { data, error } = await supabase
    .from("loadouts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

async function incrementViews(id: string) {
  await supabase.rpc("increment_views", { loadout_id: id });
}

export default async function LoadoutPage({
  params,
}: {
  params: { id: string };
}) {
  const loadout = await getLoadout(params.id);
  if (!loadout) notFound();

  // Fire-and-forget view increment
  await incrementViews(params.id);

  const attachmentLines = loadout.attachments
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.backBtn}>← BACK TO VAULT</Link>
          <div className={styles.headerRight}>
            <div className={styles.weaponBadge}>{loadout.weapon_class}</div>
            <ShareButton title={loadout.title} />
          </div>
        </div>
        <div className={styles.headerDivider} />
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>
          {/* Left: screenshot */}
          <div className={styles.imageCol}>
            <div className={styles.imageFrame}>
              {loadout.image_url ? (
                <Image
                  src={loadout.image_url}
                  alt={loadout.title}
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              ) : (
                <div className={styles.imageFallback}>
                  <span>NO SCREENSHOT PROVIDED</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: info */}
          <div className={styles.infoCol}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>{loadout.title}</h1>
              <div className={styles.meta}>
                <span className={styles.author}>
                  <span className={styles.authorDot}>◆</span>
                  {loadout.author}
                </span>
                <span className={styles.date}>
                  {new Date(loadout.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </div>
              <div className={styles.engagementRow}>
                <LikeButton loadoutId={loadout.id} initialLikes={loadout.likes} />
                <span className={styles.viewStat}>◉ {loadout.views + 1} VIEWS</span>
              </div>
            </div>

            {loadout.description && (
              <div className={styles.panel}>
                <div className={styles.panelLabel}>
                  <span className={styles.panelDot}>▶</span> OPERATOR NOTES
                </div>
                <p className={styles.description}>{loadout.description}</p>
              </div>
            )}

            <div className={styles.panel}>
              <div className={styles.panelLabel}>
                <span className={styles.panelDot}>▶</span> ATTACHMENTS
                <span className={styles.attachCount}>{attachmentLines.length} SLOTS</span>
              </div>
              <ul className={styles.attachmentList}>
                {attachmentLines.map((line, i) => {
                  const colonIdx = line.indexOf(":");
                  const slot = colonIdx !== -1 ? line.slice(0, colonIdx).trim() : null;
                  const value = colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : line;
                  return (
                    <li key={i} className={styles.attachmentItem}>
                      {slot ? (
                        <>
                          <span className={styles.slot}>{slot}</span>
                          <span className={styles.slotSep}>:</span>
                          <span className={styles.attachName}>{value}</span>
                        </>
                      ) : (
                        <span className={styles.attachName}>{value}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
