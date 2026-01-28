import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, ArrowLeft, Clock } from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function Recordings() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const { data: script } = trpc.scripts.get.useQuery({ id: Number(id) });
  const { data: recordings, isLoading } = trpc.recordings.list.useQuery({ scriptId: Number(id) });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading recordings...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/scripts")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scripts
        </Button>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Recordings</h1>
          {script && (
            <p className="text-muted-foreground mt-2">
              Practice sessions for: {script.title}
            </p>
          )}
        </div>
        
        {!recordings || recordings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mic className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No recordings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start the teleprompter and record your practice session
              </p>
              <Button onClick={() => setLocation(`/teleprompter/${id}`)}>
                Go to Teleprompter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {recordings.map((recording) => (
              <Card key={recording.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Mic className="mr-2 h-5 w-5" />
                      Recording {recording.id}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {new Date(recording.createdAt).toLocaleString()}
                    </span>
                  </CardTitle>
                  {recording.duration && (
                    <CardDescription className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Duration: {Math.floor(recording.duration / 60)}:
                      {(recording.duration % 60).toString().padStart(2, "0")}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Audio</h4>
                      <audio controls className="w-full">
                        <source src={recording.audioFileUrl} type="audio/webm" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                    
                    {recording.transcription && (
                      <div>
                        <h4 className="font-semibold mb-2">Transcription</h4>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm whitespace-pre-wrap">
                            {recording.transcription}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {!recording.transcription && (
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground italic">
                          Transcription in progress or not available...
                        </p>
                      </div>
                    )}
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
