import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { processFile, getFileType } from "./fileProcessor";
import { storagePut } from "./storage";
import { 
  createScript, 
  getUserScripts, 
  getScriptById, 
  deleteScript,
  getScriptRecordings,
  createRecording,
  updateRecordingTranscription
} from "./db";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  scripts: router({
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        title: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { fileName, fileBase64, title } = input;
        
        // Determine file type
        const fileType = getFileType(fileName);
        if (!fileType) {
          throw new Error("Unsupported file format. Please upload DOCX, Markdown, or PDF files.");
        }
        
        // Decode base64 to buffer
        const buffer = Buffer.from(fileBase64, "base64");
        
        // Validate file size (16MB limit)
        if (buffer.length > 16 * 1024 * 1024) {
          throw new Error("File size exceeds 16MB limit");
        }
        
        // Extract text content
        const content = await processFile(buffer, fileType);
        
        if (!content || content.length === 0) {
          throw new Error("No text content could be extracted from the file");
        }
        
        // Upload to S3
        const fileKey = `scripts/${ctx.user.id}/${nanoid()}-${fileName}`;
        const { url: fileUrl } = await storagePut(fileKey, buffer, 
          fileType === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
          fileType === "pdf" ? "application/pdf" : "text/markdown"
        );
        
        // Save to database
        const scriptTitle = title || fileName.replace(/\.[^/.]+$/, "");
        await createScript({
          userId: ctx.user.id,
          title: scriptTitle,
          content,
          originalFileName: fileName,
          fileType,
          fileKey,
          fileUrl,
        });
        
        return {
          success: true,
          message: "Script uploaded successfully",
        };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserScripts(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getScriptById(input.id, ctx.user.id);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteScript(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  recordings: router({
    create: protectedProcedure
      .input(z.object({
        scriptId: z.number(),
        audioBase64: z.string(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { scriptId, audioBase64, duration } = input;
        
        // Verify script ownership
        await getScriptById(scriptId, ctx.user.id);
        
        // Decode base64 to buffer
        const buffer = Buffer.from(audioBase64, "base64");
        
        // Validate file size (16MB limit)
        if (buffer.length > 16 * 1024 * 1024) {
          throw new Error("Audio file size exceeds 16MB limit");
        }
        
        // Upload to S3
        const audioFileKey = `recordings/${ctx.user.id}/${nanoid()}.webm`;
        const { url: audioFileUrl } = await storagePut(audioFileKey, buffer, "audio/webm");
        
        // Save to database
        const result = await createRecording({
          scriptId,
          userId: ctx.user.id,
          audioFileKey,
          audioFileUrl,
          duration,
        });
        
        return {
          success: true,
          recordingId: Number((result as any)[0]?.insertId || 0),
          audioFileUrl,
        };
      }),
    
    list: protectedProcedure
      .input(z.object({ scriptId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify script ownership
        await getScriptById(input.scriptId, ctx.user.id);
        return await getScriptRecordings(input.scriptId, ctx.user.id);
      }),
    
    transcribe: protectedProcedure
      .input(z.object({
        recordingId: z.number(),
        audioUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { transcribeAudio } = await import("./_core/voiceTranscription");
        
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
        });
        
        // Check if transcription was successful
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        // Update recording with transcription
        await updateRecordingTranscription(input.recordingId, result.text);
        
        return {
          success: true,
          transcription: result.text,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
