import Image from 'next/image'
import styles from './Hero.module.css'

const ORBIT_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=240&h=240&fit=crop',
    alt: 'Chicken shawarma wrap',
  },
  {
    src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=240&h=240&fit=crop',
    alt: 'Loaded burger',
  },
  {
    src: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=240&h=240&fit=crop',
    alt: 'Jollof pasta',
  },
]

/** Three food images orbiting on an elliptical CSS animation path */
export function OrbitRing() {
  return (
    <div className={styles.orbitRing} aria-hidden="true">
      {ORBIT_ITEMS.map((item, i) => (
        <div key={i} className={`${styles.orbitItem} orbit-item-${i + 1}`}>
          <Image
            src={item.src}
            alt={item.alt}
            width={120}
            height={120}
            priority={i === 0}
            unoptimized
          />
        </div>
      ))}
    </div>
  )
}
