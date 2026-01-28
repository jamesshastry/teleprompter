import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ScriptList from "./pages/ScriptList";
import UploadScript from "./pages/UploadScript";
import Teleprompter from "./pages/Teleprompter";
import Recordings from "./pages/Recordings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/scripts"} component={ScriptList} />
      <Route path={"/upload"} component={UploadScript} />
      <Route path={"/teleprompter/:id"} component={Teleprompter} />
      <Route path={"/recordings/:id"} component={Recordings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
