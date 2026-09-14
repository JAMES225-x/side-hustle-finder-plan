"use client";

import { useEffect } from "react";

export function IdentityBootstrapper() {
  useEffect(() => {
    void fetch("/api/identity", { method: "GET" });
  }, []);

  return null;
}
