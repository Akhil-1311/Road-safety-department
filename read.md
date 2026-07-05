
Home screen looks great — hero card, stats, mini map with pins, campaigns carousel, and the 4-tab nav are all rendering perfectly. Let me now run the testing agent to validate backend + all screens end-to-end:
Action: file_editor create /app/memory/PRD.md --file-text "# Safe Roads, Safer Lives — Product Requirements

## Overview
A civic-tech mobile app for the Road Safety Department. Citizens report road hazards, access emergency helplines, find nearby help, and learn safe-driving habits.

## User
- Guest citizens (no auth) — a device-local UUID identifies the reporter.

## Features (v1)
1. **Home dashboard** — Hero \"Report a hazard\" CTA, live report stats, mini map preview with pins, horizontal scroll of latest campaigns.
2. **Report a hazard** — 6-category grid (pothole / broken signal / accident / debris / streetlight / other), optional photo attach, \"use current location\" toggle, address text, description; sticky submit button.
3. **Learn** — Category chips (all / driving / signals / pedestrian / children), featured tip hero, tip list with detail view.
4. **Help** — Pulsing SOS button (dials 112), quick-dial chips (Police 100, Ambulance 108, Fire 101, Highway 1033, Women 1091, Disaster 1078), tabbed view: Nearby help (hospitals/police/fuel with call button) and My reports (with status pills).
5. **Detail screens** — Full campaign article and full safety tip article with photo hero.

## Tech
- **Frontend**: Expo Router 6, React Native 0.81, Reanimated 4, expo-image, expo-linear-gradient, expo-blur, Ionicons.
- **Backend**: FastAPI + Motor + MongoDB. Endpoints: `/api/reports`, `/api/reports/stats`, `/api/campaigns[/{id}]`, `/api/tips[/{id}]`, `/api/emergency-contacts`, `/api/facilities?type=`.
- **Design**: Deep navy `#1A365D` primary, amber `#F59E0B` secondary, red `#DC2626` emergency; iOS-clean personality; 4 bottom tabs with blurred bar.

## Data seeded on first boot
3 campaigns, 6 safety tips, 6 emergency contacts, 9 facilities.

## Future
- Real device camera & geolocation (expo-image-picker, expo-location).
- Push notifications for report status updates.
- Officer/admin dashboard for triage.
"
Observation: Create successful: /app/memory/PRD.md