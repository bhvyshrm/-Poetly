"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, RotateCcw, Save } from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { CanvasState, getDefaultCanvasState } from "@/lib/canvas-types";
import CanvasPreview from "@/components/canvas/CanvasPreview";
import CanvasControls from "@/components/canvas/CanvasControls";
import AppShell from "@/components/layout/AppShell";
import Toast from "@/components/Toast";

type PoemWithAuthor = Database["public"]["Tables"]["poems"]["Row"] & {
  profiles?: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

const STORAGE_KEY = "poetly-canvas-styles";

export default function CanvasPage() {
  const params = useParams();
  const poemId = params.id as string;
  const previewRef = useRef<HTMLDivElement>(null);

  const [poem, setPoem] = useState<PoemWithAuthor | null>(null);
  const [state, setState] = useState<CanvasState | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("poems")
          .select("*, profiles(*)")
          .eq("id", poemId)
          .single();
        if (data) {
          const authorPoem = data as unknown as PoemWithAuthor;
          setPoem(authorPoem);
          const authorName = authorPoem.profiles?.display_name || "Poet";
          setState(getDefaultCanvasState(authorPoem.title, authorPoem.content, authorName));
        }
      } catch {
        setToast("Failed to load poem");
      } finally {
        setLoading(false);
      }
    })();
  }, [poemId]);

  const updateState = useCallback((updates: Partial<CanvasState>) => {
    setState((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const handleExport = useCallback(async () => {
    if (!previewRef.current || !state) return;
    setExporting(true);

    try {
      const scaleMultiplier = 2;
      const dataUrl = await toPng(previewRef.current, {
        width: state.canvasWidth,
        height: state.canvasHeight,
        pixelRatio: scaleMultiplier,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = `poetly-canvas-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setToast("Canvas exported");
    } catch {
      setToast("Export failed — try again");
    }
    setExporting(false);
  }, [state]);

  const handleSaveStyle = useCallback(() => {
    if (!state) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const style = { ...state, savedAt: new Date().toISOString(), name: `Style ${saved.length + 1}` };
      saved.push(style);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setToast("Style saved");
    } catch {
      setToast("Failed to save style");
    }
  }, [state]);

  const handleReset = useCallback(() => {
    if (!poem) return;
    if (!confirm("Reset canvas to default?")) return;
    const authorName = poem.profiles?.display_name || "Poet";
    setState(getDefaultCanvasState(poem.title, poem.content, authorName));
    setToast("Canvas reset");
  }, [poem]);

  useEffect(() => {
    if (!state) return;
    const container = document.getElementById("canvas-preview-container");
    if (!container) return;
    const containerWidth = container.clientWidth - 40;
    const canvasDisplayWidth = state.canvasWidth * 0.35;
    const newScale = Math.min(0.5, Math.max(0.15, containerWidth / canvasDisplayWidth));
    setScale(newScale);
  }, [state?.canvasWidth, state?.canvasHeight]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !state) {
    return (
      <AppShell maxWidth="wide">
        <div className="py-8 space-y-6">
          <div className="w-32 h-4 skeleton rounded" />
          <div className="h-[400px] skeleton rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!poem) {
    return (
      <AppShell maxWidth="wide">
        <div className="py-16 text-center glass-surface rounded-2xl p-8 border border-border-subtle/40">
          <p className="font-display text-xl text-text-primary">Poem not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6 py-2 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href={`/poem/${poemId}`}
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Stanza</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-border-default hover:bg-surface-hover cursor-pointer"
            >
              <RotateCcw size={12} /> Reset
            </button>
            <button
              onClick={handleSaveStyle}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-full border border-border-default hover:bg-surface-hover cursor-pointer"
            >
              <Save size={12} /> Save Style
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-on-primary bg-primary px-4 py-1.5 rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              <Download size={12} /> {exporting ? "Exporting..." : "Download PNG"}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80 shrink-0 order-2 lg:order-1">
            <div className="glass-surface border border-border-subtle/50 rounded-2xl p-5 max-h-[calc(100vh-160px)] overflow-y-auto">
              <CanvasControls state={state} onChange={updateState} />
            </div>
          </div>

          <div
            id="canvas-preview-container"
            className="flex-1 order-1 lg:order-2 flex items-start justify-center glass-surface rounded-3xl border border-border-subtle/50 p-6 min-h-[460px] overflow-hidden specular-top-border"
          >
            <div style={{ width: state.canvasWidth * scale, height: state.canvasHeight * scale, position: "relative" }}>
              <CanvasPreview state={state} scale={scale} previewRef={previewRef} />
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
