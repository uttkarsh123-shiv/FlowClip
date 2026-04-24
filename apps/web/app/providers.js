"use client";
import { convex, ConvexProvider } from "../lib/convex";

export default function Providers({ children }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
