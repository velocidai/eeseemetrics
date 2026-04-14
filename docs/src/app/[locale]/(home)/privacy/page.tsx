import { createMetadata, createOGImageUrl } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "Eesee Metrics privacy policy - how we protect your data",
  openGraph: {
    images: [createOGImageUrl("Privacy Policy", "Eesee Metrics privacy policy - how we protect your data")],
  },
  twitter: {
    images: [createOGImageUrl("Privacy Policy", "Eesee Metrics privacy policy - how we protect your data")],
  },
});

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg">
          Last updated: April 5, 2026
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Overview</h2>
        <p>
          Eesee Metrics is a privacy-friendly web analytics platform. This privacy policy explains how we collect,
          process, and protect data — both for visitors to websites using Eesee Metrics, and for customers who
          use the Eesee Metrics service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data We Collect About Website Visitors</h2>
        <p>
          When Eesee Metrics is installed on a website, we collect the following anonymous data about visits:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Page data:</strong> URLs visited, page titles, referrers, and query parameters
          </li>
          <li>
            <strong>Visit information:</strong> Session duration, entry and exit pages
          </li>
          <li>
            <strong>Device information:</strong> Browser type and version, operating system, screen resolution, device type
          </li>
          <li>
            <strong>Location data:</strong> Country and region (derived from IP address, which is not stored)
          </li>
          <li>
            <strong>Campaign data:</strong> UTM parameters (source, medium, campaign, term, content) when present in the URL
          </li>
          <li>
            <strong>Custom events:</strong> If configured by the website owner
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Process IP Addresses</h2>
        <p>
          IP addresses are used only temporarily to determine geographic location (country and region). The actual
          IP address is never stored in our database. This preserves visitor anonymity while still providing
          geographic insights to website owners.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Anonymous Session and User IDs</h2>
        <p>
          Eesee Metrics generates anonymous session and user identifiers using a daily-rotating salt. These IDs
          contain no personally identifiable information and cannot be used to track individuals across days or
          sites. They exist solely to distinguish sessions and user journeys within a single day.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">No Cookies</h2>
        <p>
          Eesee Metrics does not use cookies or local storage. Websites using Eesee Metrics typically do not
          require a cookie consent banner under GDPR, CCPA, or the ePrivacy Directive.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How Visitor Data Is Used</h2>
        <p>Visitor data is used exclusively to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide website owners with anonymous, aggregated statistics about their visitors</li>
          <li>Show traffic trends, referral sources, and user behavior patterns</li>
          <li>Track marketing campaign performance via UTM parameters</li>
          <li>Power session replay, funnel analysis, and goal tracking features</li>
          <li>Generate automated AI reports and anomaly alerts for site owners</li>
        </ul>
        <p>We do not sell, share, or use visitor data for advertising or profiling.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
        <p>
          Analytics data retention depends on the plan:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Starter:</strong> 2 years</li>
          <li><strong>Pro:</strong> 3 years</li>
          <li><strong>Scale:</strong> 5 years</li>
        </ul>
        <p>
          Session replay data is retained for 30 days on all plans. After the retention period,
          data is automatically and permanently deleted.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Ownership</h2>
        <p>
          You retain full ownership of your analytics data. Eesee Metrics processes it solely to provide the
          analytics service described in these terms. We do not mine, sell, or transfer your data to any
          third party.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">GDPR and Privacy Regulation Compliance</h2>
        <p>Eesee Metrics is designed to be compliant with GDPR, CCPA, and the ePrivacy Directive:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We collect the minimum data needed to provide analytics</li>
          <li>We do not use cookies or persistent identifiers</li>
          <li>We do not track visitors across different websites</li>
          <li>We do not collect or store data that could directly identify individuals</li>
          <li>We do not share or sell analytics data</li>
          <li>IP addresses are processed in memory only and never stored</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data About Eesee Metrics Customers</h2>
        <p>
          When you create an Eesee Metrics account, we collect your email address and any profile information
          you provide. This data is used to operate your account, send product updates, and provide support.
          We use industry-standard security measures to protect account data and do not share it with third parties
          except as required to operate the service (e.g., payment processing via Stripe).
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Security</h2>
        <p>
          We implement appropriate technical and organisational security measures to protect data against
          unauthorised access, loss, or disclosure. Analytics data is stored in isolated ClickHouse databases
          with access restricted to authenticated API requests.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Material changes will be communicated by updating
          the date at the top of this page. Continued use of the service after changes constitutes acceptance
          of the updated policy.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <p>
          Questions about this policy or our data practices:{" "}
          <a href="mailto:hello@eeseemetrics.com" className="text-[#2FC7B8] hover:text-[#2FC7B8]/80">
            hello@eeseemetrics.com
          </a>
        </p>
      </div>
    </div>
  );
}
