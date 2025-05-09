import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Contas from "@/pages/Contas";
import Transacoes from "@/pages/Transacoes";
import Relatorios from "@/pages/Relatorios";
import PlanningPage from './pages/PlanningPage';
import TripDetailsPage from './pages/TripDetailsPage';
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contas" component={Contas} />
      <Route path="/transacoes" component={Transacoes} />
      <Route path="/relatorios" component={Relatorios} />
      <Route path="/planejamento" component={PlanningPage} />
      <Route path="/planning/:id" element={<TripDetailsPage />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Layout>
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;