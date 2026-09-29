# F034C Floww brand vector restoration / Floww 브랜드 벡터 복원

## Controller integration update — 2026-09-30 08:51 KST

The controller independently reviewed the native SVG paths/gradients and header change, then verified a clean `npm ci`, standard `npm run build`, `npm run lint`, and `npm run test:bff` on pinned Node 24.19.0. All passed; the BFF checks cover authentication, role/bounds, redirect refusal, cookie/bypass isolation and GET-only access. Latest origin/main remained bf99bd6. Client header/footer/icon now use the same symbol and passed real production desktop/mobile rendering plus the combined browser suite. Admin authenticated runtime and final hosted human acceptance are not claimed. The original worker findings below are retained as historical evidence.

- Task: **F034C**, dispatch `task_98f118fbf32c`; human requester: Geondong Kim; implementing agent: dispatched Admin worker; recorded **2026-09-30 08:13 KST**.
- Scope: Admin brand SVG and reusable mark, Admin audit header logo, Admin app icon, visual evidence, and Client integration instructions. Client checkout remained read-only. No auth, API, payment, wallet, or dependency change.
- Repository: `web5five/Floww_Frontend_Admin`, branch `feature/admin-audit-console`, starting commit `49fb94ce77abadc15a11d4b461bb4daa4aa80e0d` (contains merged `origin/main` `bf99bd6`); resulting local commit: the F034C commit containing this report, recorded in the worker handoff. No push, PR, merge, or deploy by this worker.
- Source/decision status: requester supplied the two target image attachments and identified the existing frontend mark as incorrect. Architecture page `11927569` v12 identifies itself as superseded; current Challenge B architecture page `11960323` v5 and workflow page `12517414` v4 were read through Atlassian MCP on 2026-09-30. Repository policy ID `FLOWW-AGENT-2026-09-29-03`. This is an implementation of the requested visual correction, not a new architecture decision. No separate F034C Confluence task page was supplied.
- Worklog sync: **PENDING_SYNC** to the authorized worklog location under page `12517414`; this dispatch authorizes only local code/report work and coordinator handoff. No Confluence write or team acceptance is claimed.

## Source and reconstruction / 출처와 복원

The attached large org mark shows a two-band flowing F, a variable curved white gap, and a rounded lower return. The upper band rises toward the top-right point; the lower band turns under itself with a darker blue overlap. The brand board specifies primary `#4261FF`. The transparent symbol excludes the white app tile and soft shadow. The app icon places the same paths within a white 64 × 64 rounded tile with about 8–12 px of safe padding.

No authoritative source SVG was found in the checked Admin/Client files or the complete public trees of the five `web5five` repositories. The only public SVG match was the Client's older simplified `src/app/icon.svg`. **This is a faithful, manually drawn editable SVG reconstruction, not the exact original vector.** The cubic paths and gradient stops remain native SVG; no raster is embedded. The wordmark uses the existing site typeface with `Floww` text because the exact source font is unknown. No registered trademark glyph was added.

Files:

| Path | Purpose |
| --- | --- |
| `public/brand/floww-mark.svg` | Transparent vector symbol and primary reusable source. |
| `src/components/brand-mark.tsx` | Accessible Next image component. Default alt is `Floww`; `decorative` produces empty alt and `aria-hidden`. External SVG document isolates gradient IDs across repeated instances. |
| `src/components/audit-header.tsx` | Audit link now uses the vector beside `Floww` and `ADMIN`; sign-out and navigation behavior are untouched. |
| `src/app/icon.svg` | Same path geometry, with a white app tile and safe padding. |

## Visual inspection / 화면 검토

| Evidence | Observation |
| --- | --- |
| [Large target comparison](F034C_visual/side_by_side_large.png) | Independently rendered SVG preserves the two separated bands, rising right point, and curved lower return. Minor gradient/curve differences remain because this is a reconstruction from raster references. |
| [16/24/32/48 px contact sheet](F034C_visual/small_size_contact_sheet.png) | Native rasterized symbol and tile variants retain a visible F gap at each size; enlarged nearest-neighbor views show the real small-pixel output. |
| [Desktop header, 1440 px](F034C_visual/header_desktop_1440.png) | Chrome static preview shows symbol, wordmark, admin label, and navigation aligned. |
| [Mobile header, constrained 390 px](F034C_visual/header_mobile_390.png) | Chrome static preview shows the same header without clipping. |
| [64 px app icon](F034C_visual/app_icon_64.png) | Tile padding and transparent symbol placement inspected. |

