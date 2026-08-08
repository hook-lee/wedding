import localFont from "next/font/local";
import {
  Nanum_Myeongjo,
  Gowun_Batang,
  Gowun_Dodum,
  Nanum_Pen_Script,
} from "next/font/google";

export const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

/**
 * Optional invitation fonts, all declared on <html> as CSS variables so a
 * site can switch between them with a [data-font] attribute.
 *
 * Two deliberate choices in every config below:
 *  - `subsets` is omitted. next/font only lists latin/latin-ext/vietnamese
 *    for these families; passing any of them would ship a file WITHOUT the
 *    Korean glyphs. Omitting it pulls every subset, Korean included.
 *  - `preload: false`, which is also what makes omitting `subsets` legal.
 *    A browser only fetches a font file once an element actually renders
 *    with that family, and each site uses exactly one — preloading all of
 *    them would drag megabytes of unused Korean glyphs into every page load.
 */
export const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--font-nanum-myeongjo",
});

export const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--font-gowun-batang",
});

export const gowunDodum = Gowun_Dodum({
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-gowun-dodum",
});

export const nanumPen = Nanum_Pen_Script({
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-nanum-pen",
});

/** Every font variable class, for the root <html> element. */
export const fontVariables = [
  pretendard.variable,
  nanumMyeongjo.variable,
  gowunBatang.variable,
  gowunDodum.variable,
  nanumPen.variable,
].join(" ");
