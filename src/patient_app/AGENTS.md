# Design System Rules — read before writing any UI code
This project has one canonical design system: /docs/BRAND_GUIDELINES.md

1. Flutter: import and reuse `patientTheme` from lib/theme/theme.dart.
   Never define a new ThemeData, never use raw Color(0x...) values,
   never hardcode font sizes.
2. `alert-red` (#C1272D) is reserved for the SOS/emergency control ONLY.
   Never use it for any other warning, error, or destructive action.
3. Minimum touch target on the patient app is 88x88dp.
   Minimum body text size on the patient app is 18px. Do not go below these.
4. No icon-only buttons on the patient app — always icon + word label.
5. Do not add new cultural motifs, patterns, or imagery without checking
   Section 5 of BRAND_GUIDELINES.md first.
6. If a screen needs a value that isn't already a token in
   theme.dart / tailwind.config.js, stop and ask rather than inventing one.