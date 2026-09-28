import test from "node:test";
import assert from "node:assert/strict";
import { deadlineLabel } from "./dates";
import { slugify } from "./slug";

test("creates human-readable slugs", () => {
    assert.equal(slugify("Divisi Perlengkapan"), "divisi-perlengkapan");
    assert.equal(slugify("Konsumsi & Logistik"), "konsumsi-logistik");
  });

test("keeps deadlines relative to the event date", () => {
    assert.equal(deadlineLabel("2026-10-10", 7), "H-7 · 3 Okt 2026");
    assert.equal(deadlineLabel("2026-10-10", 0), "Hari H · 10 Okt 2026");
    assert.equal(deadlineLabel("2026-10-10", null), "Tidak ada deadline");
  });
