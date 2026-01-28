import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileText, Play, Mic, Upload, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to scripts if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/scripts");
    }
  }, [isAuthenticated, loading, setLocation]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Hero Section */}
      <div className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Professional Teleprompter
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your scripts, practice your delivery, and perfect your performance with our powerful teleprompter application. Record, transcribe, and review your practice sessions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need for Perfect Delivery
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Multiple File Formats
              </h3>
              <p className="text-muted-foreground">
                Upload scripts in DOCX, Markdown, or PDF format. Drag and drop support makes it easy to get started quickly.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Customizable Controls
              </h3>
              <p className="text-muted-foreground">
                Adjust scrolling speed from 1-10, change font size from 12px to 72px, and control playback with intuitive controls.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                Record & Transcribe
              </h3>
              <p className="text-muted-foreground">
                Record your practice sessions and get automatic transcriptions to compare with your original script for improvement.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto bg-primary text-primary-foreground rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Perfect Your Delivery?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Start using our teleprompter application today and take your presentations to the next level.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <a href={getLoginUrl()}>
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-border mt-16">
        <div className="container py-8">
          <p className="text-center text-muted-foreground text-sm">
            © 2026 Teleprompter App. Built with Manus.
          </p>
        </div>
      </div>
    </div>
  );
}
