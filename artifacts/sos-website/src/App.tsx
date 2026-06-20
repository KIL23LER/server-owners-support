import React, { Component } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Templates from "@/pages/Templates";
import Admin from "@/pages/Admin";
import BotPage from "@/pages/BotPage";
import TemplateCustomizer from "@/pages/TemplateCustomizer";
import NotFound from "@/pages/not-found";

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("AppError:", error.message, info.componentStack?.slice(0, 300));
  }
  render() {
    if (this.state.error) {
      return (
        <div
          dir="rtl"
          style={{
            padding: "40px",
            fontFamily: "Tajawal, sans-serif",
            textAlign: "center",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f9f9fb",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#e74c3c", marginBottom: "8px", fontSize: "20px" }}>
            حدث خطأ في التطبيق
          </h2>
          <p style={{ color: "#7f8c8d", marginBottom: "20px", fontSize: "14px" }}>
            يرجى تحديث الصفحة للمحاولة مجدداً
          </p>
          <details
            style={{
              textAlign: "left",
              background: "#f0f0f0",
              padding: "12px 16px",
              borderRadius: "8px",
              maxWidth: "560px",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <summary style={{ cursor: "pointer", color: "#555", fontSize: "13px" }}>
              تفاصيل الخطأ (للمطورين)
            </summary>
            <pre
              style={{
                fontSize: "11px",
                marginTop: "8px",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                color: "#c0392b",
              }}
            >
              {this.state.error.message}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 28px",
              background: "#5865F2",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/templates" component={Templates} />
        <Route path="/customize" component={TemplateCustomizer} />
        <Route path="/bot" component={BotPage} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
            <SonnerToaster position="top-center" richColors />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
