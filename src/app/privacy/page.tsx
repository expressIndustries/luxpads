import type { Metadata } from "next";
import { siteCopy } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

const privacyDescription = `Privacy Policy for ${siteCopy.domainDisplay}: what we collect, how we use and share data, cookies, retention, security, your choices, and contact.`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: privacyDescription,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `Privacy Policy | ${siteCopy.legalName}`,
    description: privacyDescription,
    url: absoluteUrl("/privacy"),
  },
};

function Hr() {
  return <hr className="my-10 border-stone-200" />;
}

export default function PrivacyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="text-stone-800">
        <h1 className="font-serif text-4xl text-stone-900">Privacy Policy – {siteCopy.domainDisplay}</h1>
        <p className="mt-4 text-sm text-stone-600">Last Updated: April 12, 2026</p>

        <p className="mt-6 text-sm leading-relaxed text-stone-700">
          This Privacy Policy describes how {siteCopy.domainDisplay} (“LuxPads,” “we,” “our,” or “us”) collects, uses,
          discloses, and protects information when you access or use our website, platform, and related services
          (collectively, the “Platform”).
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          By using the Platform, you consent to the practices described in this Privacy Policy.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">1. Information We Collect</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">We may collect the following categories of information:</p>

        <h3 className="mt-6 font-serif text-xl text-stone-900">A. Information You Provide</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Name, email address, phone number</li>
          <li>Account login credentials</li>
          <li>Property listing details (for Owners)</li>
          <li>Messages sent through the Platform</li>
          <li>Any other information you voluntarily provide</li>
        </ul>

        <h3 className="mt-8 font-serif text-xl text-stone-900">B. Automatically Collected Information</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>IP address</li>
          <li>Browser type and device information</li>
          <li>Pages viewed and actions taken on the Platform</li>
          <li>Referring/exit pages and timestamps</li>
        </ul>

        <h3 className="mt-8 font-serif text-xl text-stone-900">C. Cookies and Tracking Technologies</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">We use cookies, pixels, and similar technologies to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Operate and improve the Platform</li>
          <li>Analyze usage and performance</li>
          <li>Support advertising and marketing efforts</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          You may control cookies through your browser settings.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">2. How We Use Information</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">We use collected information to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Provide, operate, and maintain the Platform</li>
          <li>Facilitate communication between Owners and Renters</li>
          <li>Respond to inquiries and provide support</li>
          <li>Improve functionality, performance, and user experience</li>
          <li>Send service-related and promotional communications</li>
          <li>Detect, prevent, and address fraud, abuse, or security issues</li>
          <li>Comply with legal obligations</li>
        </ul>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">3. Sharing of Information</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">We may share information as follows:</p>

        <h3 className="mt-6 font-serif text-xl text-stone-900">A. Between Users</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">
          Information you provide (such as name, contact details, and listing information) may be shared with other
          Users to facilitate transactions and communication.
        </p>

        <h3 className="mt-8 font-serif text-xl text-stone-900">B. Service Providers</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">
          We may share information with third-party vendors that assist with:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Hosting and infrastructure</li>
          <li>Email delivery</li>
          <li>Analytics</li>
          <li>Payment processing (if applicable)</li>
        </ul>

        <h3 className="mt-8 font-serif text-xl text-stone-900">C. Legal Compliance</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">We may disclose information if required to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Comply with applicable laws or legal processes</li>
          <li>Enforce our Terms of Service</li>
          <li>Protect the rights, property, or safety of LuxPads or others</li>
        </ul>

        <h3 className="mt-8 font-serif text-xl text-stone-900">D. Business Transfers</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">
          In the event of a merger, sale, or asset transfer, user information may be transferred as part of the
          transaction.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">4. No Sale of Personal Information</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads does not sell personal information to third parties for monetary consideration.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">5. Data Retention</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">We retain information for as long as necessary to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Provide the Platform</li>
          <li>Fulfill the purposes described in this Policy</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes and enforce agreements</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          We may retain anonymized or aggregated data indefinitely.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">6. Security</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          We implement reasonable administrative, technical, and physical safeguards to protect information. However:
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">7. Third-Party Services and Links</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          The Platform may contain links to third-party websites or services. LuxPads is not responsible for the
          privacy practices or content of such third parties.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">Use of third-party services is at your own risk.</p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">8. User Communications</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">By using the Platform, you consent to receive:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Transactional emails (e.g., account updates, inquiries)</li>
          <li>Platform notifications</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          You may opt out of marketing communications where applicable.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">9. Your Choices</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">You may:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Update or correct account information</li>
          <li>Request deletion of your account (subject to legal and operational requirements)</li>
          <li>Adjust cookie preferences via browser settings</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">To make requests, contact us using the information below.</p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">10. Children’s Privacy</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          The Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal
          information from children.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">11. International Users</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          If you access the Platform from outside the United States, you understand that your information may be
          transferred to and processed in the United States.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">12. Changes to This Policy</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated “Last
          Updated” date.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          Continued use of the Platform constitutes acceptance of the updated Policy.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">13. Contact</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          If you have questions or requests regarding this Privacy Policy, contact:
        </p>
        <p className="mt-3 text-sm font-medium text-stone-900">{siteCopy.domainDisplay}</p>
        <p className="mt-2 text-sm text-stone-700">
          {contactEmail ? (
            <a href={`mailto:${contactEmail}`} className="font-medium text-amber-900 underline decoration-amber-900/40 underline-offset-4">
              {contactEmail}
            </a>
          ) : (
            <span className="text-stone-600">[Insert Contact Email]</span>
          )}
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">⚠️ Important notice</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads acts solely as a marketplace platform connecting Users. Information shared with other Users is
          provided at your own discretion and risk.
        </p>

        <Hr />
      </article>
    </div>
  );
}
