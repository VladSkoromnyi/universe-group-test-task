"use client";

import * as React from "react";
import { AlertCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Global error boundary for the app router. Next.js renders this when a
 * segment (server or client) throws during render. `reset()` re-runs the
 * failed segment without a full reload.
 *
 * Must be a client component — the runtime requires an error boundary to
 * run on the client.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // The digest field is set on server-side errors; log everything else
    // verbatim so it's visible in the browser console during development.
    // In production, pair this with a real error reporter.
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <AlertCircleIcon className="size-6" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm">
          {error.message || "An unexpected error occurred."}
          {error.digest ? (
            <span className="text-muted-foreground/70 mt-1 block font-mono text-xs">
              digest: {error.digest}
            </span>
          ) : null}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/products">Back to products</a>
        </Button>
      </div>
    </div>
  );
}
