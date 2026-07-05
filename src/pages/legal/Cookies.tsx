import LegalLayout from "./LegalLayout";

export default function Cookies() {
  return (
    <LegalLayout
      title="Cookie Policy"
      intro="silentPDF uses the smallest possible set of cookies. No advertising trackers, no cross-site pixels."
      updated="July 2026"
      seoTitle="Cookie Policy — silentPDF"
      metaDescription="silentPDF cookie policy: only strictly-necessary and preference cookies. No ad tracking, no cross-site pixels."
    >
      <h2>What we set</h2>
      <ul>
        <li><strong>silentpdf.theme</strong> — first-party, remembers your light/dark preference. Local, never sent to a server.</li>
        <li><strong>silentpdf.consent</strong> — first-party, remembers whether you dismissed the cookie banner.</li>
      </ul>

      <h2>What we don't set</h2>
      <ul>
        <li>No Google Analytics, no Meta Pixel, no LinkedIn Insight, no advertising cookies of any kind.</li>
        <li>No cross-site tracking cookies.</li>
        <li>No fingerprinting scripts.</li>
      </ul>

      <h2>Aggregate analytics</h2>
      <p>We measure page views and tool-completion events using a privacy-respecting first-party endpoint that does not set cookies and does not collect IP addresses. You can disable this in your browser by blocking JavaScript for silentpdf.app — the tools still work.</p>

      <h2>Managing cookies</h2>
      <p>Clear silentPDF cookies from your browser at any time. It will just prompt you for a theme again on next visit — nothing else changes.</p>
    </LegalLayout>
  );
}
