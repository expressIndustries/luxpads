import type { Metadata } from "next";
import { siteCopy } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

const termsDescription = `Terms of Service for ${siteCopy.domainDisplay}: platform role, eligibility, listings, payments, liability, Colorado law, and contact.`;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: termsDescription,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `Terms of Service | ${siteCopy.legalName}`,
    description: termsDescription,
    url: absoluteUrl("/terms"),
  },
};

function Hr() {
  return <hr className="my-10 border-stone-200" />;
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="text-stone-800">
        <h1 className="font-serif text-4xl text-stone-900">Terms of Service – {siteCopy.domainDisplay}</h1>
        <p className="mt-4 text-sm text-stone-600">Last Updated: April 12, 2026</p>

        <p className="mt-6 text-sm leading-relaxed text-stone-700">
          These Terms of Service (“Terms”) constitute a legally binding agreement between you (“User,” “you,” or “your”)
          and {siteCopy.domainDisplay} (“LuxPads,” “we,” “our,” or “us”) governing your access to and use of the LuxPads
          website, platform, and related services (collectively, the “Platform”).
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by
          these Terms. If you do not agree, you must not use the Platform.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">1. Platform Role and No Agency</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads is a technology platform only that facilitates introductions and communications between property owners
          (“Owners”) and prospective renters or guests (“Renters”).
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">LuxPads:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Does not own, lease, manage, control, or operate any properties listed on the Platform</li>
          <li>Is not a party to any rental agreement or transaction between Users</li>
          <li>Does not act as an agent, broker, insurer, or fiduciary for any User</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          All transactions are solely between Owners and Renters. Users are independently responsible for all
          interactions, agreements, and outcomes.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">2. Eligibility and Account Responsibility</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">You represent and warrant that:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>You are at least 18 years old</li>
          <li>You have the legal capacity to enter into binding agreements</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">You agree to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain the confidentiality of your account credentials</li>
          <li>Accept full responsibility for all activity under your account</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads reserves the right, in its sole discretion, to suspend or terminate any account at any time, with or
          without notice.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">3. Listings and User Content</h2>
        <h3 className="mt-6 font-serif text-xl text-stone-900">Owner Responsibilities</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">Owners are solely responsible for:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>The accuracy, completeness, and legality of listings</li>
          <li>Compliance with all applicable laws, ordinances, zoning rules, and licensing requirements</li>
          <li>The condition, safety, and suitability of any listed property</li>
        </ul>
        <h3 className="mt-8 font-serif text-xl text-stone-900">Renter Responsibilities</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">Renters are solely responsible for:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Evaluating listings and determining suitability</li>
          <li>Entering into agreements with Owners at their own risk</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads does not verify, endorse, or guarantee any listing or User.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">4. No Verification; Assumption of Risk</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">LuxPads does not:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Independently verify User identities, listings, or property conditions</li>
          <li>Conduct background checks or screening</li>
          <li>Guarantee the accuracy, safety, legality, or availability of any listing</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          You expressly acknowledge and agree that your use of the Platform is at your sole risk.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">5. Payments and Transactions</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads may provide tools for communication or facilitation but:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Is not a payment processor or escrow agent</li>
          <li>Does not collect, hold, or manage funds unless explicitly stated</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          All financial transactions, cancellations, refunds, and disputes are solely between Users. LuxPads bears no
          responsibility for any payment-related issues.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">6. Prohibited Conduct</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">You agree not to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Violate any applicable law or regulation</li>
          <li>Provide false, misleading, or fraudulent information</li>
          <li>Circumvent the Platform for unlawful or deceptive purposes</li>
          <li>Interfere with or disrupt the Platform or its security</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads may investigate and take any action it deems appropriate, including termination and referral to law
          enforcement.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">7. Intellectual Property</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          All Platform content, including software, text, graphics, logos, and design, is the property of LuxPads or
          its licensors and is protected by applicable intellectual property laws.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          No rights are granted except as expressly stated. Unauthorized use is strictly prohibited.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">8. Disclaimer of Warranties</h2>
        <p className="mt-4 text-sm font-medium leading-relaxed text-stone-800">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE PLATFORM IS PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-stone-800">
          <li>MERCHANTABILITY</li>
          <li>FITNESS FOR A PARTICULAR PURPOSE</li>
          <li>NON-INFRINGEMENT</li>
          <li>ACCURACY OR RELIABILITY OF CONTENT</li>
        </ul>
        <p className="mt-4 text-sm font-medium leading-relaxed text-stone-800">LuxPads does not warrant that:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-stone-800">
          <li>The Platform will be uninterrupted or error-free</li>
          <li>Listings are accurate or reliable</li>
          <li>Any User will perform as expected</li>
        </ul>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">9. Limitation of Liability</h2>
        <p className="mt-4 text-sm font-medium leading-relaxed text-stone-800">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUXPADS SHALL NOT BE LIABLE FOR ANY:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-stone-800">
          <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
          <li>LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL</li>
          <li>PERSONAL INJURY, PROPERTY DAMAGE, OR OTHER HARM</li>
        </ul>
        <p className="mt-4 text-sm font-medium leading-relaxed text-stone-800">ARISING OUT OF OR RELATED TO:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-stone-800">
          <li>YOUR USE OF THE PLATFORM</li>
          <li>ANY LISTING OR PROPERTY</li>
          <li>ANY INTERACTION OR AGREEMENT BETWEEN USERS</li>
        </ul>
        <p className="mt-4 text-sm font-medium leading-relaxed text-stone-800">
          IN NO EVENT SHALL LUXPADS’ TOTAL LIABILITY EXCEED THE GREATER OF:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-stone-800">
          <li>$100 USD, OR</li>
          <li>THE AMOUNT YOU PAID TO LUXPADS (IF ANY) IN THE PRIOR 12 MONTHS</li>
        </ul>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">10. Indemnification</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          You agree to defend, indemnify, and hold harmless LuxPads, its affiliates, officers, directors, employees,
          contractors, and agents from and against any and all claims, demands, damages, losses, liabilities,
          judgments, settlements, costs, and expenses (including reasonable attorneys’ fees) arising out of or relating
          to:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Your use of or access to the Platform</li>
          <li>Your violation of these Terms or applicable law</li>
          <li>Any content, listing, or information you provide</li>
          <li>Your interaction, agreement, or dispute with any other User</li>
          <li>Any injury, damage, or loss occurring at or relating to a listed property</li>
          <li>Any claim that you acted as a broker, agent, or intermediary</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">This obligation survives termination of these Terms.</p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">11. Disputes Between Users</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads is not responsible for, and shall have no liability arising from:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Disputes between Users</li>
          <li>Property conditions, access issues, or cancellations</li>
          <li>Misrepresentations by any User</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads has no obligation to mediate disputes but may do so at its sole discretion.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">12. Termination</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads may suspend or terminate your access to the Platform at any time, with or without cause or notice.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">Upon termination:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Your right to use the Platform ceases immediately</li>
          <li>Certain provisions of these Terms will survive, including indemnification and limitation of liability</li>
        </ul>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">13. Modifications to Terms</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads reserves the right to modify these Terms at any time. Updated Terms will be posted on the Platform.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          Your continued use of the Platform constitutes acceptance of the revised Terms.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">14. Governing Law and Venue</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          These Terms shall be governed by and construed in accordance with the laws of the State of Colorado, without
          regard to conflict of law principles.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          You agree that any legal action or proceeding shall be brought exclusively in the state or federal courts
          located in Colorado.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">15. Entire Agreement</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          These Terms constitute the entire agreement between you and LuxPads and supersede any prior agreements or
          understandings.
        </p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">16. Contact</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">For questions regarding these Terms:</p>
        <p className="mt-2 text-sm font-medium text-stone-900">{siteCopy.domainDisplay}</p>

        <Hr />

        <h2 className="font-serif text-2xl text-stone-900">Platform Disclaimer</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          LuxPads is a neutral marketplace platform only. LuxPads does not:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>Guarantee any booking or transaction</li>
          <li>Ensure compliance with local rental laws</li>
          <li>Inspect or certify properties</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          All Users assume full responsibility and risk in using the Platform.
        </p>

        <Hr />
      </article>
    </div>
  );
}
