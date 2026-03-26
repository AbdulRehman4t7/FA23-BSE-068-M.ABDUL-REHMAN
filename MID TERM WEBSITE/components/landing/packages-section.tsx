import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PackagesSection() {
  const packages = [
    { name: "Basic", price: "0", features: ["7 Days Duration", "Standard Visibility"] },
    { name: "Standard", price: "500", features: ["15 Days Duration", "Priority Support"] },
    { name: "Premium", price: "1500", features: ["30 Days Duration", "Homepage Boost", "Verified Badge"] }
  ]

  return (
    <section id="packages" className="container py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Choose Your Package
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Find the right plan for your business needs.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 pt-12">
        {packages.map((pkg) => (
          <Card key={pkg.name} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              <div className="text-3xl font-bold">PKR {pkg.price}</div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-center">
                    <span className="mr-2">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6">Get Started</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
