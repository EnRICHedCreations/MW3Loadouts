import Link from "next/link";
import { Nav } from "@/components/Nav";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />
      <Nav />

      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => <div key={i} className={styles.heroCell} />)}
        </div>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}><span className={styles.badgeDot}>◆</span>MODERN WARFARE III · COMMUNITY RESOURCE</div>
          <h1 className={styles.heroTitle}>SHARE YOUR<br /><span className={styles.heroAccent}>LOADOUTS.</span><br />DOMINATE THE LOBBY.</h1>
          <p className={styles.heroSub}>The community-built database for Modern Warfare III builds. Browse operator loadouts, discover meta weapons, and share your own setups with the entire community.</p>
          <div className={styles.heroActions}>
            <Link href="/loadoutvault" className={styles.heroBtnPrimary}><span>◈</span> BROWSE LOADOUTS</Link>
            <Link href="/signup" className={styles.heroBtnSecondary}>+ CREATE ACCOUNT</Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.sectionLabel}><span className={styles.labelDot}>▶</span> WHY LOADOUT VAULT</div>
          <div className={styles.featureGrid}>
            {[
              { icon: "⊕", title: "UPLOAD SCREENSHOTS", desc: "Attach your in-game loadout screenshot so other operators can see exactly what you're running." },
              { icon: "◧", title: "FULL ATTACHMENT BREAKDOWN", desc: "List every slot — muzzle, barrel, stock, magazine, and more. Formatted for quick reading." },
              { icon: "◈", title: "FILTER BY CLASS", desc: "Looking for an SMG build? A sniper setup? Filter the vault by weapon class instantly." },
              { icon: "❤", title: "COMMUNITY VOTES", desc: "Like the builds that actually work. Sort by most liked to find the community's top picks." },
              { icon: "⌕", title: "SEARCH EVERYTHING", desc: "Search by weapon, attachment, author, or class. Find any build in seconds." },
              { icon: "⎘", title: "SHARE INSTANTLY", desc: "Every loadout has a direct link. Share with your squad on Discord with one tap." },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaDecor}>◈</div>
          <h2 className={styles.ctaTitle}>READY TO DEPLOY?</h2>
          <p className={styles.ctaSub}>Create an account and submit your first loadout in minutes.</p>
          <div className={styles.ctaActions}>
            <Link href="/loadoutvault" className={styles.heroBtnPrimary}>ENTER THE VAULT</Link>
            <Link href="/signup" className={styles.heroBtnSecondary}>CREATE ACCOUNT</Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>LOADOUT VAULT · MW3</span><span>·</span><span>COMMUNITY RESOURCE</span><span>·</span><span>NOT AFFILIATED WITH ACTIVISION</span>
      </footer>
    </div>
  );
}
