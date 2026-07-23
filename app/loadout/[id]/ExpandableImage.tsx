"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./loadout.module.css";

export function ExpandableImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={styles.imageFrame} onClick={() => setOpen(true)} title="Click to expand">
        <Image src={src} alt={alt} fill style={{ objectFit: "contain" }} priority />
        <div className={styles.expandHint}>⤢ EXPAND</div>
      </div>
      {open && (
        <div className={styles.lightbox} onClick={() => setOpen(false)}>
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setOpen(false)}>✕ CLOSE</button>
            <div className={styles.lightboxImageWrap}>
              <Image src={src} alt={alt} fill style={{ objectFit: "contain" }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
