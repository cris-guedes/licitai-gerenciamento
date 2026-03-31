import { redirect } from "next/navigation"
import { getServerSession } from "@/server/shared/infra/auth/get-server-session"
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository"
import { Navbar } from "@/client/features/landing-page/components/Navbar";
import { Hero } from "@/client/features/landing-page/components/Hero";
import { SocialProof } from "@/client/features/landing-page/components/SocialProof";
import { Features } from "@/client/features/landing-page/components/Features";
import { Capabilities } from "@/client/features/landing-page/components/Capabilities";
import { Testimonials } from "@/client/features/landing-page/components/Testimonials";
import { UseCases } from "@/client/features/landing-page/components/UseCases";
import { CTA } from "@/client/features/landing-page/components/CTA";
import { Footer } from "@/client/features/landing-page/components/Footer";

export default async function LandingPage() {
  const session = await getServerSession()

  if (session?.user) {
    const repo = new PrismaMembershipRepository()
    const membership = await repo.findFirstByUserId({ userId: session.user.id })

    if (membership?.companyMemberships[0]) {
      redirect(`/org/${membership.organizationId}/${membership.companyMemberships[0].companyId}`)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-neutral-soft font-sans selection:bg-brand-yellow selection:text-brand-obsidian">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <Hero />
        
        <section id="social-proof">
          <SocialProof />
        </section>
        
        <section id="features">
          <Features />
        </section>
        
        <section id="capabilities">
          <Capabilities />
        </section>
        
        <section id="testimonials">
          <Testimonials />
        </section>
        
        <section id="use-cases">
          <UseCases />
        </section>
        
        <section id="final-cta">
          <CTA />
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
