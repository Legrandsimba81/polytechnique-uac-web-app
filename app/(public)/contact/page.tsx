export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container py-12 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="text-muted-foreground">
        Pour toute question, contactez le comité étudiant.
      </p>
      <form className="space-y-4">
        <input
          className="w-full rounded-md border p-2"
          placeholder="Votre nom"
        />
        <input
          className="w-full rounded-md border p-2"
          placeholder="Votre email"
          type="email"
        />
        <textarea
          className="w-full rounded-md border p-2 min-h-32"
          placeholder="Votre message"
        />
        <button
          type="button"
          className="rounded-md bg-primary text-primary-foreground px-4 py-2"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}