"use client";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  BookOpen,
  CheckCircle2,
  FileUp,
  MapPin,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import {
  MANUSCRIPT_ACCEPT,
  MAX_MANUSCRIPT_BYTES,
  manuscriptPageContent,
  manuscriptThankYou,
} from "@/data/manuscript";
import {
  formatFileSize,
  isAllowedManuscriptFile,
} from "@/lib/manuscriptUpload";
import { submitManuscriptForm } from "@/lib/submitManuscript";

const inputClasses =
  "text-nav w-full rounded-xl border border-foreground/12 bg-[#FBFBFB] px-4 py-3 text-foreground outline-none transition-all placeholder:text-foreground/35 focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(237,151,32,0.12)]";

function Field({
  id,
  label,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-nav font-medium text-foreground/80">
        {label}
      </label>
      {children}
      {hint ? <p className="text-nav text-sm text-foreground/50">{hint}</p> : null}
    </div>
  );
}

function SectionHeading({
  icon,
  step,
  title,
  description,
}: {
  icon: ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4 border-b border-foreground/10 pb-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
        {icon}
      </span>
      <div>
        <p className="text-nav text-xs font-medium tracking-[0.16em] text-primary uppercase">
          {step}
        </p>
        <h3 className="font-heading text-xl font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-nav mt-1 text-foreground/60">{description}</p>
      </div>
    </div>
  );
}

