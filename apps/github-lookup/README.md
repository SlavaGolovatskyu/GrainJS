# GitHub Lookup

Grainlet SPA that finds a GitHub user’s public profile by username.

```bash
# from monorepo root
npm install
npm run dev:github-lookup
```

Or from this folder:

```bash
npm install
npm run dev
```

Uses `https://api.github.com/users/{username}` (unauthenticated; subject to GitHub rate limits).
