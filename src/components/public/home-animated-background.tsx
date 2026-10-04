import styles from "./home-animated-background.module.css";

const particles = [
  { left: "8%", top: "9%", delay: "-7s" },
  { left: "21%", top: "17%", delay: "-13s" },
  { left: "37%", top: "7%", delay: "-4s" },
  { left: "54%", top: "21%", delay: "-16s" },
  { left: "72%", top: "11%", delay: "-9s" },
  { left: "91%", top: "24%", delay: "-19s" },
  { left: "14%", top: "38%", delay: "-11s" },
  { left: "31%", top: "47%", delay: "-2s" },
  { left: "63%", top: "42%", delay: "-15s" },
  { left: "83%", top: "53%", delay: "-6s" },
  { left: "7%", top: "71%", delay: "-17s" },
  { left: "44%", top: "76%", delay: "-8s" },
  { left: "75%", top: "81%", delay: "-12s" },
  { left: "95%", top: "91%", delay: "-3s" },
];

export function HomeAnimatedBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.atmosphere} />
      <div className={styles.grid} />
      <div className={styles.glowPrimary} />
      <div className={styles.glowSecondary} />
      <svg
        className={styles.flows}
        viewBox="0 0 1440 2200"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path className={styles.flow} d="M-120 520 C180 450 260 700 520 610 S900 390 1130 500 1370 720 1570 610" />
        <path className={styles.flowSecondary} d="M-100 1080 C150 980 310 1180 550 1090 S900 900 1120 1010 1370 1190 1550 1080" />
        <path className={styles.flow} d="M-90 1730 C190 1620 330 1820 590 1730 S950 1510 1170 1640 1390 1830 1540 1720" />
      </svg>
      <div className={styles.particles}>
        {particles.map((particle, index) => (
          <span
            key={index}
            className={styles.particle}
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
            }}
          />
        ))}
      </div>
      <div className={styles.vignette} />
    </div>
  );
}
