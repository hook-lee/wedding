/**
 * Shared Kakao Maps SDK loader.
 *
 * Why: KakaoMap.tsx and MapPicker.tsx used to each inline the loader logic.
 * If KakaoMap injected the <script> first and MapPicker later attached
 * `addEventListener("load", …)` to the same tag, the listener never fired
 * because the load event had already happened. MapPicker also lacked timeout
 * / error UI so failures went silent.
 *
 * This module dedupes via a single module-level promise so every caller awaits
 * the same outcome — first call kicks off the script load, later calls reuse
 * the promise (or return immediately if already resolved).
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

const SDK_TIMEOUT_MS = 8000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sdkPromise: Promise<any> | null = null;

export class KakaoSdkError extends Error {
  constructor(
    public reason: "no-key" | "load-failed" | "timeout",
    message?: string,
  ) {
    super(message ?? reason);
    this.name = "KakaoSdkError";
  }
}

/**
 * Resolve once `window.kakao.maps` is fully loaded.
 * Rejects with `KakaoSdkError` if the key is missing, the script tag fails to
 * load, or the load doesn't finish within `SDK_TIMEOUT_MS`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadKakaoMapsSdk(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new KakaoSdkError("load-failed", "not browser"));
  }

  // Already ready
  if (window.kakao?.maps?.LatLng) {
    return Promise.resolve(window.kakao.maps);
  }

  if (sdkPromise) return sdkPromise;

  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!key) {
    sdkPromise = Promise.reject(new KakaoSdkError("no-key"));
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (
      ok: boolean,
      value?: unknown,
      reason?: KakaoSdkError["reason"],
    ) => {
      if (settled) return;
      settled = true;
      if (ok) resolve(value);
      else reject(new KakaoSdkError(reason ?? "load-failed"));
    };

    const timer = setTimeout(() => finish(false, undefined, "timeout"), SDK_TIMEOUT_MS);

    const runMapsLoad = () => {
      // window.kakao is set as soon as the script executes, but the maps module
      // still needs an explicit `load()` call (autoload=false).
      if (!window.kakao?.maps?.load) {
        clearTimeout(timer);
        finish(false, undefined, "load-failed");
        return;
      }
      window.kakao.maps.load(() => {
        clearTimeout(timer);
        finish(true, window.kakao.maps);
      });
    };

    // If the SDK is already cached/loaded by a parallel call's script tag,
    // skip ahead — addEventListener("load") wouldn't fire retroactively.
    if (window.kakao?.maps?.load) {
      runMapsLoad();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-kakao-sdk]",
    );
    if (existing) {
      // The other caller's script may have already fired its load event before
      // we attached. Poll briefly until `window.kakao` is defined.
      const start = Date.now();
      const poll = setInterval(() => {
        if (window.kakao?.maps?.load) {
          clearInterval(poll);
          runMapsLoad();
        } else if (Date.now() - start > SDK_TIMEOUT_MS) {
          clearInterval(poll);
          clearTimeout(timer);
          finish(false, undefined, "timeout");
        }
      }, 100);
      existing.addEventListener("error", () => {
        clearInterval(poll);
        clearTimeout(timer);
        finish(false, undefined, "load-failed");
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.dataset.kakaoSdk = "true";
    script.onload = runMapsLoad;
    script.onerror = () => {
      clearTimeout(timer);
      finish(false, undefined, "load-failed");
    };
    document.head.appendChild(script);
  });

  // If the promise rejects, allow a future caller to retry (e.g. after fixing
  // a network blip). Clear the cached promise on rejection so it isn't sticky.
  sdkPromise.catch(() => {
    sdkPromise = null;
  });

  return sdkPromise;
}
