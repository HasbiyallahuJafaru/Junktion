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
  onAdd: () => void
  formatPrice: (k: number) => string
}

/** Single menu card — image, name, description, price, add button */
export function MenuItem({ item, onAdd, formatPrice }: Props) {
  return (
    <article className={styles.card} aria-label={item.name}>
      <div className={styles.imgArea}>
        {item.isFeatured && (
          <span className={styles.badge}>Featured</span>
        )}
        <div className={styles.imgInner}>
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 900px) 33vw, 25vw"
            className={styles.img}
          />
        </div>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.nameRow}>
          <h3 className={styles.itemName}>{item.name}</h3>
          <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
        </div>
        <p className={styles.itemDesc}>{item.description}</p>
        <button
          onClick={onAdd}
          className={styles.addBtn}
          aria-label={`Add ${item.name} to cart`}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add
        </button>
      </div>
    </article>
  )
}
