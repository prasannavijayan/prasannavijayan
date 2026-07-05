import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Footer } from "@pv/ui";
import "@pv/ui/ui.css";
import "@/index.css";
import App from "@/App";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Footer />
    </QueryClientProvider>
  </StrictMode>
);
