import ContextEventsProvider from "@/context/eventsContext";
import Events from "@/ui/Events/Events";
import { Suspense } from "react";

export default function PageEvents() {
  return (
    <main className="min-h-screen">
      <Suspense>
        <ContextEventsProvider>
          <Events />
        </ContextEventsProvider>
      </Suspense>
    </main>
  );
}
