import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, ArrowLeft, Mic, Square } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function Teleprompter() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const { data: script, isLoading } = trpc.scripts.get.useQuery({ id: Number(id) });
  
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  const [isRecording, setIsRecording] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  
  const createRecordingMutation = trpc.recordings.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Recording saved! Transcribing...");
      
      // Trigger transcription
      await transcribeMutation.mutateAsync({
        recordingId: data.recordingId,
        audioUrl: data.audioFileUrl,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const transcribeMutation = trpc.recordings.transcribe.useMutation({
    onSuccess: () => {
      toast.success("Transcription complete!");
    },
    onError: (error) => {
      toast.error(`Transcription failed: ${error.message}`);
    },
  });
  
  useEffect(() => {
    if (isScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        if (contentRef.current) {
          const maxScroll = contentRef.current.scrollHeight - contentRef.current.clientHeight;
          const currentScroll = contentRef.current.scrollTop;
          
          if (currentScroll >= maxScroll) {
            setIsScrolling(false);
            return;
          }
          
          contentRef.current.scrollTop += scrollSpeed * 0.5;
        }
      }, 50);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
    
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isScrolling, scrollSpeed]);
  
  const handlePlayPause = () => {
    setIsScrolling(!isScrolling);
  };
  
  const handleReset = () => {
    setIsScrolling(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };
  
  const handleFontIncrease = () => {
    setFontSize(prev => Math.min(prev + 2, 72));
  };
  
  const handleFontDecrease = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        
        // Check file size (16MB limit)
        if (audioBlob.size > 16 * 1024 * 1024) {
          toast.error("Recording exceeds 16MB limit. Please record shorter sessions.");
          return;
        }
        
        // Convert to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          await createRecordingMutation.mutateAsync({
            scriptId: Number(id),
            audioBase64: base64,
            duration,
          });
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("Failed to start recording. Please allow microphone access.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing recording...");
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading script...</div>
      </div>
    );
  }
  
  if (!script) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Script not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Control Bar */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="container flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/scripts")}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit
          </Button>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayPause}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                {isScrolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Speed Control */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <span className="text-white text-sm whitespace-nowrap">Speed: {scrollSpeed}</span>
              <Slider
                value={[scrollSpeed]}
                onValueChange={(value) => setScrollSpeed(value[0] || 3)}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
            </div>
            
            {/* Font Size Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFontDecrease}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                A-
              </Button>
              <span className="text-white text-sm min-w-[60px] text-center">{fontSize}px</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFontIncrease}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                A+
              </Button>
            </div>
            
            {/* Recording Control */}
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={createRecordingMutation.isPending || transcribeMutation.isPending}
              className={isRecording ? "" : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"}
            >
              {isRecording ? (
                <>
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Record
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Teleprompter Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{
          scrollBehavior: "auto",
        }}
      >
        <div className="container max-w-4xl py-16">
          <div
            className="text-white text-center whitespace-pre-wrap leading-relaxed"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.6,
            }}
          >
            {script.content}
          </div>
        </div>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
