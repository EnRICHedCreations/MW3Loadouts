"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./TerminalHack.module.css";

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a"
];

const CLASSIFIED_LOADOUT = {
  title: "THE DRTY DTIR",
  class: "Battle Rifle",
  attachments: [
    { slot: "MUZZLE",      value: "Quartermaster Suppressor" },
    { slot: "BARREL",      value: "Fixer 1.4 Long Barrel" },
    { slot: "OPTIC",       value: "Heinrichter Hybrid Optic" },
    { slot: "UNDERBARREL", value: "Jak Slash" },
    { slot: "Ammunition",    value: ".30-06 Mono" },
  ],
  notes: "High-value target elimination. Wallbanger. Run this when you need to delete enemies from afar.",
  classification: "TOP SECRET // OPERATOR EYES ONLY",
  operator: "RUSH GAMBINO",
  clearance: "LEVEL 5",
};

// Words to encode — all CoD-relevant, easy enough to decode with the shift shown
const CIPHER_WORDS = [
  "GHOST", "REAPER", "SHADOW", "BREACH", "HUNTER",
  "SNIPER", "RECON", "STEALTH", "VECTOR", "RANGER",
];

// Caesar cipher encode
function caesarEncode(word: string, shift: number): string {
  return word.split("").map((c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    return c;
  }).join("");
}

// Generate a cipher challenge — pick random word and shift 3-7
function generateCipher() {
  const word = CIPHER_WORDS[Math.floor(Math.random() * CIPHER_WORDS.length)];
  const shift = Math.floor(Math.random() * 5) + 3; // 3-7
  const encoded = caesarEncode(word, shift);
  return { word, shift, encoded };
}

const BOOT_LINES = [
  { text: "> INITIATING SECURE CONNECTION...", delay: 0 },
  { text: "> BYPASSING FIREWALL [████████░░] 80%...", delay: 400 },
  { text: "> BYPASSING FIREWALL [██████████] 100%", delay: 800 },
  { text: "> AUTHENTICATING OPERATOR CREDENTIALS...", delay: 1200 },
  { text: "> CLEARANCE LEVEL 5 CONFIRMED", delay: 1700 },
  { text: "> ACCESSING CLASSIFIED LOADOUT DATABASE...", delay: 2100 },
  { text: "> DECRYPTING PAYLOAD...", delay: 2600 },
  { text: "> ⚠  UNAUTHORIZED ACCESS DETECTED — PURGING LOGS", delay: 3000 },
  { text: "> ACCESS GRANTED. WELCOME, OPERATOR.", delay: 3600 },
];

type Stage = "idle" | "scanned" | "cipher" | "decrypted" | "extracted";

