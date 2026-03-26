export function HowItWorks() {
  const steps = [
    { title: "Register", description: "Create your account as a client or seller." },
    { title: "Create Ad", description: "Submit your ad for review with your details." },
    { title: "Verification", description: "Admin reviews and verifies your listing." },
    { title: "Publish", description: "Your ad goes live for the world to see." }
  ]

  return (
    <section id="how-it-works" className="container space-y-6 rounded-md border border-border/60 bg-secondary/35 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          How AdFlow Pro Works
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Our streamlined process ensures every ad is verified and moderated for the best user experience.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4 pt-12">
        {steps.map((step, i) => (
          <div key={i} className="relative overflow-hidden rounded-md border border-border/80 bg-card p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-sm p-6">
              <div className="font-heading text-4xl font-bold opacity-20">0{i+1}</div>
              <div className="space-y-2">
                <h3 className="font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
