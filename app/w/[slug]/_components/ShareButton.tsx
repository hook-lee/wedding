"use client";
import { loadKakaoShareSdk } from "@/lib/kakao/load-share-sdk";

type Props = {
  url: string;
  title: string;
  description: string;
  imageUrl: string | null;
};

export function ShareButton({ url, title, description, imageUrl }: Props) {
  async function share() {
    try {
      await loadKakaoShareSdk();
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl: imageUrl ?? "",
          link: { mobileWebUrl: url, webUrl: url },
        },
      });
    } catch {
      if (navigator.share) {
        try {
          await navigator.share({ title, text: description, url });
        } catch {
          /* user dismissed */
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          /* clipboard blocked */
        }
      }
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="카톡 공유"
      className="text-base"
    >
      📤
    </button>
  );
}
