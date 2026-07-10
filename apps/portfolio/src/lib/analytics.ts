declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

// Only the real production host reports — keeps local dev and Netlify deploy
// previews out of production analytics. Shared stream with the blog: both
// domains are subdomains of prasannavijayan.in, so GA4's cookie already
// persists sessions across them with no extra linking config.
const gaEnabled = Boolean(GA_MEASUREMENT_ID) && window.location.hostname === "prasannavijayan.in";

let initialized = false;

export function initGA() {
  if (!gaEnabled || initialized) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  // send_page_view is off because this is a client-routed SPA — trackPageView
  // covers both the initial load and every route change the same way.
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

export function trackPageView(path: string) {
  if (!gaEnabled || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  });
}
