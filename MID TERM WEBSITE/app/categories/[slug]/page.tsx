import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { AdCard } from "@/components/ad-card";
import { mockGetCategories, mockListPublishedAds } from "@/lib/mock-db";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = mockGetCategories().find((item) => item.slug === params.slug);
  if (!category) notFound();
  const ads = mockListPublishedAds({ category: params.slug, limit: 12 }).data;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12">
        <h1 className="text-4xl font-bold">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">Curated listings ranked with package weight, freshness, featured boost, and seller trust.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ads.map((ad) => <AdCard key={ad.id} ad={ad} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}
