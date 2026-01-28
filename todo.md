# Teleprompter App TODO

## Database & Backend Infrastructure
- [x] Design database schema for scripts, recordings, and transcriptions
- [x] Set up S3 storage helpers for script files and audio recordings
- [x] Create tRPC procedures for script management

## File Upload & Text Extraction
- [x] Implement drag-and-drop file upload interface
- [x] Backend text extraction for DOCX files
- [x] Backend text extraction for Markdown files
- [x] Backend text extraction for PDF files
- [x] Error handling for unsupported file formats
- [x] File validation and size limits
- [x] Upload scripts to S3 with metadata storage

## Teleprompter Display
- [x] Black background with white text display
- [x] Centered, responsive layout
- [x] Preserve paragraph structure from uploaded scripts
- [x] Clean, distraction-free interface

## Scrolling Controls
- [x] Start/Pause button for automatic scrolling
- [x] Reset button to return to beginning
- [x] Smooth scrolling animation (50ms interval)
- [x] Automatic scroll stop at end of content
- [x] Speed control slider (1-10 range)
- [x] Real-time speed indicator display

## Font Size Controls
- [x] A+ button to increase font size
- [x] A- button to decrease font size
- [x] Font size range: 12px to 72px (2px increments)
- [x] Default font size: 24px
- [x] Current font size display

## Speech Recording & Transcription
- [x] Record audio during practice sessions
- [x] Upload recorded audio to S3
- [x] Transcribe speech using voice transcription API
- [x] Display transcription alongside original script
- [x] Compare transcription with original for performance review

## Script Management
- [x] List all uploaded scripts
- [x] Retrieve and display previous scripts
- [x] Delete scripts
- [x] View script metadata (upload date, file name, etc.)

## Testing & Deployment
- [x] Test file upload with all three formats
- [x] Test teleprompter controls (scrolling, speed, font size)
- [x] Test speech recording and transcription
- [x] Test error handling and edge cases
- [x] Create checkpoint for deployment

## GitHub Integration
- [x] Sync application to GitHub repository https://github.com/jamesshastry/teleprompter.git

## Bug Fixes
- [x] Fix teleprompter scrolling functionality
