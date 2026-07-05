import LegalLayout from "./LegalLayout";

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="Plain-English rules for using silentPDF. No dark patterns, no clickwrap ambush."
      updated="July 2026"
      seoTitle="Terms of Service — silentPDF"
      metaDescription="silentPDF terms of service — free browser-based PDF tools, no accounts, no warranty for lost files."
    >
      <h2>1. Who we are</h2>
      <p>silentPDF ("we", "us") provides free, browser-based PDF utilities. Nothing here creates an account, subscription, or ongoing obligation between you and us.</p>

      <h2>2. What you can do</h2>
      <p>You may use silentPDF for any lawful personal or commercial purpose, including client work. You do not need to credit us. There is no per-file, per-user, or per-domain limit.</p>

      <h2>3. What you can't do</h2>
      <ul>
        <li>Process content you don't have the right to (pirated books, other people's private documents, illegal material).</li>
        <li>Attempt to scrape, resell, or clone the service.</li>
        <li>Use silentPDF to build a competing product without written permission.</li>
        <li>Circumvent security controls or attempt to exploit the site.</li>
      </ul>

      <h2>4. Your files</h2>
      <p>Core tools run entirely in your browser — we don't receive your files. Server-assisted tools (currently: PDF ↔ Word) process the file in isolated memory and delete it within 10 minutes. See <a href="/privacy">Privacy</a> for the full breakdown.</p>

      <h2>5. No warranty</h2>
      <p>silentPDF is provided "as is". We do our best to keep tools working, but we do not guarantee zero data loss, perfect conversion fidelity, or uptime. Always keep the original of any document you process.</p>

      <h2>6. Liability cap</h2>
      <p>To the maximum extent permitted by law, our aggregate liability to you for any claim relating to silentPDF is capped at USD 100.</p>

      <h2>7. Changes</h2>
      <p>We may update these terms. Meaningful changes will be noted at the top of this page with a revised date. Continued use after a change means you accept the new terms.</p>

      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of the jurisdiction where the operating entity is registered. Local consumer protections that apply to you in your country of residence are unaffected.</p>
    </LegalLayout>
  );
}
