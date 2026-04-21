export default function ProductsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Product catalogue — list, create and delete operations land in the next stage.
        </p>
      </header>

      <div className="border-border/60 rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">
          The products list, pagination and dialogs will be implemented in Stage 6.
        </p>
      </div>
    </div>
  );
}
