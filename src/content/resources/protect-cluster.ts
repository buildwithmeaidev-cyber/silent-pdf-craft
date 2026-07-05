import { ContentAsset } from "../ContentAsset";

export const PROTECT_CLUSTER: ContentAsset[] = [
  {
    slug: "how-to-password-protect-pdf",
    title: "How To Password Protect A PDF",
    seoTitle: "How to Password Protect a PDF File Securely",
    metaDescription: "Learn how to encrypt and lock your PDF files with a password to protect sensitive information like tax returns and medical records.",
    contentType: "problem-solving",
    category: "guides",
    cluster: "protect",
    publishedAt: "2026-06-15",
    readMinutes: 6,
    definition: "Password protection (encryption) scrambles the PDF's binary data using an algorithm like AES, requiring a specific string (the password) to decrypt and read the file.",
    quickAnswer: "Upload your file to the Protect PDF tool, enter a strong password, and apply. The resulting file will prompt anyone who opens it for that password.",
    summary: "Emailing unencrypted sensitive documents is a massive security risk. Always password protect tax documents, medical records, and ID scans.",
    useCases: [
      "Sending tax returns to an accountant",
      "Sharing payroll information with HR"
    ],
    stepByStep: [
      { name: "Step 1", text: "Upload your sensitive PDF to the Protect tool." },
      { name: "Step 2", text: "Enter a strong, memorable password." },
      { name: "Step 3", text: "Download the encrypted file and share the password with the recipient securely." }
    ],
    body: [
      { type: "p", text: "When you send an attachment via email, it sits on servers in plain text. If you are sending anything containing a Social Security Number or banking details, it must be encrypted." }
    ],
    faq: [
      {
        q: "Can a password-protected PDF be cracked?",
        a: "If you use modern AES encryption and a strong, long password, it is practically impossible to crack using current technology. Weak passwords (like '1234') can be brute-forced easily."
      }
    ],
    parentToolSlug: "protect-pdf",
    relatedToolSlugs: ["watermark-pdf", "esign-pdf", "compress-pdf"],
    relatedAssetSlugs: ["best-practices-for-secure-pdfs"],
    relatedProgrammaticSlug: "protect-pdf"
  },
  {
    slug: "best-practices-for-secure-pdfs",
    title: "Best Practices For Secure PDFs",
    seoTitle: "PDF Security Best Practices: How to Keep Data Safe",
    metaDescription: "Don't just add a password. Learn the industry best practices for securing PDF documents before sharing them online.",
    contentType: "industry-resource",
    category: "guides",
    cluster: "protect",
    publishedAt: "2026-06-18",
    readMinutes: 8,
    definition: "PDF Security encompasses encryption, access controls (permissions), redaction, and watermarking to prevent unauthorized access and data leakage.",
    quickAnswer: "Always use AES-256 encryption, never send the password in the same email as the file, and permanently redact sensitive text instead of just drawing a black box over it.",
    summary: "Security is a process, not just a password. Following strict protocols ensures your data remains safe in transit and at rest.",
    useCases: [
      "Corporate IT security training",
      "Legal document handling"
    ],
    body: [
      { type: "p", text: "A locked door is useless if you leave the key in the lock. The same applies to PDF encryption." }
    ],
    faq: [],
    parentToolSlug: "protect-pdf",
    relatedToolSlugs: ["watermark-pdf", "edit-pdf", "merge-pdf"],
    relatedAssetSlugs: ["how-to-password-protect-pdf"],
    relatedProgrammaticSlug: "protect-pdf"
  }
];