The Chrome header captures use `header_preview.html` / `header_preview_mobile.html`, which mirror only the header markup and CSS. They are **visual previews, not a running Next application or deployed proof**. The desktop capture is 1440 × 160; the mobile header was constrained to a real 390 px layout box before the browser capture was cropped to 390 × 160. `rsvg-convert` rendered the vector comparison and 16/24/32/48 px bitmaps. Both visual sizes and the app icon were opened and inspected.

## Checks / 검증

- `python3` XML `ElementTree.parse` on both SVGs: passed.
- `rsvg-convert` 2.62.3 rendered the large comparison and all 16/24/32/48 px symbols/icons: passed.
- Google Chrome 154.0.8037.57 headless rendered desktop/mobile header previews: screenshots captured and inspected. Chrome remained alive after screenshot capture, so the CLI was stopped; this did not affect the saved evidence.
- `npm run typecheck` and `npm run lint -- --quiet`: passed with a **temporary symlink** to the Client checkout's already installed dependency tree (Next 16.3.6, React 19.3.0, TypeScript 5.9.3). The symlink was removed after checks. Local Node was 25.8.1, while the repository pins Node 24; these focused checks do not substitute for a clean Node 24 install/build.
- `git diff --check`: passed. No full build or dependency installation was run, per dispatch disk constraint. No Admin deployment or live UI was tested.

## Client integration for root / 클라이언트 적용 지침

1. Copy `public/brand/floww-mark.svg`, `src/components/brand-mark.tsx`, and `src/app/icon.svg` to the corresponding Client paths. Its current `src/app/icon.svg` is the older simplified mark.
2. In Client `src/components/header.tsx`, replace the CSS-built `<span className="logo-symbol"><i/><i/><i/></span>` with `<BrandMark size={35} decorative />` inside the existing labeled home link; preserve the `Floww` wordmark text. Do the same for the footer in `src/app/layout.tsx`, using a smaller size appropriate to the existing footer.
3. Update Client `src/app/globals.css` wordmark spacing and remove the superseded `.logo-symbol` shape rules. The current generic `.wordmark span` styles also affect the text span; inspect the resulting alignment. The current Client header/footer contain `®`; do not propagate a trademark claim without a verified brand decision.
4. Inspect actual Client desktop/mobile header and footer and the 16/24/32/48 px icon after integration; run the Client's focused typecheck/lint and build gates on the resulting combined head. Root owns this integration and deployment verification.

## Ordered remaining improvements / 후속 작업

1. **Client brand integration:** apply the three files and header/footer CSS changes above. Acceptance: same symbol in Client header, footer, and browser icon at 390 px and desktop; no CSS ribbon remains.
2. **Admin login art consistency:** `src/app/login/page.tsx` still displays text-only lowercase `floww.` because it was outside this worker's owned files. Acceptance: replace it with an appropriate mark + `Floww` treatment while retaining contrast on the blue background and existing sign-in behavior.
3. **Source artwork verification:** if the design owner supplies an original Figma/Illustrator/SVG export, compare its paths/gradient to this reconstruction and replace this asset if needed. Acceptance: design-owner confirmation of geometry and exact wordmark font; no claim of exact original before that.
4. **Combined runtime validation:** controller runs the Admin on pinned Node 24 with real installed dependencies, then verifies the rendered header/icon in the actual app, not only the static previews. Acceptance: passing build and inspected desktop/mobile runtime screenshots for the final combined commit.

Status: **implemented and visually reviewed locally**. Client integration, actual Admin runtime, Confluence sync, deployed verification, and human design acceptance remain pending. Independent reviewer: coordinator, pending; no human or teammate approval is implied.
