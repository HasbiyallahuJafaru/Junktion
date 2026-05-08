import styles from './WaveDivider.module.css'

interface WaveDividerProps {
  fill:     string
  bg:       string
  flip?:    boolean
  shimmer?: boolean
}

export function WaveDivider({ fill, bg, flip = false, shimmer = false }: WaveDividerProps) {
  const id = fill.replace(/[^a-z0-9]/gi, '')

  return (
    <div
      className={styles.wrap}
      style={{ background: bg, transform: flip ? 'scaleY(-1)' : undefined }}
      aria-hidden="true"
    >
      <svg
        className={styles.svg}
        viewBox="0 0 1440 88"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {shimmer && (
          <defs>
            <linearGradient id={`hi-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
              <stop offset="55%"  stopColor="white" stopOpacity="0.06" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        )}

        {/* Layer 1 — deep base, slowest */}
        <path fill={fill} opacity="0.45">
          <animate attributeName="d" dur="11s" repeatCount="indefinite"
            values="
              M0 55 C200 20 400 75 600 45 C800 15 1040 70 1240 40 C1320 28 1390 35 1440 38 L1440 88 L0 88Z;
              M0 42 C180 68 420 18 660 52 C860 78 1060 22 1280 50 C1360 62 1410 44 1440 48 L1440 88 L0 88Z;
              M0 55 C200 20 400 75 600 45 C800 15 1040 70 1240 40 C1320 28 1390 35 1440 38 L1440 88 L0 88Z
            "
          />
        </path>

        {/* Layer 2 — mid wave, medium speed */}
        <path fill={fill} opacity="0.55">
          <animate attributeName="d" dur="7.5s" repeatCount="indefinite" begin="-2.5s"
            values="
              M0 62 C160 36 380 78 580 50 C760 24 980 66 1180 44 C1320 30 1400 52 1440 56 L1440 88 L0 88Z;
              M0 48 C240 74 460 22 680 58 C880 84 1080 28 1300 54 C1380 66 1420 40 1440 44 L1440 88 L0 88Z;
              M0 62 C160 36 380 78 580 50 C760 24 980 66 1180 44 C1320 30 1400 52 1440 56 L1440 88 L0 88Z
            "
          />
        </path>

        {/* Layer 3 — top fill, fastest */}
        <path fill={fill}>
          <animate attributeName="d" dur="5s" repeatCount="indefinite" begin="-1.2s"
            values="
              M0 68 C140 48 300 82 480 60 C660 38 840 72 1020 54 C1180 38 1340 62 1440 64 L1440 88 L0 88Z;
              M0 56 C180 76 360 42 560 66 C740 86 920 48 1120 68 C1280 82 1380 56 1440 58 L1440 88 L0 88Z;
              M0 68 C140 48 300 82 480 60 C660 38 840 72 1020 54 C1180 38 1340 62 1440 64 L1440 88 L0 88Z
            "
          />
        </path>

        {/* Shimmer — only when enabled */}
        {shimmer && (
          <path fill={`url(#hi-${id})`}>
            <animate attributeName="d" dur="5s" repeatCount="indefinite" begin="-1.2s"
              values="
                M0 68 C140 48 300 82 480 60 C660 38 840 72 1020 54 C1180 38 1340 62 1440 64 L1440 88 L0 88Z;
                M0 56 C180 76 360 42 560 66 C740 86 920 48 1120 68 C1280 82 1380 56 1440 58 L1440 88 L0 88Z;
                M0 68 C140 48 300 82 480 60 C660 38 840 72 1020 54 C1180 38 1340 62 1440 64 L1440 88 L0 88Z
              "
            />
            <animate attributeName="opacity" dur="3.8s" repeatCount="indefinite"
              values="0.5;1;0.4;0.9;0.5" begin="-0.8s"
            />
          </path>
        )}
      </svg>
    </div>
  )
}
