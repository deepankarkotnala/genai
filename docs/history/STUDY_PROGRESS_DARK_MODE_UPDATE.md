# Dark-mode comfort and study-progress update

## Dark mode
- Reduced contrast only in dark mode; light mode tokens were not changed.
- Softened near-white text, glass borders, shadows, ambient glows and active navigation states.
- Desaturated the purple accent while preserving accessible link and control contrast.

## Study-time guidance
- Added an ideal study-time pill to every GenAI Mastery module.
- Added a recommended pace: 2–4 focused hours daily and an 8-hour weekend block.
- Added ideal time estimates and completion controls to every H2 topic.
- Added a 95-hour overall curriculum estimate, including practice, coding and recall.

## Progress tracker
- Added `genai-portal/progress.html` and linked it from the GenAI Mastery navigation and home page.
- Tracks weighted topic progress, completed/remaining hours, track progress and module progress.
- Uses the existing `gp.completed` key plus `gp.topicProgress.v1` in browser localStorage.
- Includes JSON export/import and reset controls.
- Static Git hosting keeps progress separate per browser profile. Account-based cross-device sync requires an authenticated backend such as Supabase or Firebase.
