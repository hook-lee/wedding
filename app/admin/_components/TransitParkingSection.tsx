"use client";
import { Card, CardHeader } from "@/app/_ui/Card";
import { Field } from "@/app/_ui/Field";
import { Textarea } from "@/app/_ui/Textarea";
import type { SiteExtras } from "@/lib/extras/types";

export function TransitParkingSection({ extras }: { extras: SiteExtras }) {
  return (
    <Card>
      <CardHeader
        title="오시는 길 추가 안내"
        hint="비워두면 해당 항목은 청첩장에 표시되지 않아요."
      />

      <Field
        label="지하철"
        hint="한 줄에 하나씩 적어요. 예) [분당선] 서울숲역 5번 출구 도보 2분"
      >
        <Textarea
          name="transit_subway"
          defaultValue={extras.transit_subway ?? ""}
          rows={3}
          placeholder="[분당선] 서울숲역 5번 출구 도보 2분"
        />
      </Field>

      <Field
        label="버스"
        hint="정류장 이름 + 노선번호. 줄바꿈으로 정류장 구분."
      >
        <Textarea
          name="transit_bus"
          defaultValue={extras.transit_bus ?? ""}
          rows={3}
          placeholder={`뚝섬 서울숲 정류장\n121, 141, 145, 148, 463`}
        />
      </Field>

      <Field
        label="주차 안내"
        hint="자유 형식. 예) 건물 내 B3~B7 2시간 무료, 안내 데스크에서 주차권 수령"
      >
        <Textarea
          name="parking_notes"
          defaultValue={extras.parking_notes ?? ""}
          rows={3}
          placeholder="건물 내 B3~B7 2시간 무료주차"
        />
      </Field>
    </Card>
  );
}
