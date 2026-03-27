import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

const faqs = [
  ["How does moderation work?", "Every ad moves through submission, review, payment verification, scheduling, publication, and expiry with audit logging."],
  ["Can I upload files?", "No. AdFlow Pro accepts external media URLs only and normalizes YouTube thumbnails plus valid images."],
  ["When does an ad expire?", "Basic lasts 7 days, Standard 15 days, and Premium 30 days after publication."],
  ["Can payments be duplicated?", "No. Transaction references are checked and duplicate proofs are rejected."],
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-14">
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <div className="mt-8 space-y-4">
          {faqs.map(([q, a]) => (
            <div key={q} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">{q}</h2>
              <p className="mt-2 text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
