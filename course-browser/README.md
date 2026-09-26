# Course Browser

An Expo and React Native course browser for exploring active courses, sections, schedules, prerequisites, and enrolment availability.

## Run locally

```bash
npm install
npx expo start
```

Use the Expo CLI shortcuts to open the app in a development build, simulator, or browser.

## Local data

The app reads its bundled course data from `src/data/local-data.json`. To rebuild that file from the parquet database, run:

```bash
npm run build:local-data
```
