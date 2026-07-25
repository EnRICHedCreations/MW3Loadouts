"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./TerminalHack.module.css";

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a"
];

const CLASSIFIED_LOADOUT = {
  title: "THE REAPER",
  class: "Assault",
  attachments: [
    { slot: "MUZZLE",      value: "Shadowstrike Suppressor" },
    { slot: "BARREL",      value: "Bruen Venom Long Barrel" },
    { slot: "OPTIC",       value: "Slate Reflector" },
    { slot: "UNDERBARREL", value: "DR-6 Handstop" },
    { slot: "MAGAZINE",    value: "45 Round Mag" },
  ],
  notes: "High-value target elimination. Subsonic. No trace. Run this when you need to disappear into the lobby and not be found until the killcam.",
  classification: "TOP SECRET // OPERATOR EYES ONLY",
  operator: "RUSH GAMBINO",
  clearance: "LEVEL 5",
};

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

const COMMANDS: Record<string, string[]> = {
  scan: [
    "> SCANNING CLASSIFIED NODES...",
    "> 1 ENCRYPTED FILE DETECTED",
    "> FILE: LOADOUT_REAPER_CLASSIFIED.enc",
    "> TYPE 'decrypt' TO PROCEED",
  ],
  decrypt: [
    "> DECRYPTING FILE...",
    "> [████████████████████] 100%",
    "> DECRYPTION COMPLETE",
    "> TYPE 'extract' TO RETRIEVE PAYLOAD",
  ],
  extract: ["__SHOW_LOADOUT__"],
  help: [
    "> AVAILABLE COMMANDS:",
    ">   scan     — scan for classified files",
    ">   decrypt  — decrypt located file",
    ">   extract  — extract decrypted payload",
    ">   clear    — clear terminal",
    ">   exit     — close terminal",
  ],
  clear: ["__CLEAR__"],
  exit: ["__EXIT__"],
};

export function TerminalHack() {
  const [open, setOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [showLoadout, setShowLoadout] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const konamiRef = useRef<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    setLines((prev) => [...prev, `> $ ${trimmed}`]);

    if (trimmed === "exit") { setTimeout(() => setOpen(false), 300); return; }
    if (trimmed === "clear") { setLines([]); return; }

    const response = COMMANDS[trimmed];
    if (!response) {
      setLines((prev) => [...prev, `> COMMAND NOT RECOGNIZED: '${trimmed}'`, "> TYPE 'help' FOR AVAILABLE COMMANDS", ""]);
      triggerGlitch();
      return;
    }
    if (response[0] === "__SHOW_LOADOUT__") {
      setLines((prev) => [...prev, "> PAYLOAD EXTRACTED. DECRYPTING...", ""]);
      setTimeout(() => setShowLoadout(true), 600);
      return;
    }
    setLines((prev) => [...prev, ...response, ""]);
  }, []);

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

          {/* Boot lines */}
          {lines.map((line, i) => (
            <div key={i} className={`${styles.line} ${line.includes("ACCESS GRANTED") ? styles.lineSuccess : line.includes("⚠") ? styles.lineWarning : line.includes("$") ? styles.lineInput : ""}`}>
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

          {/* Cursor / input */}
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
          <span>SECURE CONNECTION ACTIVE</span>
          <span className={styles.footerPing}>PING: 4ms</span>
        </div>
      </div>
    </div>
  );
}
