"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthProvider";
import styles from "./loadout.module.css";

type Comment = {
  id: string;
  created_at: string;
  author: string;
  body: string;
  user_id: string;
};

export function Comments({
  loadoutId,
  initial,
}: {
  loadoutId: string;
  initial: Comment[];
}) {
  const { user, profile } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [comments, setComments] = useState<Comment[]>(initial);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!body.trim()) return;
    setError(null);
    setSubmitting(true);

    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({
        loadout_id: loadoutId,
        user_id: user.id,
        author: profile.username,
        body: body.trim(),
      })
      .select()
      .single();

    if (insertError) {
      setError("Failed to post comment. Try again.");
    } else if (data) {
      setComments((prev) => [data, ...prev]);
      setBody("");
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div className={styles.commentsSection}>
      <div className={styles.panelLabel}>
        <span className={styles.panelDot}>▶</span> COMMENTS
        <span className={styles.attachCount}>{comments.length}</span>
      </div>

      {/* Input */}
      {user ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <div className={styles.commentInputRow}>
            <div className={styles.commentAvatar}>
              {profile?.username?.slice(0, 2).toUpperCase() ?? "??"}
            </div>
            <textarea
              className={styles.commentInput}
              placeholder="Add a comment..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>
          {error && <p className={styles.commentError}>{error}</p>}
          <div className={styles.commentFormFooter}>
            <span className={styles.charCount}>{body.length} / 500</span>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className={styles.commentSubmitBtn}
            >
              {submitting ? "POSTING..." : "POST"}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.commentLoginPrompt}>
          <a href="/login" className={styles.commentLoginLink}>Log in</a> to leave a comment.
        </div>
      )}

      {/* Comment list */}
      <div className={styles.commentList}>
        {comments.length === 0 ? (
          <p className={styles.noComments}>No comments yet. Be the first.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className={styles.commentItem}>
              <div className={styles.commentAvatar}>
                {c.author.slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.commentContent}>
                <div className={styles.commentMeta}>
                  <a
                    href={`/profile/${encodeURIComponent(c.author)}`}
                    className={styles.commentAuthor}
                  >
                    {c.author}
                  </a>
                  <span className={styles.commentDate}>
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                  {user?.id === c.user_id && (
                    <button
                      className={styles.commentDelete}
                      onClick={() => handleDelete(c.id)}
                      title="Delete comment"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className={styles.commentBody}>{c.body}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
