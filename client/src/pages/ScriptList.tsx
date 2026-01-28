import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Trash2, Play, Upload, Mic } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ScriptList() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: scripts, isLoading } = trpc.scripts.list.useQuery();
  
  const deleteMutation = trpc.scripts.delete.useMutation({
    onSuccess: () => {
      utils.scripts.list.invalidate();
      toast.success("Script deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this script?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading scripts...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Scripts</h1>
            <p className="text-muted-foreground mt-2">Manage your teleprompter scripts</p>
          </div>
          <Button onClick={() => setLocation("/upload")} size="lg">
            <Upload className="mr-2 h-5 w-5" />
            Upload Script
          </Button>
        </div>
        
        {!scripts || scripts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No scripts yet</h3>
              <p className="text-muted-foreground mb-6">Upload your first script to get started</p>
              <Button onClick={() => setLocation("/upload")}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Script
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <Card key={script.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-1">{script.title}</span>
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                  </CardTitle>
                  <CardDescription>
                    {script.fileType.toUpperCase()} • {new Date(script.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {script.content}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setLocation(`/teleprompter/${script.id}`)} 
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setLocation(`/recordings/${script.id}`)}
                      title="View Recordings"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDelete(script.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
