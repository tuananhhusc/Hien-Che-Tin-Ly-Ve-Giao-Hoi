"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function sendTelemetry(event: Record<string, unknown>) {
  try {
    const body = JSON.stringify({
      ...event,
      ts: new Date().toISOString(),
    });

    navigator.sendBeacon("/api/telemetry", body);
  } catch {
    // Keep telemetry non-blocking.
  }
}

export function Telemetry() {
  const pathname = usePathname();
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!isProduction) {
      return;
    }

    sendTelemetry({
      type: "pageview",
      path: pathname,
    });
  }, [pathname, isProduction]);

  useEffect(() => {
    if (!isProduction) {
      return;
    }

    const onError = (event: ErrorEvent) => {
      sendTelemetry({
        type: "client_error",
        message: event.message,
        path: pathname,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      sendTelemetry({
        type: "unhandled_rejection",
        message: String(event.reason),
        path: pathname,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [pathname, isProduction]);

  return null;
}
