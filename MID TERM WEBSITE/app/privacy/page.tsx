import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-14">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>We store account details, seller profile information, external media URLs, ad lifecycle logs, notifications, and payment verification data.</p>
          <p>Audit logs and status history are maintained for moderation transparency and operational accountability.</p>
          <p>No payment gateway is integrated in this demo. Submitted screenshots and transaction references are used only for manual verification workflow.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
