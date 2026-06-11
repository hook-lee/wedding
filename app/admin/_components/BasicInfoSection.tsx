"use client";
import { useState } from "react";
import { SlugField } from "./SlugField";
import { utcIsoToKstDateTimeLocal } from "@/lib/date/kst";
import type { Tables } from "@/lib/supabase/types";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Field } from "@/app/_ui/Field";
import { Input } from "@/app/_ui/Input";
import { Select } from "@/app/_ui/Select";

export function BasicInfoSection({ site }: { site: Tables<"wedding_sites"> }) {
  const [groomName, setGroomName] = useState(site.groom_name ?? "");
  const [brideName, setBrideName] = useState(site.bride_name ?? "");

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
        <Select name="name_joiner" defaultValue={site.name_joiner}>
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
    </Card>
  );
}
