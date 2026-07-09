"use client";
import { useState } from "react";
import { SlugField } from "./SlugField";
import { utcIsoToKstDateTimeLocal } from "@/lib/date/kst";
import type { Tables } from "@/lib/supabase/types";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Field } from "@/app/_ui/Field";
import { Input } from "@/app/_ui/Input";
import { Select } from "@/app/_ui/Select";

const DEFAULT_SHARE_TITLE_SUFFIX = "결혼합니다";

export function BasicInfoSection({
  site,
  shareTitleSuffix,
}: {
  site: Tables<"wedding_sites">;
  shareTitleSuffix: string;
}) {
  const [groomName, setGroomName] = useState(site.groom_name ?? "");
  const [brideName, setBrideName] = useState(site.bride_name ?? "");
  const [nameJoiner, setNameJoiner] = useState(site.name_joiner ?? " ♡ ");
  const [suffix, setSuffix] = useState(shareTitleSuffix);

  const groomDisplay = groomName.trim() || "신랑";
  const brideDisplay = brideName.trim() || "신부";

  return (
    <Card>
      <CardHeader title="기본 정보" />
      <SlugField defaultValue={site.slug} />

      <Field label="신랑 이름">
        <Input
          name="groom_name"
          value={groomName}
          onChange={(e) => setGroomName(e.target.value)}
        />
      </Field>

      <Field label="신부 이름">
        <Input
          name="bride_name"
          value={brideName}
          onChange={(e) => setBrideName(e.target.value)}
        />
      </Field>

      <Field label="결혼식 일시 (한국 시간)">
        <Input
          name="wedding_at"
          type="datetime-local"
          defaultValue={
            site.wedding_at ? utcIsoToKstDateTimeLocal(site.wedding_at) : ""
          }
        />
      </Field>

      <Field label="이름 사이 구분">
        <Select
          name="name_joiner"
          value={nameJoiner}
          onChange={(e) => setNameJoiner(e.target.value)}
        >
          <option value=" ♡ ">
            {groomDisplay} ♡ {brideDisplay}
          </option>
          <option value=" · ">
            {groomDisplay} · {brideDisplay}
          </option>
          <option value=" & ">
            {groomDisplay} & {brideDisplay}
          </option>
          <option value="  ">
            {groomDisplay}  {brideDisplay} (공백)
          </option>
        </Select>
      </Field>

      <Field
        label="카카오톡·링크 공유 시 제목"
        hint="카톡 채팅방 등에 링크를 붙여넣을 때 뜨는 미리보기 제목이에요."
      >
        <Input
          name="share_title_suffix"
          value={suffix}
          onChange={(e) => setSuffix(e.target.value)}
          placeholder={DEFAULT_SHARE_TITLE_SUFFIX}
        />
        <p className="text-xs text-muted pt-1">
          미리보기: {groomDisplay}
          {nameJoiner}
          {brideDisplay} {suffix.trim() || DEFAULT_SHARE_TITLE_SUFFIX}
        </p>
      </Field>
    </Card>
  );
}
