import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  Music,
  Sparkles,
  MessageSquareHeart,
  Image as ImageIcon,
  Send,
  RotateCcw,
  BookOpen,
  Check,
  Heart,
  Eye,
  Share2,
  Copy,
} from 'lucide-react';
import { LoveStoryContent } from '../data/loveStoryData';
import { validateImportedStoryContent } from '../utils/storyLogic';

export type GeminiModelOption =
  | 'gemini-4-argon'
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
}

interface StudioAndAssistantModalProps {
  isOpen: boolean;
  initialTab?: 'customize' | 'analyze' | 'chat';
  initialAnalyzeImage?: { imageUrl: string; title: string } | null;
  onClose: () => void;
  content: LoveStoryContent;
  isGiftMode: boolean;
  onToggleGiftMode: (enabled: boolean) => void;
  onPublishToServer: () => Promise<{ ok: boolean; publishedAt?: string; error?: string }>;
  lastPublishedAt: string | null;
  onImportContent: (newContent: LoveStoryContent) => void;
  onResetToDefaults: () => void;
  onExportBackup: () => void;
  currentTrackName: string;
  onSelectCustomAudio: (fileUrl: string, fileName: string) => void;
  onResetDefaultAudio: () => void;
}

export const StudioAndAssistantModal: React.FC<
  StudioAndAssistantModalProps
