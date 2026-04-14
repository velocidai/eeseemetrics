"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What exactly do I get with this lifetime deal?",
    a: "Lifetime access to the eesee metrics Starter plan at the pageview tier you select. All current Starter features plus all future Starter updates. One-time payment — no recurring charges, ever.",
  },
  {
    q: 'Is this really lifetime? What does "lifetime" mean?',
    a: "Lifetime of the product. As long as eesee metrics exists, your access continues. We're self-funded and building for the long term — we're not going anywhere.",
  },
  {
    q: "What happens if I need more pageviews than my LTD tier?",
    a: "It depends on your tier. If you're on the 100K or 250K tier, you can upgrade to a higher Starter tier (monthly/annual) and your LTD stays as a permanent fallback. If you're on the 500K tier, Starter doesn't go higher — your next step is Pro, which also adds session replay, funnels, AI reports, and more. Either way, if you ever cancel, you automatically fall back to your lifetime plan at $0/month. No data lost, ever.",
  },
  {
    q: "Can I upgrade to Pro or Scale later?",
    a: "Yes. Your Starter LTD stays active forever. To access Pro or Scale features, you subscribe at the regular monthly/annual price. If you cancel that subscription, you automatically fall back to your Starter lifetime plan — no re-purchase needed.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes, 30 days. If you're not happy for any reason, email hello@eeseemetrics.com and we'll refund you in full. No questions asked.",
  },
  {
    q: "Do I need a cookie consent banner with eesee?",
    a: "No. eesee doesn't use cookies and doesn't collect personal data. No consent banner required. Cookieless by design, not by configuration.",
  },
  {
    q: "Where is my data stored?",
    a: "In the EU, on European-owned infrastructure (Hetzner, Germany). Your data never leaves the EU.",
  },
  {
    q: "How is this different from Google Analytics?",
    a: "eesee is privacy-first, cookieless, EU-hosted, and GDPR compliant by design. Google Analytics has been ruled non-compliant with GDPR by multiple EU data protection authorities (France, Austria, Germany). eesee gives you the analytics you need without the legal risk.",
  },
  {
    q: "How is this different from Plausible or Fathom?",
    a: "eesee includes uptime monitoring, custom events, and goals in the Starter plan — features Plausible and Fathom charge extra for or don't offer. Pro adds session replay, funnels, weekly AI reports, anomaly alerts, and full MCP integration. And with this LTD, the base plan is a one-time payment instead of monthly.",
  },
  {
    q: "Is eesee open source?",
    a: "Yes. The full source code is available on GitHub at github.com/velocidai/eeseemetrics. You can inspect exactly how your data is handled.",
  },
  {
    q: "How many lifetime deals are available?",
    a: "150 slots at $49, 100 at $79, and 50 at $129. Once a tier sells out, it's gone. We won't re-run this deal.",
  },
  {
    q: "I already have a free trial. Can I apply the LTD to my account?",
    a: "Yes. Purchase the LTD and it applies to your existing account.",
  },
  {
    q: "Can I use this on a client's website?",
    a: "Yes. The site you track is yours to choose and you can change it at any time from your dashboard.",
  },
  {
    q: "What happens if I hit my monthly pageview limit?",
    a: "You'll receive an email notification at 80% usage. If you go over, we give you a 10% grace buffer (so 110K on the 100K tier). Beyond that, tracking pauses until the next month — your dashboard and all historical data remain fully accessible. No overage charges, ever.",
  },
  {
    q: "What if I upgrade to Pro or Scale and then cancel?",
    a: "Your lifetime deal is paused (not deleted) while you're on a Pro or Scale subscription. If you cancel, you automatically fall back to your Starter lifetime plan. Pro or Scale-specific data (AI reports, funnel history) becomes read-only — you can view past data but new data generates at the Starter tier. No data is deleted.",
  },
  {
    q: "So my lifetime deal is basically a permanent safety net?",
    a: "Exactly. No matter what you do — upgrade, downgrade, cancel, come back in two years — your Starter lifetime plan is always there. It never expires and never costs another cent.",
  },
];

export function LtdFaq() {
  return (
    <div className="bg-neutral-100/50 dark:bg-neutral-800/20 backdrop-blur-sm border border-neutral-300/50 dark:border-neutral-800/50 rounded-xl overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left px-6 py-4 font-medium">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
