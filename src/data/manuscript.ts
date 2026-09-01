import { site } from "@/data/site";

export const MAX_MANUSCRIPT_BYTES = 20 * 1024 * 1024;

export const MANUSCRIPT_ACCEPT = [
  ".pdf",
  ".doc",
  ".docx",
  ".rtf",
  ".txt",
  ".odt",
].join(",");

export const MANUSCRIPT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/rtf",
  "text/plain",
  "application/vnd.oasis.opendocument.text",
  "application/octet-stream",
]);

export const MANUSCRIPT_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "rtf",
  "txt",
  "odt",
]);

export const manuscriptHeroContent = {
  title: "Submit Your Manuscript",
  highlight: "Manuscript",
  description:
    "A confidential review from our publishing specialists. Share your details, tell us about your book, and upload the file you would like us to read.",
};

export const manuscriptPageContent = {
  asideTitle: "Your manuscript is in trusted hands",
  asideBody:
    "Every submission is reviewed privately by our publishing specialists. We look at your story, your goals, and the best path to a professionally published book.",
  steps: [
    {
      title: "Upload your manuscript",
      text: "Send the latest draft in PDF, Word, or text format.",
    },
    {
      title: "We review your work",
      text: "Our team reads your details and assesses publishing fit.",
    },
    {
      title: "Get a personal response",
      text: "We follow up with next steps, typically within 1–2 business days.",
    },
  ],
  assurances: [
    "Confidential manuscript handling",
    "No obligation to proceed",
    "Guidance from publishing specialists",
  ],
  genres: [
    "Action",
    "Business",
    "Children",
    "Drama",
    "Fantasy",
    "Fiction",
    "Memoir",
    "Non-Fiction",
    "Novel",
    "Romance",
    "Self-Help",
    "Suspense",
    "Other",
  ],
  languages: [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Hindi",
    "Other",
  ],
  manuscriptStatuses: [
    "Complete manuscript",
    "First draft",
    "Partial draft",
    "Outline / sample chapters",
  ],
  countries: [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "India",
    "Ireland",
    "New Zealand",
    "South Africa",
    "United Arab Emirates",
    "Pakistan",
    "Philippines",
    "Nigeria",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Other",
  ],
  contactEmail: site.email,
  contactPhone: site.phone,
  contactPhoneHref: site.phoneHref,
};

export const manuscriptThankYou = {
  title: "Thank you — your manuscript is with us",
  body:
    "We have received your submission and a confirmation has been sent to your email. Our publishing team will review your work and follow up with next steps, typically within 1–2 business days.",
  nextSteps: [
    "Your file is handled confidentially by our specialists",
    "We review your story, goals, and publishing fit",
    "A publishing consultant will contact you personally",
  ],
  emailSubject: "We received your manuscript — Kindle Book Publishers",
};

export const manuscriptFieldLabels: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  penName: "Pen Name",
  email: "Email",
  phone: "Phone",
  street: "Street Address",
  city: "City",
  state: "State / Province",
  postalCode: "ZIP / Postal Code",
  country: "Country",
  bookTitle: "Book Title",
  genre: "Genre",
  wordCount: "Word Count",
  language: "Language",
  manuscriptStatus: "Manuscript Status",
  targetAudience: "Target Audience",
  synopsis: "Synopsis",
  notes: "Additional Notes",
};
