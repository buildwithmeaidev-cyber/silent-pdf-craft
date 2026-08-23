/**
 * Real, downloadable PDF templates generated in the browser with pdf-lib.
 * Nothing is fetched from a server — the file is built on the user's device.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type Block =
  | { type: "title"; text: string }
  | { type: "subtitle"; text: string }
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "bullet"; text: string }
  | { type: "rule" }
  | { type: "space"; size?: number };

export type PdfTemplate = {
  slug: string;
  name: string;
  description: string;
  category: "Career" | "Business" | "Legal";
  fileName: string;
  blocks: Block[];
};

const LINE = "____________________________________________";

export const PDF_TEMPLATES: PdfTemplate[] = [
  {
    slug: "resume",
    name: "Professional Resume",
    description:
      "A clean, single-column resume that applicant tracking systems can actually read. Replace the placeholders and you're done.",
    category: "Career",
    fileName: "silentpdf-resume-template.pdf",
    blocks: [
      { type: "title", text: "YOUR NAME" },
      { type: "subtitle", text: "Job Title  •  city  •  email@example.com  •  +00 000 000 0000  •  linkedin.com/in/you" },
      { type: "rule" },
      { type: "heading", text: "SUMMARY" },
      { type: "text", text: "Two or three lines about what you do, the kind of problems you solve, and the result you're known for. Keep numbers in it." },
      { type: "heading", text: "EXPERIENCE" },
      { type: "text", text: "Job Title — Company, City (Month Year – Present)" },
      { type: "bullet", text: "What you owned, and the measurable outcome (e.g. cut reporting time from 3 days to 4 hours)." },
      { type: "bullet", text: "A project you led end to end, with the scale (team size, budget, users)." },
      { type: "bullet", text: "Something you improved that outlived you." },
      { type: "space" },
      { type: "text", text: "Job Title — Company, City (Month Year – Month Year)" },
      { type: "bullet", text: "Responsibility and result." },
      { type: "bullet", text: "Responsibility and result." },
      { type: "heading", text: "EDUCATION" },
      { type: "text", text: "Degree, Institution — Year" },
      { type: "heading", text: "SKILLS" },
      { type: "text", text: "Skill, Skill, Skill, Skill, Skill, Skill" },
    ],
  },
  {
    slug: "cover-letter",
    name: "Cover Letter",
    description:
      "A one-page letter with the structure hiring managers skim for: why them, why you, what you'd do first.",
    category: "Career",
    fileName: "silentpdf-cover-letter-template.pdf",
    blocks: [
      { type: "title", text: "YOUR NAME" },
      { type: "subtitle", text: "email@example.com  •  +00 000 000 0000  •  city" },
      { type: "rule" },
      { type: "text", text: "Date: ____________" },
      { type: "text", text: "Hiring Manager\nCompany Name\nCompany Address" },
      { type: "space" },
      { type: "text", text: "Dear [Hiring Manager's name]," },
      { type: "text", text: "Opening: name the role, where you saw it, and one sentence on why this company specifically." },
      { type: "text", text: "Middle: the single most relevant thing you've done, with the outcome. Then a second, shorter example." },
      { type: "text", text: "Close: what you'd focus on in your first 90 days, and a clear ask for a conversation." },
      { type: "space" },
      { type: "text", text: "Sincerely," },
      { type: "text", text: "Your Name" },
    ],
  },
  {
    slug: "invoice",
    name: "Invoice",
    description:
      "A freelance-friendly invoice with billing details, line items, totals and payment terms already laid out.",
    category: "Business",
    fileName: "silentpdf-invoice-template.pdf",
    blocks: [
      { type: "title", text: "INVOICE" },
      { type: "subtitle", text: "Invoice #: ________     Date: ________     Due: ________" },
      { type: "rule" },
      { type: "heading", text: "FROM" },
      { type: "text", text: "Your Name / Business\nAddress\nEmail  •  Phone  •  Tax ID" },
      { type: "heading", text: "BILL TO" },
      { type: "text", text: "Client Name\nCompany\nAddress\nEmail" },
      { type: "heading", text: "LINE ITEMS" },
      { type: "text", text: "Description                                 Qty      Rate       Amount" },
      { type: "text", text: LINE },
      { type: "text", text: "1. ________________________            ___      ____       ______" },
      { type: "text", text: "2. ________________________            ___      ____       ______" },
      { type: "text", text: "3. ________________________            ___      ____       ______" },
      { type: "text", text: LINE },
      { type: "text", text: "Subtotal: __________     Tax: __________     TOTAL: __________" },
      { type: "heading", text: "PAYMENT TERMS" },
      { type: "text", text: "Payable within 14 days by bank transfer. Late payments accrue 2% per month." },
      { type: "text", text: "Bank: ____________  Account: ____________  IBAN/Routing: ____________" },
    ],
  },
  {
    slug: "nda",
    name: "Mutual NDA",
    description:
      "A short two-way confidentiality agreement for early conversations with clients, contractors or partners.",
    category: "Legal",
    fileName: "silentpdf-nda-template.pdf",
    blocks: [
      { type: "title", text: "MUTUAL NON-DISCLOSURE AGREEMENT" },
      { type: "subtitle", text: "This is a starting point, not legal advice. Have a lawyer review it before signing." },
      { type: "rule" },
      { type: "text", text: "This Agreement is made on ____________ between ____________________ (\"Party A\") and ____________________ (\"Party B\")." },
      { type: "heading", text: "1. CONFIDENTIAL INFORMATION" },
      { type: "text", text: "Any non-public business, technical or financial information disclosed by either party, in any form, marked or reasonably understood as confidential." },
      { type: "heading", text: "2. OBLIGATIONS" },
      { type: "bullet", text: "Use the information only to evaluate or perform the intended business relationship." },
      { type: "bullet", text: "Protect it with at least the same care used for your own confidential information." },
      { type: "bullet", text: "Share it only with employees or advisors bound by equivalent duties." },
      { type: "heading", text: "3. EXCLUSIONS" },
      { type: "text", text: "Information that is public, already known, independently developed, or lawfully received from a third party." },
      { type: "heading", text: "4. TERM" },
      { type: "text", text: "Obligations continue for ____ years from the date of disclosure." },
      { type: "heading", text: "5. SIGNATURES" },
      { type: "text", text: "Party A: ______________________   Date: __________" },
      { type: "text", text: "Party B: ______________________   Date: __________" },
    ],
  },
  {
    slug: "project-proposal",
    name: "Project Proposal",
    description:
      "Scope, timeline, budget and assumptions in the order clients read them — so the yes comes faster.",
    category: "Business",
    fileName: "silentpdf-project-proposal-template.pdf",
    blocks: [
      { type: "title", text: "PROJECT PROPOSAL" },
      { type: "subtitle", text: "Prepared for ____________  •  Prepared by ____________  •  Date ____________" },
      { type: "rule" },
      { type: "heading", text: "1. THE PROBLEM" },
      { type: "text", text: "One paragraph in the client's own words about what isn't working today and what it costs them." },
      { type: "heading", text: "2. PROPOSED APPROACH" },
      { type: "text", text: "How you'll solve it, in plain language. Three to five sentences." },
      { type: "heading", text: "3. SCOPE & DELIVERABLES" },
      { type: "bullet", text: "Deliverable one — what the client actually receives." },
      { type: "bullet", text: "Deliverable two." },
      { type: "bullet", text: "Explicitly out of scope: ____________________." },
      { type: "heading", text: "4. TIMELINE" },
      { type: "text", text: "Phase 1 ________  (weeks __)\nPhase 2 ________  (weeks __)\nPhase 3 ________  (weeks __)" },
      { type: "heading", text: "5. INVESTMENT" },
      { type: "text", text: "Total: __________   Payment schedule: 50% on start, 50% on delivery." },
      { type: "heading", text: "6. ASSUMPTIONS" },
      { type: "text", text: "What you need from the client, and what changes the price." },
    ],
  },
  {
    slug: "meeting-notes",
    name: "Meeting Notes",
    description:
      "Decisions, owners and deadlines on one page, so the meeting actually turns into work.",
    category: "Business",
    fileName: "silentpdf-meeting-notes-template.pdf",
    blocks: [
      { type: "title", text: "MEETING NOTES" },
      { type: "subtitle", text: "Date ____________  •  Time ________  •  Attendees ____________________" },
      { type: "rule" },
      { type: "heading", text: "PURPOSE" },
      { type: "text", text: "Why this meeting existed, in one sentence." },
      { type: "heading", text: "DISCUSSION" },
      { type: "bullet", text: "____________________________________________" },
      { type: "bullet", text: "____________________________________________" },
      { type: "bullet", text: "____________________________________________" },
      { type: "heading", text: "DECISIONS" },
      { type: "bullet", text: "Decision — made by ____________" },
      { type: "bullet", text: "Decision — made by ____________" },
      { type: "heading", text: "ACTION ITEMS" },
      { type: "text", text: "Task                                     Owner            Due" },
      { type: "text", text: LINE },
      { type: "text", text: "1. ____________________            ________        ______" },
      { type: "text", text: "2. ____________________            ________        ______" },
      { type: "text", text: "3. ____________________            ________        ______" },
      { type: "heading", text: "NEXT MEETING" },
      { type: "text", text: "Date ____________  •  Agenda ____________________" },
    ],
  },
];

export const getPdfTemplate = (slug: string) => PDF_TEMPLATES.find((t) => t.slug === slug);

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const MAX_W = PAGE_W - MARGIN * 2;

function wrap(text: string, font: any, size: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > MAX_W) {
        if (line) out.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    out.push(line);
  }
  return out;
}

export async function buildTemplatePdf(template: PdfTemplate): Promise<Blob> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${template.name} — SilentPDF template`);
  doc.setCreator("SilentPDF");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ink = rgb(0.09, 0.11, 0.15);
  const muted = rgb(0.42, 0.45, 0.5);

  const ensure = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  for (const block of template.blocks) {
    switch (block.type) {
      case "title": {
        ensure(34);
        page.drawText(block.text, { x: MARGIN, y: y - 22, size: 22, font: bold, color: ink });
        y -= 34;
        break;
      }
      case "subtitle": {
        for (const line of wrap(block.text, regular, 9.5)) {
          ensure(14);
          page.drawText(line, { x: MARGIN, y: y - 10, size: 9.5, font: regular, color: muted });
          y -= 14;
        }
        y -= 4;
        break;
      }
      case "heading": {
        ensure(26);
        y -= 10;
        page.drawText(block.text, { x: MARGIN, y: y - 11, size: 11.5, font: bold, color: ink });
        y -= 20;
        break;
      }
      case "text": {
        for (const line of wrap(block.text, regular, 10.5)) {
          ensure(16);
          page.drawText(line, { x: MARGIN, y: y - 11, size: 10.5, font: regular, color: ink });
          y -= 16;
        }
        break;
      }
      case "bullet": {
        const lines = wrap(block.text, regular, 10.5);
        lines.forEach((line, i) => {
          ensure(16);
          if (i === 0) {
            page.drawText("•", { x: MARGIN, y: y - 11, size: 10.5, font: regular, color: muted });
          }
          page.drawText(line, { x: MARGIN + 14, y: y - 11, size: 10.5, font: regular, color: ink });
          y -= 16;
        });
        break;
      }
      case "rule": {
        ensure(16);
        page.drawLine({
          start: { x: MARGIN, y: y - 6 },
          end: { x: PAGE_W - MARGIN, y: y - 6 },
          thickness: 0.8,
          color: rgb(0.82, 0.84, 0.88),
        });
        y -= 16;
        break;
      }
      case "space": {
        y -= block.size ?? 12;
        break;
      }
    }
  }

  const bytes = await doc.save();
  return new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" });
}

export async function downloadTemplatePdf(template: PdfTemplate) {
  const blob = await buildTemplatePdf(template);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = template.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
