import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturedAds() {
  return (
    <section id="featured-ads" className="container space-y-6 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Featured Listings
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Boosted ads with higher visibility and verified status.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col justify-between border-l-4 border-l-primary/70">
            <CardHeader>
              <CardTitle className="text-xl">Sample Featured Ad {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This is a preview of a featured listing on AdFlow Pro.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
