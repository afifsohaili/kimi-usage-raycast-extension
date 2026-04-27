# Kimi Code Usage

Monitor your Kimi for Coding API usage and rate limits from the Raycast menu bar.

## Features

- **Menu bar** — Shows current 5h rate limit usage at a glance
- **Auto-refresh** — Updates every 5 minutes automatically
- **Color-coded alerts** — Green → Yellow → Orange → Red as usage increases
- **Detail view** — Full breakdown of weekly quota, rate limits, and account info
- **Quick actions** — Refresh, open Kimi console, or jump to preferences

## Setup

1. Install dependencies:
   ```bash
   cd raycast-kimi-code
   npm install
   ```

2. Open Raycast and run **Import Extension**, select this folder.

3. Set your **Kimi API Key** in the extension preferences.

   > Find your API key at [https://www.kimi.com/code/console](https://www.kimi.com/code/console)

## Commands

| Command | Mode | Description |
|---------|------|-------------|
| Kimi Usage | Menu Bar | Shows usage in the macOS menu bar |
| Kimi Usage Detail | View | Full usage breakdown with all details |

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for distribution
npm run lint     # Run linter
```

## License

MIT
