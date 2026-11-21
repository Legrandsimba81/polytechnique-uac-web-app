export function SiteFooter() {
  return (
    <footer className="border-t mt-16">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
        <span>
          © {new Date().getFullYear()} Comité des Étudiants — Faculté de
          Polytechnique
        </span>
        <span>Tous droits réservés.</span>
      </div>
    </footer>
  );
}