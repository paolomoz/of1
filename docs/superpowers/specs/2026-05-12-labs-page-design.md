---
title: labs page design
date: 2026-05-12
status: approved
---

# Labs Page — of1.live/labs

## Purpose

A single-page experience that serves as the entry point for the of1 live demo. The user lands on the page, reads a brief explanation, clicks one button, and is handed off to SLICC to run the of1 personalization demo on any website they choose.

Outcome: perceived value through thought leadership — showing of1 in action without any engineering setup on the visitor's side.

## URL

- Primary: `of1.live/labs` (`deploy/labs.html`)
- Alias: `lab.of1.live` (Cloudflare routing, separate plumbing)

## Architecture

Static HTML file: `deploy/labs.html`. No server-side logic. Matches existing site conventions (same CSS variables, fonts, color palette as other deploy pages).

On CTA click: navigate to `https://www.sliccy.ai/handoff?upskill=https://github.com/aem-growth-adoption/of1-demo`

SLICC intercepts the navigation, shows an approval prompt, installs the of1 demo skill, and guides the user from there.

## Page Structure

Single screen, vertically centered. No scroll required on desktop.

1. **Eyebrow** — `of1 / labs` in JetBrains Mono, small, letter-spaced, dimmed
2. **Hero headline** — large Cormorant Garamond, e.g. *"See your website become everyone's website"*
3. **Subtext** — one line explaining what happens: *"Opens SLICC — a browser extension that runs the of1 demo on any site you choose"*
4. **CTA button** — `Let's get started →` — navigates to the SLICC handoff URL
5. **Extension note** — quiet text below the button: *"Requires the SLICC Chrome extension. [Install it here] if you don't have it yet."*

## Visual Design

Follows existing brand exactly:
- Background: `#1C1917` (warm dark)
- Foreground: `#F5F0E8`
- Accent: `#FF3D00` (button)
- Fonts: Cormorant Garamond (headline) + JetBrains Mono (body/eyebrow)
- Consistent with header/footer pattern from other pages

## SLICC Integration

| Field | Value |
|---|---|
| Trigger URL | `https://www.sliccy.ai/handoff?upskill=https://github.com/aem-growth-adoption/of1-demo` |
| Verb | `upskill` |
| Skill repo | `https://github.com/aem-growth-adoption/of1-demo` |
| Mechanism | Browser navigation (SLICC observes `Link` response header on main-frame navigation) |

The skill repo URL is a placeholder — update when the repo is published.

## Out of Scope

- Multiple experiments / labs directory (future)
- Local SLICC server POST fallback
- Multi-step wizard UI
- Any server-side logic
