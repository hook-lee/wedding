import { describe, it, expect } from "vitest";
import { validateSlug } from "./validate";

describe("validateSlug", () => {
  it("accepts lowercase alphanumeric with hyphens between", () => {
    expect(validateSlug("changhwan-jiyoung").ok).toBe(true);
    expect(validateSlug("abc").ok).toBe(true);
  });
  it("rejects too short", () => {
    expect(validateSlug("a").ok).toBe(false);
  });
  it("rejects too long (over 50)", () => {
    expect(validateSlug("a".repeat(51)).ok).toBe(false);
  });
  it("rejects leading or trailing hyphen", () => {
    expect(validateSlug("-abc").ok).toBe(false);
    expect(validateSlug("abc-").ok).toBe(false);
  });
  it("rejects uppercase or special chars", () => {
    expect(validateSlug("ABC").ok).toBe(false);
    expect(validateSlug("abc_def").ok).toBe(false);
    expect(validateSlug("abc.def").ok).toBe(false);
  });
});
