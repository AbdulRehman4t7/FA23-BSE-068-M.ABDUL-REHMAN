const steps = [
  { title: "Create Draft", description: "Clients create a structured draft with category, city, package, and external media URL." },
  { title: "Moderator Review", description: "Listings move into submission queue where moderators approve, reject, or flag suspicious content." },
  { title: "Verify Payment", description: "Clients submit transaction proof and admins manually verify payment before publication." },
  { title: "Schedule & Publish", description: "Admins can schedule campaigns, publish instantly, apply boosts, and let cron jobs expire ads automatically." },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container py-14 lg:py-24">
      <div className="rounded-[2.4rem] border border-border/70 bg-card/75 p-6 shadow-[0_24px_80px_rgba(76,46,22,0.08)] lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Workflow Logic</p>
            <h2 className="mt-3 font-heading text-4xl sm:text-5xl">A real approval flow, not just plain CRUD.</h2>
            <p className="mt-5 max-w-lg text-muted-foreground">
              AdFlow Pro is designed around lifecycle enforcement. Public visibility only happens after moderation and payment verification, while scheduling and expiry are handled automatically.
            </p>
            <div className="mt-8 rounded-[1.6rem] bg-primary px-5 py-5 text-primary-foreground">
              <p className="text-xs uppercase tracking-[0.28em] text-primary-foreground/75">Lifecycle</p>
              <p className="mt-3 text-sm leading-8">
                Draft → Submitted → Under Review → Payment Pending → Payment Submitted → Payment Verified → Scheduled → Published → Expired → Archived
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => (
              <div key={step.title} className="group rounded-[1.8rem] border border-border/70 bg-background/80 p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                  0{index + 1}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
