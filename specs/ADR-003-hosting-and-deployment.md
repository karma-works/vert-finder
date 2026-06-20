# ADR-003: Hosting and Deployment (GitHub Pages vs Cloudflare Pages)

**Status:** Decided (GitHub Pages for MVP, migrate to Cloudflare Pages if needed)

**Date:** 2026-06-20

## Context

The app is a static site (Vite build output: HTML, JS, CSS, JSON data files). No backend server, no database. Hosting requirements:
- Free or very cheap
- Auto-deploy from Git (push to main → site updates)
- Global CDN (fast for users worldwide)
- Support for large file uploads (GeoJSON files can be 5–50 MB per region)

### Alternatives considered:

**A) GitHub Pages** (chosen for MVP)
- Pros: Free, integrated with GitHub, instant deploy, no configuration, supports large files
- Cons: GitHub-only, slower CDN than Cloudflare, no serverless functions, minimal customization

**B) Cloudflare Pages** (chosen for Phase 1+)
- Pros: Free, faster global CDN than GitHub, supports serverless functions, more flexible, easy migration
- Cons: Requires Cloudflare account, slightly more setup

**C) Vercel**
- Pros: Easy deploy, serverless functions, good performance
- Cons: Requires account, paid tier for high usage, more opinionated build process

**D) AWS S3 + CloudFront**
- Pros: Mature, highly configurable, global CDN
- Cons: Complex setup, confusing pricing, not suitable for a free tool (costs can surprise you)

**E) Self-hosted (VPS)**
- Pros: Full control, potentially cheaper at scale
- Cons: DevOps burden, cost, reliability risk

## Decision

**MVP (Phase 0):** Use **GitHub Pages**.
- Free, zero setup, instant deploy from main branch.
- Perfectly adequate for launch.

**Phase 1 (once you have users):** Migrate to **Cloudflare Pages**.
- Better CDN, serverless functions for future features (e.g., URL shortening, custom route sharing).
- Low migration effort (change DNS, done).

## Rationale

**For MVP (GitHub Pages):**

1. **Speed to launch:** You can have a live site in 10 minutes. No account setup, no DNS configuration. Push to GitHub → site is live.

2. **Zero cost:** Free tier is unlimited for public repos. No surprise bills.

3. **Integration:** GitHub Pages automatically publishes from `gh-pages` branch or `/docs` folder. Vite build output goes there. One command in CI/CD.

4. **Adequate performance:** GitHub's CDN is not as fast as Cloudflare, but acceptable. Page loads in 2–3 seconds for most users. Sufficient for MVP.

**For Phase 1 (Cloudflare Pages):**

1. **Faster CDN:** Cloudflare's global CDN is faster than GitHub's. Page loads in 1–2 seconds worldwide.

2. **Serverless functions:** If you want to add features like "save route to localStorage" or "generate short share links," you'll need a tiny backend. Cloudflare Workers (serverless functions) are free for up to 100k requests/day.

3. **Easy migration:** Cloudflare and GitHub Pages both support DNS-based deployment. Migration is DNS change + Git push. No data migration needed.

4. **Future-proof:** Cloudflare is more flexible. If your needs grow (API for route data, user accounts), Cloudflare Pages can handle it better.

## What This Option Does NOT Do Well

**GitHub Pages:**
- **Serverless functions:** Not supported. If you need a backend, you can't add it on GitHub Pages.
  - **Mitigation:** For MVP, you don't need a backend. All computation is pre-computed and served as static files.

- **Enforce HTTPS only:** You can enable HTTPS, but it's optional. Cloudflare forces HTTPS by default.
  - **Mitigation:** Enable HTTPS in GitHub Pages settings (under "Custom domain").

- **Custom domain with HTTPS:** If you use a custom domain, HTTPS setup is slightly more complex (requires configuring DNS).
  - **Mitigation:** Use github.io subdomain for MVP (free, automatic HTTPS). Migrate to custom domain + Cloudflare later.

**Cloudflare Pages:**
- **Learning curve:** Cloudflare has more configuration options. More to learn.
  - **Mitigation:** Documentation is good. Setup is still <30 minutes.

## Consequences

1. **CI/CD:** You'll need a GitHub Actions workflow to build (Vite) and deploy. Example:
   ```yaml
   - name: Build
     run: npm run build
   - name: Deploy to GitHub Pages
     uses: peaceiris/actions-gh-pages@v3
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
       publish_dir: ./dist
   ```

2. **Domain naming:** GitHub Pages subdomain is `username.github.io/repo-name/`. You can set up a custom domain, but that adds DNS setup.

3. **Build output:** Vite outputs to `dist/` directory. Ensure CI/CD publishes this to GitHub Pages.

4. **Large files:** GitHub Pages supports files up to 100 GB per repository. GeoJSON files are only 5–50 MB per region, so no issue.

5. **Pricing:** GitHub Pages is free forever. Cloudflare Pages is also free forever (fair-use up to 500 builds/month).

6. **Migration path:** When you migrate from GitHub Pages to Cloudflare, you'll change your DNS to point to Cloudflare, then tell Cloudflare to serve from your GitHub repo. Zero code changes.

## Related Decisions

- **No backend API:** This decision locks you into static hosting. If you need dynamic content (user accounts, real-time updates), you'll need a backend and serverless functions.
- **Pre-computed elevation data:** All elevation gain is computed offline (in CI/CD), not on request. This works with static hosting.
