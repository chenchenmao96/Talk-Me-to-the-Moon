# Device adaptation and validation

Updated 2026-09-27. The responsive web interface targets phone, tablet, split-view, and desktop use.

## Behavior

- Phone layouts use a single column, larger text and two-column mission navigation on narrow screens.
- Tablet layouts use a single gameplay column up to 1,100 CSS pixels; wider screens use the existing side-by-side layout.
- Controls have a minimum 44 px height, increased to 48 px for coarse pointers. Inputs use 16 px text.
- The viewport permits pinch zoom and includes display safe-area insets.
- Small-screen route facts appear as readable HTML, preserving the same information-disclosure rules as the map.
- Map/chat jump links keep both parts reachable in a single-column layout.
- Settings use visualViewport height and offset, with scrolling when the visible area is short.
- Asynchronous replies do not force input focus on touch devices. Resizing does not recreate the mission or clear the draft.
- Audio initializes on a user gesture and can resume an interrupted context. Mute remains persistent.

## Verification performed

Chrome viewport simulation, not physical-device or cross-browser certification:

| Width × height (CSS px) | Layout case |
| --- | --- |
| 320 × 740 | Small phone |
| 390 × 844 | Phone portrait |
| 430 × 932 | Large phone portrait |
| 504 × 768 | Tablet split view |
| 768 × 1024 | Tablet portrait |
| 820 × 1180 | Tablet portrait |
| 1024 × 1366 | Large tablet portrait |
| 1180 × 820 | Tablet landscape |
| 1366 × 1024 | Large tablet landscape |
| 844 × 390 | Phone landscape |
| 1920 × 1080 | Desktop |

All six missions and their hints were checked in English and Chinese at all eleven sizes (132 combinations). No page or checked content-container horizontal overflow was found; checked controls met the 44 px minimum height. English input text remained 16 px. Homepage and completion screen were also checked at all eleven sizes.

Settings stayed inside the viewport at all eleven sizes plus 390 × 300 and 844 × 240 reduced-height cases; scrolling remained available where required. A typed draft survived all eleven size changes. A live return-policy submission, all-three trial run, release, and badge screen completed successfully.

Physical iPhone/iPad Safari, Android Chrome, and other browser engines still need device-level validation, particularly real keyboard panning, safe-area hardware, and interrupted audio output. These tests used simulated sizes and do not establish coverage of every device model.
