"use client";

import { useAuth } from "@/lib/AuthProvider";
import { useRouter } from "next/navigation";
import styles from "./loadout.module.css";

export function EditButton({ loadoutId, ownerId }: { loadoutId: string; ownerId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.id !== ownerId) return null;

  return (
    <button
      className={styles.editBtn}
      onClick={() => router.push(`/loadout/${loadoutId}/edit`)}
      title="Edit this loadout"
    >
      ✎ EDIT
    </button>
  );
}
