import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

const siteUrl = process.env.SITE_URL!;

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [siteUrl],
  },
});

export default http;
