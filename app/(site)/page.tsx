import { Nav }         from '@/app/(site)/components/nav/Nav'
import { Hero }        from '@/app/(site)/components/hero/Hero'
import { Marquee }     from '@/app/(site)/components/marquee/Marquee'
import { MenuSection } from '@/app/(site)/components/menu/MenuSection'
import { Story }       from '@/app/(site)/components/story/Story'
import { Contact }     from '@/app/(site)/components/contact/Contact'
import { Footer }      from '@/app/(site)/components/footer/Footer'

export default function Home() {
  return (
    <main className="bg-base min-h-screen">
      <Nav />
      <Hero />
      <Marquee />
      <MenuSection />
      <Story />
      <Contact />
      <Footer />
    </main>
  )
}
