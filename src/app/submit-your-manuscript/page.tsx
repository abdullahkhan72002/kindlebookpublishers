import type { Metadata } from "next";
import ManuscriptForm from "@/components/sections/ManuscriptForm";
import PageHero from "@/components/sections/PageHero";
import { manuscriptHeroContent } from "@/data/manuscript";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `Submit Your Manuscript | ${site.name}`,
  description:
    "Submit your manuscript to Kindle Book Publishers. Share your personal details, book information, and upload your file for a confidential publishing review.",
};

export default function SubmitYourManuscriptPage() {
  return (
    <>
      <div className="bg-white">
        <PageHero {...manuscriptHeroContent} />
      </div>
      <ManuscriptForm />
    </>
  );
}
