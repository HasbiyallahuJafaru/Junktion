import dynamic             from 'next/dynamic'
import { Nav }             from '@/app/(site)/components/nav/Nav'
import { Hero }            from '@/app/(site)/components/hero/Hero'
import { Marquee }         from '@/app/(site)/components/marquee/Marquee'
import { Story }           from '@/app/(site)/components/story/Story'
import { Contact }         from '@/app/(site)/components/contact/Contact'
import { Footer }          from '@/app/(site)/components/footer/Footer'
import { WaveDivider }     from '@/app/(site)/components/WaveDivider'
import { BlockTransition } from '@/app/(site)/components/BlockTransition'

/* Lazy-load the menu section — defers JS + image fetches until needed */
const MenuSection = dynamic(
  () => import('@/app/(site)/components/menu/MenuSection').then((m) => ({ default: m.MenuSection })),
  {
    loading: () => (
      <div style={{ background: '#F5F0EB', padding: '80px 0', display: 'flex', justifyContent: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F15A22', display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F15A22', display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite 0.2s' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F15A22', display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite 0.4s' }} />
      </div>
    ),
    ssr: false,
  }
)

export default function Home() {
  return (
    <main className="bg-base min-h-screen">
      <Nav />
      <Hero />
      <Marquee />

      {/* dark → light  (shimmer on) */}
      <WaveDivider bg="#0D0D0D" fill="#F5F0EB" shimmer />
      <MenuSection />

      {/* light → dark  (plain curves) */}
      <WaveDivider bg="#F5F0EB" fill="#0D0D0D" />
      <Story />

      {/* story → contact  (block assembly) */}
      <BlockTransition bg="#0D0D0D" fill="#111111" />
      <Contact />

      {/* contact → footer  (plain curves) */}
      <WaveDivider bg="#111111" fill="#080808" />
      <Footer />
    </main>
  )
}
