import type { MapApp } from "@/lib/extras/types";

export type MapTarget = { lat: number; lng: number; name: string };

/**
 * Per-app deep links. Each app gets both an `app` scheme (opens the native
 * app directly, best experience) and a `web` URL used as the fallback when
 * the app isn't installed — the scheme silently does nothing in that case,
 * so the caller navigates to `web` shortly after.
 *
 * Kakao is the exception: its https link both works in a browser and hands
 * off to the installed app, so app and web are the same URL and no fallback
 * timer is needed.
 */
export function mapLinks(app: MapApp, t: MapTarget): { app: string; web: string } {
  const name = encodeURIComponent(t.name);
  switch (app) {
    case "naver":
      return {
        app: `nmap://route/car?dlat=${t.lat}&dlng=${t.lng}&dname=${name}&appname=wedding-zip`,
        web: `https://map.naver.com/p/directions/-/${t.lng},${t.lat},${name}/-/car`,
      };
    case "kakao": {
      const url = `https://map.kakao.com/link/to/${name},${t.lat},${t.lng}`;
      return { app: url, web: url };
    }
    case "tmap":
      return {
        app: `tmap://route?goalname=${name}&goalx=${t.lng}&goaly=${t.lat}`,
        web: `https://tmap.life/route?goalname=${name}&goalx=${t.lng}&goaly=${t.lat}`,
      };
  }
}

export const MAP_APP_LABELS: Record<MapApp, string> = {
  naver: "네이버지도",
  kakao: "카카오맵",
  tmap: "티맵",
};