export function TerminalHack() {
  const [open, setOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [showLoadout, setShowLoadout] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [cipher, setCipher] = useState<{ word: string; shift: number; encoded: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [badgeAwarded, setBadgeAwarded] = useState(false);
  const konamiRef = useRef<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  // Konami code listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-10);
      if (konamiRef.current.join(",") === KONAMI.join(",")) {
        setOpen(true);
        konamiRef.current = [];
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Boot sequence
  useEffect(() => {
    if (!open) return;
    setBooting(true);
    setLines([]);
    setShowLoadout(false);
    setInputEnabled(false);
    setInput("");
    setStage("idle");
    setCipher(null);
    setAttempts(0);
    setLocked(false);
    setBadgeAwarded(false);

    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach(({ text, delay }) => {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, text]);
        i++;
        if (i === BOOT_LINES.length) {
          setTimeout(() => {
            setBooting(false);
            setInputEnabled(true);
            setLines((prev) => [...prev, "", "> TYPE 'help' FOR AVAILABLE COMMANDS", ""]);
          }, 500);
        }
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [open]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, showLoadout]);

  // Focus input
  useEffect(() => {
    if (inputEnabled) inputRef.current?.focus();
  }, [inputEnabled]);

  const triggerGlitch = () => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 400);
  };

  const addLines = useCallback((...newLines: string[]) => {
    setLines((prev) => [...prev, ...newLines, ""]);
  }, []);

  const handleCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    setLines((prev) => [...prev, `> $ ${trimmed}`]);

    // Exit
    if (trimmed === "exit") { setTimeout(() => setOpen(false), 300); return; }

    // Clear
    if (trimmed === "clear") { setLines([]); return; }

    // Help
    if (trimmed === "help") {
      const extractLine = stage === "decrypted" ? ">   extract  — extract decrypted payload" : ">   extract  — [LOCKED — complete decryption first]";
      const decryptLine = stage === "scanned" ? ">   decrypt  — begin cipher challenge" : stage === "decrypted" ? ">   decrypt  — ✓ COMPLETE" : ">   decrypt  — [LOCKED — run scan first]";
      addLines(
        "> AVAILABLE COMMANDS:",
        ">   scan     — scan for classified files",
        decryptLine,
        extractLine,
        ">   clear    — clear terminal",
        ">   exit     — close terminal",
      );
      return;
    }

    // Scan
    if (trimmed === "scan") {
      if (stage === "idle") {
        addLines(
          "> SCANNING CLASSIFIED NODES...",
          "> 1 ENCRYPTED FILE DETECTED",
          "> FILE: LOADOUT_REAPER_CLASSIFIED.enc",
          "> ENCRYPTION: CAESAR CIPHER",
          "> TYPE 'decrypt' TO BEGIN CIPHER CHALLENGE",
        );
        setStage("scanned");
      } else {
        addLines("> SCAN ALREADY COMPLETE — FILE LOCATED");
      }
      return;
    }

    // Decrypt — triggers cipher challenge
    if (trimmed === "decrypt") {
      if (stage === "idle") {
        addLines("> ERROR: NO FILE LOCATED — RUN 'scan' FIRST");
        triggerGlitch();
        return;
      }
      if (stage === "decrypted") {
        addLines("> FILE ALREADY DECRYPTED — TYPE 'extract'");
        return;
      }
      if (locked) {
        addLines("> TERMINAL LOCKED — TOO MANY FAILED ATTEMPTS", "> RELOAD THE TERMINAL TO TRY AGAIN");
        triggerGlitch();
        return;
      }

      // Generate and show cipher challenge
      const c = generateCipher();
      setCipher(c);
      setStage("cipher");
      setAttempts(0);
      addLines(
        "> INITIATING CIPHER CHALLENGE...",
        "> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "> CIPHER TYPE  : CAESAR SHIFT",
        `> SHIFT VALUE  : ${c.shift}`,
        `> ENCODED WORD : ${c.encoded}`,
        "> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "> DECODE THE WORD AND TYPE YOUR ANSWER",
        "> 3 ATTEMPTS BEFORE TERMINAL LOCKS",
      );
      return;
    }

    // Extract
    if (trimmed === "extract") {
      if (stage !== "decrypted") {
        addLines("> ERROR: FILE NOT DECRYPTED — COMPLETE CIPHER CHALLENGE FIRST");
        triggerGlitch();
        return;
      }
      addLines("> EXTRACTING PAYLOAD...", "> DECRYPTING LOADOUT DATA...");
      setTimeout(() => setShowLoadout(true), 800);
      setStage("extracted");
      return;
    }

    // Cipher answer check
    if (stage === "cipher" && cipher) {
      const answer = trimmed.toUpperCase();
      if (answer === cipher.word) {
        // Award Code Cracker badge
        const { data: { user } } = await supabase.auth.getUser();
        let badgeLines: string[] = [];
        if (user && !badgeAwarded) {
          await supabase.rpc("award_badge", { p_user_id: user.id, p_badge: "Code Cracker" });
          setBadgeAwarded(true);
          badgeLines = ["> 🏅 BADGE UNLOCKED: CODE CRACKER", ">    Awarded to your operator profile"];
        }
        addLines(
          `> ANSWER: ${answer}`,
          "> ✓ CIPHER SOLVED — ACCESS GRANTED",
          "> FILE DECRYPTED SUCCESSFULLY",
          ...badgeLines,
          "> TYPE 'extract' TO RETRIEVE PAYLOAD",
        );
        setStage("decrypted");
        setAttempts(0);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        triggerGlitch();
        if (newAttempts >= 3) {
          setLocked(true);
          addLines(
            `> ANSWER: ${answer}`,
            "> ✗ INCORRECT",
            "> ⚠  MAXIMUM ATTEMPTS REACHED — TERMINAL LOCKED",
            "> RELOAD THE TERMINAL TO TRY AGAIN",
          );
        } else {
          addLines(
            `> ANSWER: ${answer}`,
            `> ✗ INCORRECT — ${3 - newAttempts} ATTEMPT${3 - newAttempts !== 1 ? "S" : ""} REMAINING`,
            `> ENCODED WORD : ${cipher.encoded}  |  SHIFT: ${cipher.shift}`,
          );
        }
      }
      return;
    }

    // Unknown command
    addLines(`> COMMAND NOT RECOGNIZED: '${trimmed}'`, "> TYPE 'help' FOR AVAILABLE COMMANDS");
    triggerGlitch();

  }, [stage, cipher, attempts, locked, addLines]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
    if (e.key === "Escape") setOpen(false);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className={`${styles.terminal} ${glitch ? styles.glitch : ""}`}>

        {/* Title bar */}
        <div className={styles.titleBar}>
          <div className={styles.titleDots}>
            <span className={styles.dot} onClick={() => setOpen(false)} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <span className={styles.titleText}>CLASSIFIED_TERMINAL_v2.4 // SECURE</span>
          <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Screen */}
        <div className={styles.screen} onClick={() => inputRef.current?.focus()}>
          <div className={styles.scanline} />

          {lines.map((line, i) => (
            <div key={i} className={`${styles.line}
              ${line.includes("ACCESS GRANTED") || line.includes("✓") ? styles.lineSuccess : ""}
              ${line.includes("⚠") || line.includes("✗") || line.includes("LOCKED") ? styles.lineWarning : ""}
              ${line.includes("$") ? styles.lineInput : ""}
              ${line.includes("ENCODED WORD") || line.includes("SHIFT VALUE") || line.includes("CIPHER TYPE") ? styles.lineCipher : ""}
              ${line.includes("━") ? styles.lineDivider : ""}
            `}>
              {line}
            </div>
          ))}

          {/* Classified loadout card */}
          {showLoadout && (
            <div className={styles.loadoutCard}>
              <div className={styles.loadoutHeader}>
                <div className={styles.redacted}>████ ████████ ████</div>
                <div className={styles.classification}>{CLASSIFIED_LOADOUT.classification}</div>
                <div className={styles.loadoutTitle}>{CLASSIFIED_LOADOUT.title}</div>
                <div className={styles.loadoutMeta}>
                  <span>CLASS: {CLASSIFIED_LOADOUT.class}</span>
                  <span>OPERATOR: {CLASSIFIED_LOADOUT.operator}</span>
                  <span>CLEARANCE: {CLASSIFIED_LOADOUT.clearance}</span>
                </div>
              </div>
              <div className={styles.loadoutBody}>
                <div className={styles.attachmentLabel}>▶ ATTACHMENT MANIFEST</div>
                {CLASSIFIED_LOADOUT.attachments.map((a, i) => (
                  <div key={i} className={styles.attachment}>
                    <span className={styles.slot}>{a.slot}</span>
                    <span className={styles.slotSep}>::</span>
                    <span className={styles.slotValue}>{a.value}</span>
                  </div>
                ))}
                <div className={styles.notesLabel}>▶ OPERATOR NOTES</div>
                <div className={styles.notes}>{CLASSIFIED_LOADOUT.notes}</div>
                <div className={styles.stamp}>⚠ DESTROY AFTER READING ⚠</div>
              </div>
            </div>
          )}

          {/* Input row */}
          {inputEnabled && (
            <div className={styles.inputRow}>
              <span className={styles.prompt}>$ &gt;</span>
              <input
                ref={inputRef}
                className={styles.inputField}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
              />
              <span className={styles.cursor} />
            </div>
          )}

          {booting && <span className={styles.blink}>█</span>}
          <div ref={bottomRef} />
        </div>

        <div className={styles.footer}>
          <span>ESC TO EXIT</span>
          <span>
            {stage === "cipher" ? `CIPHER ACTIVE — ${3 - attempts} ATTEMPTS LEFT` : "SECURE CONNECTION ACTIVE"}
          </span>
          <span className={styles.footerPing}>PING: 4ms</span>
        </div>
      </div>
    </div>
  );
}