export default function ManuscriptForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  useEffect(() => {
    if (status !== "success") return;
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status]);

  const assignFile = (nextFile: File | undefined) => {
    if (!nextFile) return;

    if (!isAllowedManuscriptFile(nextFile)) {
      setErrorMessage(
        nextFile.size > MAX_MANUSCRIPT_BYTES
          ? "Please upload a file under 20 MB."
          : "Please upload a PDF, Word, RTF, TXT, or ODT file.",
      );
      setStatus("error");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(nextFile);
    setErrorMessage("");
    setStatus("idle");

    if (fileInputRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(nextFile);
      fileInputRef.current.files = transfer.files;
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    assignFile(event.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!file) {
      setStatus("error");
      setErrorMessage("Please upload your manuscript before submitting.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setAuthorName(
      `${String(data.get("firstName") ?? "").trim()} ${String(data.get("lastName") ?? "").trim()}`.trim(),
    );
    setAuthorEmail(String(data.get("email") ?? "").trim());

    setStatus("loading");
    const result = await submitManuscriptForm(form);

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    setStatus("success");
    form.reset();
    setFile(null);
  };

  return (
    <section className="bg-[#F8F6F2] pb-16 pt-2 lg:pb-24">
      <Container>
        <div ref={formTopRef} className="scroll-mt-[calc(var(--header-height)+1rem)]">
          <Reveal variant="fade-up">
            {status === "success" ? (
              <div className="mx-auto max-w-2xl rounded-3xl border border-primary/15 bg-white px-6 py-12 text-center shadow-2xl shadow-black/10 sm:px-12 sm:py-16">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-9" aria-hidden />
                </span>
                <p className="text-nav mt-6 text-xs font-medium tracking-[0.18em] text-primary uppercase">
                  Submission received
                </p>
                <h3 className="font-heading mt-3 text-3xl font-semibold text-foreground">
                  {authorName ? `Thank you, ${authorName.split(" ")[0]}` : manuscriptThankYou.title}
                </h3>
                <p className="text-body mx-auto mt-4 max-w-md text-foreground/70">
                  {manuscriptThankYou.body}
                </p>
                {authorEmail ? (
                  <p className="text-nav mt-3 text-foreground/55">
                    A confirmation has been sent to{" "}
                    <span className="font-medium text-foreground">{authorEmail}</span>
                  </p>
                ) : null}
                <ul className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left">
                  {manuscriptThankYou.nextSteps.map((step) => (
                    <li
                      key={step}
                      className="text-nav flex items-start gap-3 rounded-2xl bg-[#F8F6F2] px-4 py-3 text-foreground/75"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {step}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="primary-light"
                  className="mt-10"
                  onClick={() => {
                    setStatus("idle");
                    setAuthorName("");
                    setAuthorEmail("");
                  }}
                >
                  Submit another manuscript
                </Button>
              </div>
            ) : (
              <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10">
                <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.25rem)]">
                  <div className="overflow-hidden rounded-3xl bg-[#1B1B1B] p-6 text-white shadow-2xl shadow-black/20 sm:p-8">
                    <p className="text-nav text-xs font-medium tracking-[0.18em] text-primary uppercase">
                      Private review
                    </p>
                    <h2 className="font-heading mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
                      {manuscriptPageContent.asideTitle}
                    </h2>
                    <p className="text-body mt-4 text-white/70">
                      {manuscriptPageContent.asideBody}
                    </p>

                    <ol className="mt-8 flex flex-col gap-5">
                      {manuscriptPageContent.steps.map((step, index) => (
                        <li key={step.title} className="flex gap-4">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-heading text-lg font-semibold">{step.title}</p>
                            <p className="text-nav mt-1 text-white/65">{step.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <ul className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
                      {manuscriptPageContent.assurances.map((item) => (
                        <li key={item} className="text-nav flex items-center gap-3 text-white/85">
                          <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>

                <form
                  className="rounded-3xl border border-foreground/10 bg-white p-5 shadow-2xl shadow-black/10 sm:p-8 lg:p-10"
                  onSubmit={handleSubmit}
                >
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden
                  />

                  <section>
                    <SectionHeading
                      icon={<UserRound className="size-5" aria-hidden />}
                      step="Step 1"
                      title="Author details"
                      description="How we should reach you about your book."
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="firstName" label="First name">
                        <input
                          id="firstName"
                          name="firstName"
                          required
                          autoComplete="given-name"
                          placeholder="First name"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="lastName" label="Last name">
                        <input
                          id="lastName"
                          name="lastName"
                          required
                          autoComplete="family-name"
                          placeholder="Last name"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="email" label="Email">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@email.com"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="phone" label="Phone">
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          placeholder="Phone number"
                          className={inputClasses}
                        />
                      </Field>
                      <Field
                        id="penName"
                        label="Pen name (optional)"
                        className="sm:col-span-2"
                      >
                        <input
                          id="penName"
                          name="penName"
                          placeholder="If different from your legal name"
                          className={inputClasses}
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="mt-10">
                    <SectionHeading
                      icon={<MapPin className="size-5" aria-hidden />}
                      step="Step 2"
                      title="Address"
                      description="Used for publishing records and follow-up."
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="street" label="Street address" className="sm:col-span-2">
                        <input
                          id="street"
                          name="street"
                          required
                          autoComplete="street-address"
                          placeholder="Street address"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="city" label="City">
                        <input
                          id="city"
                          name="city"
                          required
                          autoComplete="address-level2"
                          placeholder="City"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="state" label="State / Province">
                        <input
                          id="state"
                          name="state"
                          required
                          autoComplete="address-level1"
                          placeholder="State or province"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="postalCode" label="ZIP / Postal code">
                        <input
                          id="postalCode"
                          name="postalCode"
                          required
                          autoComplete="postal-code"
                          placeholder="ZIP or postal code"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="country" label="Country">
                        <select
                          id="country"
                          name="country"
                          required
                          defaultValue="United States"
                          autoComplete="country-name"
                          className={inputClasses}
                        >
                          {manuscriptPageContent.countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </section>

                  <section className="mt-10">
                    <SectionHeading
                      icon={<BookOpen className="size-5" aria-hidden />}
                      step="Step 3"
                      title="Book details"
                      description="Help us understand the manuscript before we read it."
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="bookTitle" label="Book title" className="sm:col-span-2">
                        <input
                          id="bookTitle"
                          name="bookTitle"
                          required
                          placeholder="Working title or final title"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="genre" label="Genre">
                        <select
                          id="genre"
                          name="genre"
                          required
                          defaultValue=""
                          className={inputClasses}
                        >
                          <option value="" disabled>
                            Select a genre
                          </option>
                          {manuscriptPageContent.genres.map((genre) => (
                            <option key={genre} value={genre}>
                              {genre}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field id="language" label="Language">
                        <select
                          id="language"
                          name="language"
                          required
                          defaultValue="English"
                          className={inputClasses}
                        >
                          {manuscriptPageContent.languages.map((language) => (
                            <option key={language} value={language}>
                              {language}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field id="wordCount" label="Approximate word count">
                        <input
                          id="wordCount"
                          name="wordCount"
                          inputMode="numeric"
                          placeholder="e.g. 65000"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="manuscriptStatus" label="Manuscript status">
                        <select
                          id="manuscriptStatus"
                          name="manuscriptStatus"
                          required
                          defaultValue="Complete manuscript"
                          className={inputClasses}
                        >
                          {manuscriptPageContent.manuscriptStatuses.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field
                        id="targetAudience"
                        label="Target audience (optional)"
                        className="sm:col-span-2"
                      >
                        <input
                          id="targetAudience"
                          name="targetAudience"
                          placeholder="e.g. Young adult, first-time entrepreneurs, parents"
                          className={inputClasses}
                        />
                      </Field>
                      <Field id="synopsis" label="Synopsis" className="sm:col-span-2">
                        <textarea
                          id="synopsis"
                          name="synopsis"
                          required
                          rows={5}
                          placeholder="A short summary of your book, characters, and what makes it unique"
                          className={`${inputClasses} resize-none`}
                        />
                      </Field>
                      <Field
                        id="notes"
                        label="Anything else we should know? (optional)"
                        className="sm:col-span-2"
                      >
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          placeholder="Publishing goals, previous editions, special requests"
                          className={`${inputClasses} resize-none`}
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="mt-10">
                    <SectionHeading
                      icon={<FileUp className="size-5" aria-hidden />}
                      step="Step 4"
                      title="Upload your manuscript"
                      description="Attach the file you want our team to review."
                    />

                    <input
                      ref={fileInputRef}
                      id="manuscript"
                      name="manuscript"
                      type="file"
                      required
                      accept={MANUSCRIPT_ACCEPT}
                      className="sr-only"
                      onChange={(event) => assignFile(event.target.files?.[0])}
                    />

                    <label
                      htmlFor="manuscript"
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-4 py-10 text-center transition-all sm:py-12 ${
                        dragOver
                          ? "border-primary bg-primary/5 shadow-[inset_0_0_0_1px_rgba(237,151,32,0.35)]"
                          : file
                            ? "border-primary/40 bg-primary/5"
                            : "border-foreground/15 bg-[#F8F6F2] hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      <span className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                        <Upload className="size-7" aria-hidden />
                      </span>
                      <p className="font-heading mt-5 text-lg font-semibold text-foreground sm:text-xl">
                        Drop your manuscript here, or browse
                      </p>
                      <p className="text-nav mt-2 max-w-md text-foreground/55">
                        PDF, DOC, DOCX, RTF, TXT, or ODT. Maximum 20 MB.
                      </p>
                    </label>

                    {file ? (
                      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-white px-4 py-3.5 shadow-sm">
                        <div className="min-w-0">
                          <p className="text-nav truncate font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="text-nav text-foreground/55">
                            {formatFileSize(file.size)} ready to send
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearFile}
                          aria-label="Remove manuscript file"
                          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-foreground/12 text-foreground/70 transition-colors hover:border-primary hover:text-primary"
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      </div>
                    ) : null}
                  </section>

                  {status === "error" ? (
                    <p
                      role="alert"
                      className="text-nav mt-6 rounded-xl border border-foreground/15 bg-[#F8F6F2] px-4 py-3 text-foreground"
                    >
                      {errorMessage}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    variant="primary-light"
                    className="mt-8 w-full rounded-xl py-4"
                    disabled={status === "loading"}
                  >
                    {status === "loading"
                      ? "Submitting manuscript..."
                      : "Submit Your Manuscript"}
                  </Button>
                  <p className="text-nav mt-3 text-center text-sm text-foreground/50">
                    You will receive a thank-you email as soon as we have your file.
                  </p>
                </form>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
