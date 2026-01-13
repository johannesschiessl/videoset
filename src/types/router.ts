import type { ConvexReactClient } from "convex/react";
import type { authClient } from "@/lib/auth-client";

export interface RouterContext {
  convex: ConvexReactClient;
  authClient: typeof authClient;
}