> = ({
  isOpen,
  initialTab = 'customize',
  initialAnalyzeImage = null,
  onClose,
  content,
  isGiftMode,
  onToggleGiftMode,
  onPublishToServer,
  lastPublishedAt,
  onImportContent,
  onResetToDefaults,
  onExportBackup,
  currentTrackName,
  onSelectCustomAudio,
  onResetDefaultAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'customize' | 'analyze' | 'chat'>(
    initialTab
  );
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Image Analysis State (gemini-4-argon)
  const [selectedImageBase64, setSelectedImageBase64] = useState<string>(
    initialAnalyzeImage?.imageUrl || ''
  );
  const [imagePrompt, setImagePrompt] = useState(
    'Write a tender, sincere anniversary caption and short reflection for this memory of James and Baby Loraine.'
  );
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Multi-turn Chat State
  const [selectedModel, setSelectedModel] =
    useState<GeminiModelOption>('gemini-3.8-flash');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: 'Hello James! I am your Anniversary Storyteller & Keepsake Assistant. I know your real timeline with Baby Loraine (first met June 15–20, 2016; official couple October 26, 2022; 4th anniversary October 26, 2026). How can I help you finalize your placeholders, love notes, or future wishes today?',
      modelUsed: 'Anniversary Companion',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialAnalyzeImage?.imageUrl) {
      setSelectedImageBase64(initialAnalyzeImage.imageUrl);
      setActiveTab('analyze');
    }
  }, [initialAnalyzeImage]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (!isOpen) return null;

  const handlePublishClick = async () => {
    setIsPublishing(true);
    setPublishMessage(null);
    const res = await onPublishToServer();
    setIsPublishing(false);
    if (res.ok) {
      setPublishMessage(
        'Saved & locked in! Your photos and edits are now stored on the server so Loraine will see them when she opens the link on her phone or computer.'
      );
    } else {
      setPublishMessage(
        res.error || 'Could not publish right now. Please try again.'
      );
    }
  };

  const handleCopyGiftLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('gift', '1');
    url.searchParams.delete('autostart');
    navigator.clipboard?.writeText(url.toString());
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const validation = validateImportedStoryContent(parsed);
        if (!validation.valid || !validation.data) {
          setImportStatus({
            type: 'error',
            message: validation.error || 'Invalid backup file.',
          });
          return;
        }
        onImportContent(validation.data);
        setImportStatus({
          type: 'success',
          message:
            'Your saved anniversary package has been restored successfully!',
        });
      } catch {
        setImportStatus({
          type: 'error',
          message: 'Could not parse JSON file. Please select a valid backup.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSelectCustomAudio(url, file.name);
  };

  const handleAnalyzeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImageBase64(reader.result);
        setAnalysisResult('');
      }
    };
    reader.readAsDataURL(file);
  };

  const runImageAnalysis = async () => {
    if (!selectedImageBase64) return;
    setIsAnalyzing(true);
    setAnalysisResult('');
    try {
      const response = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: selectedImageBase64,
          prompt: imagePrompt,
          model: 'gemini-4-argon',
        }),
      });
      const data = await response.json();
      setAnalysisResult(
        data.text ||
          data.error ||
          'Could not analyze the image right now. Please try again.'
      );
    } catch {
      setAnalysisResult(
        'Unable to reach the image analysis service right now.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...chatHistory, userMsg];
    setChatHistory(nextHistory);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: nextHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });
      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text:
            data.text ||
            data.error ||
            'I am here to help you craft sincere words for Baby Loraine.',
          modelUsed: data.modelUsed || selectedModel,
        },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: 'Connection interrupted. You can still edit any section directly on the page.',
          modelUsed: 'Offline Helper',
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Check if any bracketed placeholders remain in the user's content
  const remainingPlaceholdersCount = JSON.stringify(content).match(
    /\[[A-Z0-9 ',-]+\]/g
  )?.length || 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customize, Publish & Gemini Memory Studio"
      className="fixed inset-0 z-50 bg-[#140309]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-[#270812] border-2 border-[#D8B16D] shadow-[0_28px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#3B0C1D] border-b border-[#D8B16D]/30">
          <div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#FFF7F0]">
              Keepsake Studio &amp; Finalize for Loraine
            </h2>
            <p className="text-xs text-[#D8B16D]">
              Lock in your uploaded photos &amp; edits, preview Loraine’s Gift
              View, or export your backup
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Keepsake Studio"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4A1025] hover:bg-[#611530] border border-[#D8B16D]/50 text-xs text-[#FFF7F0] cursor-pointer"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          role="tablist"
          className="flex flex-wrap items-center gap-2 px-6 py-3 bg-[#2E0917] border-b border-[#D8B16D]/20"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'customize'}
            onClick={() => setActiveTab('customize')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'customize'
                ? 'bg-[#D8B16D] text-[#270812] font-semibold'
                : 'text-[#F1D6DC] hover:text-[#FFF7F0]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Finalize, Lock In &amp; Share</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analyze'}
            onClick={() => setActiveTab('analyze')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'analyze'
                ? 'bg-[#D8B16D] text-[#270812] font-semibold'
                : 'text-[#F1D6DC] hover:text-[#FFF7F0]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Analyze Photo Memory (gemini-4-argon)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#D8B16D] text-[#270812] font-semibold'
                : 'text-[#F1D6DC] hover:text-[#FFF7F0]'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>Love Story Assistant Chat</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'customize' && (
            <div className="space-y-6">
              {/* STEP 1: LOCK IN & PUBLISH FOR LORAINE */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#4A1025] to-[#2E0917] border-2 border-[#D8B16D] shadow-lg space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D8B16D]">
                    <Heart className="w-4 h-4 fill-[#D8B16D]" />
                    <span>Next Step After Uploading Your Photos</span>
                  </div>
                  {lastPublishedAt && (
                    <span className="text-xs text-emerald-300 font-mono-tabular">
                      Last Saved to Server:{' '}
                      {new Date(lastPublishedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <h3 className="font-serif-editorial text-2xl sm:text-3xl text-[#FFF7F0]">
                  1. Lock In Your Photos &amp; Switch to Loraine’s Gift View
                </h3>

                <p className="text-xs sm:text-sm text-[#F1D6DC]/95 leading-relaxed">
                  Right now, the photos and text edits you just added are stored
                  in your browser. Click{' '}
                  <strong>Save &amp; Lock In for Loraine’s Link</strong> below
                  so your changes are saved to the application server—ensuring
                  that when Loraine opens the link on her phone or computer, she
                  sees all of your real photos and personal words with all
                  editing buttons hidden.
                </p>

                {remainingPlaceholdersCount > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#270812]/80 border border-[#D8B16D]/40 text-xs text-[#F1D6DC]">
                    <strong className="text-[#D8B16D]">
                      Quick Check Before Sending to Loraine:
                    </strong>{' '}
                    You still have{' '}
                    <span className="font-mono-tabular font-semibold text-[#FFF7F0]">
                      {remainingPlaceholdersCount}
                    </span>{' '}
                    bracketed starter placeholder(s) (like{' '}
                    <code>[ADD DATE]</code> or{' '}
                    <code>[JAMES&apos;S PERSONAL MESSAGE]</code>) in the
                    timeline, notes, or gifts if you’d like to personalize them
                    too.
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={handlePublishClick}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D8B16D] hover:bg-[#E7C686] text-[#270812] text-xs sm:text-sm font-semibold shadow-md transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>
                      {isPublishing
                        ? 'Saving Your Photos & Edits...'
                        : 'Save & Lock In for Loraine’s Link ♥'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleGiftMode(!isGiftMode);
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#270812] hover:bg-[#3A0C1D] border border-[#D8B16D] text-xs sm:text-sm font-medium text-[#FFF7F0] transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#D8B16D]" />
                    <span>
                      {isGiftMode
                        ? 'Switch Back to Edit Mode'
                        : 'Preview as Loraine (Hide All Edit Buttons)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyGiftLink}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#270812]/80 hover:bg-[#3A0C1D] border border-[#D8B16D]/50 text-xs sm:text-sm font-medium text-[#D8B16D] transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>
                      {copiedLink
                        ? 'Copied Loraine’s Gift Link!'
                        : 'Copy Loraine’s Gift Link (?gift=1)'}
                    </span>
                  </button>
                </div>

                {publishMessage && (
                  <p className="text-xs sm:text-sm text-emerald-300 font-medium pt-1">
                    ✓ {publishMessage}
                  </p>
                )}
              </div>

              {/* 2. Download Backup File (.json) */}
              <div className="p-5 rounded-xl bg-[#3A0C1D]/60 border border-[#D8B16D]/35 space-y-4">
                <h3 className="font-serif-editorial text-2xl text-[#FFF7F0]">
                  2. Download a Permanent Backup Copy (.json)
                </h3>
                <p className="text-xs sm:text-sm text-[#F1D6DC]/90 leading-relaxed">
                  Always keep a personal copy of your work! Click{' '}
                  <strong>Download Project Backup (.json)</strong> to save a
                  single file containing all of your uploaded photos, captions,
                  letters, and love notes on your device.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D8B16D] text-[#270812] text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Project Backup (.json)</span>
                  </button>

                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A1025] hover:bg-[#5E142F] border border-[#D8B16D] text-xs font-medium text-[#FFF7F0] cursor-pointer">
                    <Upload className="w-4 h-4 text-[#D8B16D]" />
                    <span>Import Saved Backup (.json)</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      className="sr-only"
                      aria-label="Import saved anniversary JSON backup"
                    />
                  </label>

                  {confirmReset ? (
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950 border border-red-400 text-xs text-white">
                      <span>Reset all custom edits?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onResetToDefaults();
                          setConfirmReset(false);
                        }}
                        className="underline font-semibold cursor-pointer"
                      >
                        Yes, Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="opacity-80 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#F1D6DC]/25 text-xs text-[#F1D6DC]/80 hover:text-[#FFF7F0] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Starter Placeholders</span>
                    </button>
                  )}
                </div>

                {importStatus && (
                  <p
                    className={`text-xs font-medium ${
                      importStatus.type === 'success'
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {importStatus.message}
                  </p>
                )}
              </div>

              {/* 3. Piano Music Track Replacement */}
              <div className="p-5 rounded-xl bg-[#3A0C1D]/60 border border-[#D8B16D]/35 space-y-4">
                <h3 className="font-serif-editorial text-2xl text-[#FFF7F0]">
                  3. Soft Romantic Piano Music Controls
                </h3>
                <p className="text-xs sm:text-sm text-[#F1D6DC]/90 leading-relaxed">
                  Currently active track:{' '}
                  <strong className="text-[#D8B16D]">{currentTrackName}</strong>
                  . You can upload your own licensed `.mp3` or `.wav` piano
                  recording right now to preview it, or keep the built-in soft
                  felt piano synthesizer.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D8B16D] text-[#270812] text-xs font-semibold cursor-pointer">
                    <Music className="w-4 h-4" />
                    <span>Choose Local Piano Recording (.mp3 / .wav)</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="sr-only"
                      aria-label="Upload custom piano audio file"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={onResetDefaultAudio}
                    className="px-4 py-2.5 rounded-xl border border-[#D8B16D]/40 text-xs text-[#F1D6DC] hover:text-[#FFF7F0] cursor-pointer"
                  >
                    Use Built-in Soft Felt Piano Synthesizer
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analyze' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-[#3A0C1D]/60 border border-[#D8B16D]/35 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif-editorial text-2xl text-[#FFF7F0]">
                      Photo Memory Analyzer
                    </h3>
                    <p className="text-xs text-[#D8B16D]">
                      Powered by model <code>gemini-4-argon</code> · Upload a
                      photo to generate heartfelt captions &amp; reflections
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D8B16D] text-[#270812] text-xs font-semibold cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo to Analyze</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAnalyzeImageUpload}
                      className="sr-only"
                      aria-label="Upload photo for Gemini analysis"
                    />
                  </label>
                </div>

                {selectedImageBase64 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
                    <div className="md:col-span-5 rounded-xl overflow-hidden border border-[#D8B16D]/50 bg-[#270812]">
                      <img
                        src={selectedImageBase64}
                        alt="Selected memory for analysis"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="md:col-span-7 space-y-3">
                      <label className="block text-xs uppercase tracking-wider text-[#D8B16D]">
                        What would you like Gemini to write about this photo?
                      </label>
                      <textarea
                        rows={3}
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        aria-label="Prompt for image analysis"
                        className="w-full p-3 rounded-lg bg-[#270812] border border-[#D8B16D]/50 text-xs sm:text-sm text-[#FFF7F0]"
                      />
                      <button
                        type="button"
                        disabled={isAnalyzing}
                        onClick={runImageAnalysis}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D8B16D] hover:bg-[#E7C686] disabled:opacity-50 text-[#270812] text-xs font-semibold cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {isAnalyzing
                            ? 'Analyzing with gemini-4-argon...'
                            : 'Analyze Photo with gemini-4-argon'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {analysisResult && (
                  <div className="p-5 rounded-xl ivory-paper border border-[#D8B16D] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#4A1025] font-semibold uppercase tracking-wider">
                      <span>Suggested Anniversary Reflection</span>
                      <span className="inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>gemini-4-argon</span>
                      </span>
                    </div>
                    <p className="font-serif-editorial text-lg sm:text-xl text-[#270812] whitespace-pre-line leading-relaxed">
                      {analysisResult}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-[54vh]">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#D8B16D]/25">
                <div>
                  <h3 className="font-serif-editorial text-xl text-[#FFF7F0]">
                    Romantic Storyteller &amp; Personalization Assistant
                  </h3>
                  <p className="text-xs text-[#F1D6DC]/80">
                    Multi-turn Gemini chat grounded in James &amp; Baby
                    Loraine’s real anniversary dates
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="gemini-model-select"
                    className="text-xs text-[#D8B16D]"
                  >
                    Model:
                  </label>
                  <select
                    id="gemini-model-select"
                    value={selectedModel}
                    onChange={(e) =>
                      setSelectedModel(e.target.value as GeminiModelOption)
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#3A0C1D] border border-[#D8B16D]/50 text-xs text-[#FFF7F0]"
                  >
                    <option value="gemini-4-argon">
                      gemini-4-argon (Complex &amp; Deep Letters)
                    </option>
                    <option value="gemini-3.8-flash">
                      gemini-3.8-flash (General Storytelling)
                    </option>
                    <option value="gemini-3.1-flash-lite">
                      gemini-3.1-flash-lite (Fast Captions &amp; Notes)
                    </option>
                  </select>
                </div>
              </div>

              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto space-y-4 pr-2"
              >
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#D8B16D] text-[#270812] font-medium'
                          : 'bg-[#3A0C1D] text-[#FFF7F0] border border-[#D8B16D]/35'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[11px] text-[#F1D6DC]/60 mt-1 px-1">
                      {msg.role === 'user'
                        ? 'James'
                        : msg.modelUsed || selectedModel}
                    </span>
                  </div>
                ))}
                {isSendingChat && (
                  <div className="text-xs text-[#D8B16D] italic">
                    Writing a thoughtful response with {selectedModel}...
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendChat}
                className="pt-4 mt-4 border-t border-[#D8B16D]/25 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask for help personalizing a love note, caption, or future wish for Baby Loraine..."
                  aria-label="Message to Anniversary Storyteller Chat"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#3A0C1D] border border-[#D8B16D]/50 text-xs sm:text-sm text-[#FFF7F0] placeholder:text-[#F1D6DC]/50"
                />
                <button
                  type="submit"
                  disabled={isSendingChat || !chatInput.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D8B16D] hover:bg-[#E7C686] disabled:opacity-40 text-[#270812] text-xs font-semibold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
