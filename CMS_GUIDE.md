# Greenovation Club - Custom Headless CMS Guide

This project features a **Custom Headless Content Management Service & Command Center** built directly into `backend/`, replacing Decap CMS with an instant, zero-dependency, tailored system.

---

## 1. Why a Custom CMS?

* **No Third-Party OAuth Gateways**: Zero reliance on GitHub OAuth, Netlify Identity, or external proxies.
* **Instant Local & Production Ready**: Directly reads from and writes to canonical JSON stores (`events.json`, `members.json`, `achievements.json`, `magazines.json`, `gallery.json`, `site_config.json`).
* **Valorant/Cyberpunk Tactical Aesthetic**: Fully custom UI that reflects Greenovation Club's brand design.
* **Integrated Media Hub**: Drag-and-drop file uploads, image preview modal, copy path shortcuts, and media management.
* **Granular REST CRUD API**: Clean RESTful endpoints for events, personnel, milestones, publications, and recruitment settings.

---

## 2. Quick Start

### Starting Frontend & Backend

```bash
# Start Frontend (http://localhost:3000)
npm run dev

# Start Custom CMS Backend (http://localhost:8080/admin/)
npm run dev:backend
```

### Accessing the Control Center

1. Open your browser and go to:
   ```
   http://localhost:8080/admin/
   ```
2. Enter the clearance passcode:
   ```
   Greenovation@2026!
   ```

---

## 3. Collections Managed

1. **Events & Operations** (`frontend/public/data/events.json`)
   - Add/edit/delete events, banners, dates, locations, categories (upcoming, ongoing, past), short summaries, and dossier descriptions.
2. **Personnel & Team Members** (`frontend/public/data/members.json`)
   - Manage core team, executive body, faculty, advisors, tenure periods, founder badges, photos, and social handles.
3. **Achievements & Milestones** (`frontend/public/data/achievements.json`)
   - Milestone cards, achievement years, trophy/globe icons, certificates, and external validation links.
4. **Publications & Reports** (`frontend/public/data/magazines.json`)
   - Annual reports, magazine volumes, cover images, and direct PDF upload links.
5. **Gallery Photo Stream** (`frontend/public/data/gallery.json`)
   - Live photo stream images displayed across the site's interactive gallery.
6. **Site Settings & Recruitment Protocol** (`frontend/public/data/site_config.json`)
   - Toggle recruitment open/closed in real time, customize intake badge, heading, notice, external application links, and official contact channels.
7. **Media Hub Repository** (`frontend/public/images/uploads/`)
   - Direct file uploader for photos and documents with single-click path copying.

---

## 4. Multi-Tier Security Model

* **Tier 1: Clearance Gatekeeper**: SHA-256 client-side cryptographic lock screen with brute-force rate-limiting (3 failed attempts = 5-minute lockout).
* **Tier 2: Direct File Integrity**: Safe path normalization preventing directory traversal attacks.
* **Tier 3: Session Expiry**: Sessions are scoped to the browser tab with a manual `[!] Lock Console` quick action.
