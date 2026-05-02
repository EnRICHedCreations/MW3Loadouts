import Link from "next/link";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <div className={styles.logoEyebrow}>CALL OF DUTY: MODERN WARFARE IV</div>
            <h1 className={styles.logoTitle}>LOADOUT VAULT</h1>
            <div className={styles.logoSub}>BUILT BY RUSH GAMBINO</div>
          </div>
          <div className={styles.navLinks}>
            <Link href="/loadoutvault" className={styles.navLink}>BROWSE LOADOUTS</Link>
            <Link href="/submit" className={styles.navCta}>+ SUBMIT LOADOUT</Link>
          </div>
        </div>
        <div className={styles.navDivider} />
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot}>◆</span>
            MODERN WARFARE III · COMMUNITY RESOURCE
          </div>
          <h1 className={styles.heroTitle}>
            SHARE YOUR<br />
            <span className={styles.heroAccent}>LOADOUTS.</span><br />
            DOMINATE THE LOBBY.
          </h1>
          <p className={styles.heroSub}>
            The community-built database for Modern Warfare III builds.
            Browse operator loadouts, discover meta weapons, and share
            your own setups with the entire community.
          </p>
          <div className={styles.heroActions}>
            <Link href="/loadoutvault" className={styles.heroBtnPrimary}>
              <span>◈</span> BROWSE LOADOUTS
            </Link>
            <Link href="/submit" className={styles.heroBtnSecondary}>
              + SUBMIT YOUR BUILD
            </Link>
          </div>
        </div>
        <div className={styles.heroGrid} aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className={styles.heroGridCell} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelDot}>▶</span> WHY LOADOUT VAULT
          </div>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⊕</div>
              <h3 className={styles.featureTitle}>UPLOAD SCREENSHOTS</h3>
              <p className={styles.featureDesc}>
                Attach your in-game loadout screenshot directly so other operators can see exactly what you&apos;re running — no guesswork.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>◧</div>
              <h3 className={styles.featureTitle}>FULL ATTACHMENT BREAKDOWN</h3>
              <p className={styles.featureDesc}>
                List every slot — muzzle, barrel, stock, magazine, and more. Each loadout is formatted for quick reading in the heat of the moment.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>◈</div>
              <h3 className={styles.featureTitle}>FILTER BY CLASS</h3>
              <p className={styles.featureDesc}>
                Looking for an SMG build? A sniper setup? Filter the entire vault by weapon class to find exactly what you need.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>❤</div>
              <h3 className={styles.featureTitle}>COMMUNITY VOTES</h3>
              <p className={styles.featureDesc}>
                Like the builds that actually work. Sort by most liked to instantly surface the loadouts the community trusts most.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⌕</div>
              <h3 className={styles.featureTitle}>SEARCH EVERYTHING</h3>
              <p className={styles.featureDesc}>
                Search by weapon name, attachment, author tag, or class. Find the exact build you saw someone running in a clip.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⎘</div>
              <h3 className={styles.featureTitle}>SHARE INSTANTLY</h3>
              <p className={styles.featureDesc}>
                Every loadout has a direct link. Share your build with your squad in Discord, Reddit, or anywhere else with one tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaDecor} aria-hidden="true">◈</div>
          <h2 className={styles.ctaTitle}>READY TO DEPLOY?</h2>
          <p className={styles.ctaSub}>
            Join the community. Browse proven builds or share your own setup with operators worldwide.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/loadoutvault" className={styles.heroBtnPrimary}>
              ENTER THE VAULT
            </Link>
            <Link href="/submit" className={styles.heroBtnSecondary}>
              SUBMIT A LOADOUT
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>LOADOUT VAULT · MW3</span>
        <span>·</span>
        <span>COMMUNITY RESOURCE</span>
        <span>·</span>
        <span>NOT AFFILIATED WITH ACTIVISION</span>
      </footer>
    </div>
  );
}