"use client";
import { useMemo, useState } from "react";
import { AdminForm } from "./AdminForm";
import { PreviewPane } from "./PreviewPane";
import { Icon } from "@/app/w/[slug]/_components/Icon";
import { buildDraftSite } from "@/lib/admin/parse-form";
import type { Tables } from "@/lib/supabase/types";

export function AdminWorkspace({
  site,
  children,
}: {
  site: Tables<"wedding_sites">;
  children: React.ReactNode;
}) {
  const [draftFormData, setDraftFormData] = useState<FormData | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Recomputed only when the (debounced) form snapshot changes — cheap pure
  // merge, no network calls. Falls back to the saved `site` until the user
  // types anything.
  const draft = useMemo(
    () => (draftFormData ? buildDraftSite(site, draftFormData) : site),
    [site, draftFormData],
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-6 lg:items-start">
      <div className="max-w-3xl mx-auto lg:mx-0 lg:max-w-none">
        <AdminForm onDraftChange={setDraftFormData}>{children}</AdminForm>
      </div>

      {/* 데스크탑: 오른쪽 고정 미리보기 패널 */}
      <div className="hidden lg:block lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
        <div className="h-full bg-surface border border-border rounded-lg shadow-card overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 flex-shrink-0">
            <Icon name="home" className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-ink">실시간 미리보기</p>
            <span className="text-[11px] text-muted ml-auto">저장 전 · 나만 보임</span>
          </div>
          <div className="flex-1 min-h-0">
            <PreviewPane draft={draft} />
          </div>
        </div>
      </div>

      {/* 모바일: 하단 고정 미리보기 열기 버튼 */}
      <button
        type="button"
        onClick={() => setMobilePreviewOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 min-h-[44px] px-4 bg-ink text-bg rounded-pill shadow-card text-sm font-medium"
      >
        <Icon name="home" className="w-4 h-4" />
        미리보기
      </button>

      {/* 모바일: 전체화면 미리보기 오버레이 */}
      {mobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-bg flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 flex-shrink-0 bg-surface">
            <p className="text-sm font-semibold text-ink">실시간 미리보기</p>
            <span className="text-[11px] text-muted ml-auto">저장 전 · 나만 보임</span>
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="text-muted hover:text-ink p-1 -m-1 ml-2"
              aria-label="미리보기 닫기"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <PreviewPane draft={draft} />
          </div>
        </div>
      )}
    </div>
  );
}
