"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Input } from "@/app/_ui/Input";
import { MAP_APP_LABELS } from "@/lib/maps/links";
import { MAP_APPS, type ContactInfo, type MapApps } from "@/lib/extras/types";

export function MapContactSection({
  mapApps,
  contact,
}: {
  mapApps: Required<MapApps>;
  contact: Required<ContactInfo>;
}) {
  return (
    <Card>
      <CardHeader
        title="길찾기·연락처"
        hint="하객마다 쓰는 지도 앱이 달라서 여러 개를 함께 켜두면 편해요."
      />

      <div>
        <p className="text-sm text-secondary font-medium mb-2">길찾기 버튼</p>
        <div className="grid grid-cols-3 gap-2">
          {MAP_APPS.map((a) => (
            <label
              key={a}
              className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]"
            >
              <input
                type="checkbox"
                name={`map_app_${a}`}
                defaultChecked={mapApps[a]}
                className="w-4 h-4"
              />
              <span className="text-sm text-ink">{MAP_APP_LABELS[a]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 p-3 bg-bg rounded-md cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            name="contact_enabled"
            defaultChecked={contact.enabled}
            className="w-4 h-4"
          />
          <span className="text-sm text-ink">신랑·신부 전화/문자 버튼 표시</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            name="contact_groom_phone"
            type="tel"
            defaultValue={contact.groom_phone}
            placeholder="신랑 연락처"
            aria-label="신랑 연락처"
          />
          <Input
            name="contact_bride_phone"
            type="tel"
            defaultValue={contact.bride_phone}
            placeholder="신부 연락처"
            aria-label="신부 연락처"
          />
        </div>
        <p className="text-[11px] text-muted">
          번호를 비워두면 그쪽 버튼은 표시되지 않아요.
        </p>
      </div>
    </Card>
  );
}
