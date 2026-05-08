import { Nav } from '@/app/(site)/components/nav/Nav'
import { Hero } from '@/app/(site)/components/hero/Hero'

/** Home page — all section components are added here in subsequent phases. */
export default function Home() {
  return (
    <main className="bg-base min-h-screen">
      <Nav />
      <Hero />
      {/* Phases 3–8 added here */}
    </main>
  )
}
