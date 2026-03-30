import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-14">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>AdFlow Pro is a sponsored listing marketplace. Clients must provide accurate information, valid external media links, and lawful listing content.</p>
          <p>Moderators and admins may reject, flag, schedule, archive, or expire ads based on policy and workflow rules.</p>
          <p>Payment verification is manual. Publication only happens after successful moderation and verified payment state.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
