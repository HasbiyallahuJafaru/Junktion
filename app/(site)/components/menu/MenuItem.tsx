import Image from 'next/image'
import { Plus } from 'lucide-react'
import styles from './MenuSection.module.css'

interface Props {
  item: {
    id: string
    name: string
    description: string
    price: number
    category: string
    imageUrl: string
    isFeatured: boolean
  }
  index: number
  onAdd: () => void
  formatPrice: (k: number) => string
}

/** Single menu card — image, name, description, price, add button */
export function MenuItem({ item, index, onAdd, formatPrice }: Props) {
  return (
    <article
      className={`${styles.item} ${index % 5 === 0 ? styles.itemWide : ''}`}
      aria-label={item.name}
    >
      {item.isFeatured && (
        <span className={styles.featuredBadge}>Featured</span>
      )}

      <div className={styles.imageWrap}>
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className={styles.image}
          unoptimized={item.imageUrl.includes('unsplash')}
        />
      </div>

      <div className={styles.itemBody}>
        <div className={styles.itemMeta}>
          <h3 className={styles.itemName}>{item.name}</h3>
          <p className={styles.itemDesc}>{item.description}</p>
        </div>

        <div className={styles.itemFooter}>
          <span className={styles.price}>{formatPrice(item.price)}</span>
          <button
            onClick={onAdd}
            className={styles.addBtn}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  )
}
