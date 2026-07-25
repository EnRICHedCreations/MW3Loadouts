import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, Loadout } from "@/lib/supabase";
import { Nav } from "@/components/Nav";
import { ShareButton } from "./ShareButton";
import { LikeButton } from "./LikeButton";
import { ExpandableImage } from "./ExpandableImage";
import { StarRating } from "./StarRating";
import { Comments } from "./Comments";
import { CloneButton } from "./CloneButton";
import { RelatedLoadouts } from "./RelatedLoadouts";
import { AddToCollectionButton } from "@/app/collections/[id]/AddToCollectionButton";
import { EditButton } from "./EditButton";
import styles from "./loadout.module.css";

export const revalidate = 0;

async function getLoadout(id: string): Promise<Loadout | null> {
  const { data, error } = await supabase.from("loadouts").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data;
}

async function getComments(id: string) {
  const { data } = await supabase
    .from("comments")
    .select("*")
    .eq("loadout_id", id)
    .order("created_at", { ascending: false });
  return data || [];
}

async function getRatingStats(id: string) {
  const [{ data: avg }, { data: count }] = await Promise.all([
    supabase.rpc("get_avg_rating", { p_loadout_id: id }),
    supabase.rpc("get_rating_count", { p_loadout_id: id }),
  ]);
  return { avg: avg ?? 0, count: count ?? 0 };
}

export default async function LoadoutPage({ params }: { params: { id: string } }) {
  const [loadout, comments, ratingStats] = await Promise.all([
    getLoadout(params.id),
    getComments(params.id),
    getRatingStats(params.id),
  ]);

  if (!loadout) notFound();

  await supabase.rpc("increment_views", { loadout_id: params.id });

  const attachmentLines = loadout.attachments.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <Link href="/loadoutvault" className={styles.backBtn}>← BACK TO VAULT</Link>
          <div className={styles.topBarRight}>
            <div className={styles.weaponBadge}>{loadout.weapon_class}</div>
            <EditButton loadoutId={loadout.id} ownerId={loadout.user_id} />
            <AddToCollectionButton loadoutId={loadout.id} />
            <CloneButton loadoutId={loadout.id} loadoutTitle={loadout.title} />
            <ShareButton title={loadout.title} />
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left: image */}
          <div className={styles.imageCol}>
            {loadout.image_url ? (
              <ExpandableImage src={loadout.image_url} alt={loadout.title} />
            ) : (
              <div className={styles.imageFrame}>
                <div className={styles.imageFallback}><span>NO SCREENSHOT PROVIDED</span></div>
              </div>
            )}

            {/* Star rating under image */}
            <StarRating
              loadoutId={loadout.id}
              initialAvg={ratingStats.avg}
              initialCount={ratingStats.count}
            />
          </div>

          {/* Right: info */}
          <div className={styles.infoCol}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>{loadout.title}</h1>
              <div className={styles.meta}>
                <Link href={`/profile/${encodeURIComponent(loadout.author)}`} className={styles.author}>
                  <span className={styles.authorDot}>◆</span>{loadout.author}
                </Link>
                <span className={styles.date}>
                  {new Date(loadout.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className={styles.engagementRow}>
                <LikeButton loadoutId={loadout.id} initialLikes={loadout.likes} />
                <span className={styles.viewStat}>◉ {(loadout.views ?? 0) + 1} VIEWS</span>
              </div>
            </div>

            {loadout.description && (
              <div className={styles.panel}>
                <div className={styles.panelLabel}><span className={styles.panelDot}>▶</span> OPERATOR NOTES</div>
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
                      {slot ? (<><span className={styles.slot}>{slot}</span><span className={styles.slotSep}>:</span><span className={styles.attachName}>{value}</span></>) : <span className={styles.attachName}>{value}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Comments */}
            <div className={styles.panel}>
              <Comments loadoutId={loadout.id} initial={comments} />
            </div>
          </div>
        </div>

        {/* Related loadouts */}
        <RelatedLoadouts currentId={loadout.id} weaponClass={loadout.weapon_class} />
      </main>
    </div>
  );
}