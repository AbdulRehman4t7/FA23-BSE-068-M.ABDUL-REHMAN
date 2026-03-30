import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Check, HelpCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const comparisonFeatures = [
  { name: "Listing Duration", basic: "7 days", standard: "15 days", premium: "30 days" },
  { name: "Image Uploads", basic: "1", standard: "5", premium: "Unlimited" },
  { name: "Featured Badge", basic: false, standard: false, premium: true },
  { name: "Homepage Showcase", basic: false, standard: false, premium: true },
  { name: "Analytics Dashboard", basic: "Basic", standard: "Detailed", premium: "Advanced" },
  { name: "Support Level", basic: "Email", standard: "Priority", premium: "Dedicated Manager" },
  { name: "Social Media Promotion", basic: false, standard: true, premium: true },
  { name: "Email Newsletter Feature", basic: false, standard: false, premium: true },
  { name: "Renewal Discount", basic: "0%", standard: "10%", premium: "20%" },
  { name: "Review Time", basic: "24 hrs", standard: "12 hrs", premium: "2 hrs" },
]

const faqs = [
  {
    question: "How long does the review process take?",
    answer: "Review times depend on your package. Premium listings are reviewed within 2 hours, Standard within 12 hours, and Basic within 24 hours.",
  },
  {
    question: "Can I upgrade my package after purchasing?",
    answer: "Yes! You can upgrade your package at any time. The price difference will be prorated based on the remaining duration.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for business accounts.",
  },
  {
    question: "Can I get a refund if my ad is rejected?",
    answer: "Yes, if your ad is rejected during the review process, you'll receive a full refund within 5-7 business days.",
  },
]

export default function PackagesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Choose Your Plan
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Select the perfect package for your advertising needs. All plans include our verification guarantee and secure payment processing.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Feature</TableHead>
                    <TableHead className="text-center">Basic</TableHead>
                    <TableHead className="text-center">Standard</TableHead>
                    <TableHead className="text-center bg-primary/5">Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonFeatures.map((feature) => (
                    <TableRow key={feature.name}>
                      <TableCell className="font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1">
                              {feature.name}
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Learn more about {feature.name.toLowerCase()}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof feature.basic === "boolean" ? (
                          feature.basic ? (
                            <Check className="mx-auto h-5 w-5 text-primary" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          feature.basic
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof feature.standard === "boolean" ? (
                          feature.standard ? (
                            <Check className="mx-auto h-5 w-5 text-primary" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          feature.standard
                        )}
                      </TableCell>
                      <TableCell className="text-center bg-primary/5">
                        {typeof feature.premium === "boolean" ? (
                          feature.premium ? (
                            <Check className="mx-auto h-5 w-5 text-primary" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="font-medium">{feature.premium}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
