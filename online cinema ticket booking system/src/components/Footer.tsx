export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="font-heading text-2xl text-primary mb-2">CINEGOLD</p>
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} CineGold. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
