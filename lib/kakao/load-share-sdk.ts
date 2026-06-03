declare global {
  interface Window {
    Kakao: {
      isInitialized: () => boolean;
      init: (key: string | undefined) => void;
      Share: {
        sendDefault: (params: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: { mobileWebUrl: string; webUrl: string };
          };
        }) => void;
      };
    };
  }
}

let loaded = false;

export function loadKakaoShareSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined")
      return reject(new Error("not browser"));
    if (loaded || window.Kakao?.isInitialized?.()) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-kakao-share-sdk]",
    );
    if (existing) {
      existing.addEventListener(
        "load",
        () => {
          if (!window.Kakao.isInitialized()) {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_SHARE_KEY);
          }
          loaded = true;
          resolve();
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.crossOrigin = "anonymous";
    script.dataset.kakaoShareSdk = "true";
    script.onload = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_SHARE_KEY);
      }
      loaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Kakao SDK load failed"));
    document.head.appendChild(script);
  });
}

export {};
