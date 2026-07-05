import LegalLayout from "./LegalLayout";

export default function Dpa() {
  return (
    <LegalLayout
      title="Data Processing Addendum"
      intro="For teams that need a written DPA before rolling silentPDF out at work. This page describes how we handle the small amount of personal data our tools touch."
      updated="July 2026"
      seoTitle="Data Processing Addendum (DPA) — silentPDF"
      metaDescription="silentPDF DPA — GDPR-aligned data processing terms for browser-based PDF tools. Minimal data, sub-processors listed, EU/UK SCCs referenced."
    >
      <h2>1. Roles</h2>
      <p>When you use silentPDF, you (or your employer) are the <strong>Data Controller</strong> for any personal data contained in the documents you process. silentPDF is the <strong>Data Processor</strong> for that data, but only for the browser session — files never reach us for the core tools.</p>

      <h2>2. Categories of data processed</h2>
      <ul>
        <li><strong>Document contents</strong> — stays in your browser for core tools; transiently held in memory for server-assisted conversion tools.</li>
        <li><strong>Technical metadata</strong> — IP address and user agent, retained 24 hours for abuse prevention.</li>
        <li><strong>Aggregate usage</strong> — tool-open and tool-completion events, no identifiers attached.</li>
      </ul>

      <h2>3. Sub-processors</h2>
      <ul>
        <li>Cloudflare (CDN & DDoS protection) — worldwide edge, no persistent storage of document data.</li>
        <li>Fly.io / Render (conversion worker hosting) — ephemeral compute, no disk persistence beyond 10 minutes.</li>
      </ul>
      <p>We'll email or post a 30-day advance notice before adding a new sub-processor that touches customer data.</p>

      <h2>4. Security measures</h2>
      <ul>
        <li>TLS 1.3 in transit.</li>
        <li>Isolated per-job workers with no shared filesystem.</li>
        <li>Automatic buffer wipe within 10 minutes on server-assisted tools.</li>
        <li>Weekly dependency scans and 72-hour patch SLA for critical CVEs.</li>
      </ul>

      <h2>5. International transfers</h2>
      <p>Where personal data flows out of the EU/UK, we rely on the current EU Standard Contractual Clauses and UK IDTA. We do not transfer to jurisdictions on the EU inadequate-safeguards list.</p>

      <h2>6. Data subject requests</h2>
      <p>Because we don't store document contents, most DSAR categories return empty. For access, deletion, or restriction requests concerning technical metadata, email <a href="mailto:privacy@silentpdf.app">privacy@silentpdf.app</a> and we'll respond within 30 days.</p>

      <h2>7. Sign a countersigned copy</h2>
      <p>If your legal team requires a countersigned DPA, email <a href="mailto:hello@silentpdf.app">hello@silentpdf.app</a> with your legal entity name and jurisdiction. We countersign the standard EU/UK template within five business days.</p>
    </LegalLayout>
  );
}
