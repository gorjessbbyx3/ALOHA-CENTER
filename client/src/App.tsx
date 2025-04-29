import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Patients from "@/pages/patients";
import Payments from "@/pages/payments";
import Settings from "@/pages/settings";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/patients" component={Patients} />
      <Route path="/payments" component={Payments} />
      <Route path="/settings" component={Settings} />
      <Route path="/checkout/:appointmentId?" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
