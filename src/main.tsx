import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import { authClient } from "./lib/auth-client";
import "./styles.css";

// Create Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Create router with type-safe context
const router = createRouter({
  routeTree,
  context: {
    convex,
    authClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        <RouterProvider router={router} />
      </ConvexBetterAuthProvider>
    </StrictMode>,
  );
}
