import Hero from '@/components/landing/hero';
import Problem from '@/components/landing/problem';
import ScanForm from '@/components/landing/scan-form';
import FreeResults from '@/components/landing/free-results';
import PaidAudit from '@/components/landing/paid-audit';
import CaseStudy from '@/components/landing/case-study';
import Benefits from '@/components/landing/benefits';
import FAQ from '@/components/landing/faq';
import FinalCta from '@/components/landing/final-cta';

export default function Page() {
  return (
    <main>
      <Hero />
      <Problem />
      <ScanForm />
      <FreeResults />
      <PaidAudit />
      <CaseStudy />
      <Benefits />
      <FAQ />
      <FinalCta />
    </main>
  );
}
