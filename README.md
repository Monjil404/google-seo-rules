# Google SEO Rules — a Claude Code skill

**SEO rules taken straight from Google's own documentation, not from SEO folklore**, plus a zero-dependency audit script. It works as a Claude Code plugin, so Claude checks the rules before it touches your pages.

[বাংলা নিচে ↓](#বাংলা)

- Built from a full read of [Google Search Central](https://developers.google.com/search/docs) (about 85 pages plus the changelog) in **October 2026**.
- Checked line by line against a popular 2026 SEO / AI-SEO checklist, marking each item as ✓ do it, ⚠ Google corrects this, or 🧑 not code.
- Includes `seo-audit.mjs`, which checks a live or local site (titles, canonicals, hreflang, structured data, sitemaps, robots.txt, soft 404s, favicon, 2 MB limit…).

> **Not affiliated with Google.** This is an independent summary in our own words. Google changes its rules often: check the [Search Central changelog](https://developers.google.com/search/updates) for anything after October 2026.

## Why

Many SEO checklists repeat rules Google itself contradicts:

| You'll often hear | Google's own docs |
|---|---|
| "Titles must be ≤60 characters, meta descriptions ≤160" | There is **no length limit**; titles and descriptions are truncated to fit the screen |
| "Add FAQ schema for rich results" | FAQ rich results **ended on 7 May 2026** |
| "Optimise FID" | FID was **replaced by INP** in March 2024 (target < 200 ms) |
| "Set sitemap priority and changefreq" | **Ignored**. `lastmod` counts only if it is consistently accurate |
| "Add llms.txt for Google's AI" | Google Search **ignores** llms.txt and other "AI files" |
| "Put WebSite schema on every section" | Site name: `WebSite` markup on the **home page only**, one name per domain |
| "Freshen your dates" | Changing dates without real changes is a **warning sign** |

The skill holds the real rules, including the biggest current risk: **scaled content abuse** (many programmatic or AI pages without added value, "no matter how created").

## Install

### Option A: plugin (recommended)
In Claude Code:
```
/plugin marketplace add Monjil404/google-seo-rules
/plugin install google-seo-rules@monjil404
```
Or from a terminal:
```bash
claude plugin marketplace add Monjil404/google-seo-rules
claude plugin install google-seo-rules@monjil404
```
Update later with `claude plugin update google-seo-rules@monjil404` (then `/reload-plugins` inside a session).

### Option B: copy the skill folder
Copy `plugins/google-seo-rules/skills/google-seo-rules/` to one of these:
- `~/.claude/skills/google-seo-rules/` (all your projects; on Windows, `%USERPROFILE%\.claude\skills\google-seo-rules\`)
- `<your-repo>/.claude/skills/google-seo-rules/` (one project; commit it to share with your team)

```bash
git clone https://github.com/Monjil404/google-seo-rules
cp -r google-seo-rules/plugins/google-seo-rules/skills/google-seo-rules ~/.claude/skills/
```

## Use

Claude loads the skill automatically for SEO, schema, sitemap, indexing, Search Console and AI-search work. You can also call it directly:
- Plugin install: `/google-seo-rules:google-seo-rules`
- Copied skill: `/google-seo-rules`

Ask, for example:
- "Audit https://example.com for SEO"
- "Why does Search Console say *Crawled – currently not indexed*?"
- "Add structured data to the product page following Google's rules"

### The audit script (no Claude needed)
Needs Node 18+ and has no dependencies.
```bash
node plugins/google-seo-rules/skills/google-seo-rules/seo-audit.mjs https://example.com
node plugins/google-seo-rules/skills/google-seo-rules/seo-audit.mjs http://localhost:3000 about blog/post-1
node plugins/google-seo-rules/skills/google-seo-rules/seo-audit.mjs https://example.com --sample 50
```
- **With no paths**, it checks the home page and samples URLs from the sitemaps listed in robots.txt.
- **ERR** means a Google rule is broken; the exit code is 1, so you can use it in CI. **warn** means a convention or recommendation.
- **Git Bash on Windows:** write paths without the leading slash (`about`, not `/about`), or set `MSYS_NO_PATHCONV=1`, because Git Bash rewrites `/…` arguments.

What it checks:
- **robots.txt:** size and unsupported fields.
- **Sitemaps:** 50k / 50 MB limits, absolute URLs, `lastmod` accuracy, ignored and deprecated tags.
- **Titles and meta:** `<title>`, meta description.
- **Canonical:** absolute, single, no fragment.
- **Page basics:** viewport, `lang`, `<h1>`, image alt, the 2 MB HTML limit.
- **hreflang:** self-reference, absolute URLs.
- **Structured data:** JSON-LD validity; Dataset description 50–5000; WebSite outside the home page; BreadcrumbList ≥2; Event and LocalBusiness required fields; image licence; future dates; deprecated FAQ/HowTo/SearchAction.
- **Other:** soft 404, http→https redirect, favicon format.

## What's inside
```
.claude-plugin/marketplace.json
plugins/google-seo-rules/
├── .claude-plugin/plugin.json
└── skills/google-seo-rules/
    ├── SKILL.md                         # rules, workflow, checklist mapping (loaded by Claude)
    ├── seo-audit.mjs                    # audit script
    └── reference/google-search-rules.md # detailed rules with numbers, limits, deprecation dates
```

## Contributing
Found a rule that changed? Open an issue or PR with a link to the Google docs page or the changelog entry. Please keep entries short, sourced and in your own words.

## Licence
- **Code and text:** [MIT](LICENSE).
- The rules summarise Google Search Central documentation, which Google publishes under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Source: [developers.google.com/search/docs](https://developers.google.com/search/docs).
- Google and Google Search are trademarks of Google LLC.

---

## বাংলা

**Google-এর নিজের ডকুমেন্টেশন থেকে নেওয়া SEO-র আসল নিয়ম**, Claude Code-এর স্কিল হিসেবে। সাথে একটা অডিট স্ক্রিপ্ট আছে, যা যেকোনো সাইট পরীক্ষা করে।

- **উৎস:** ২০২৬ সালের অক্টোবরে Google Search Central-এর প্রায় ৮৫টি পাতা পুরো পড়ে তৈরি।
- **প্রচলিত চেকলিস্টের সাথে মিলানো:** জনপ্রিয় ২০২৬ SEO / AI-SEO চেকলিস্টের প্রতিটি লাইনে চিহ্ন দেওয়া আছে। ✓ মানতে হবে, ⚠ Google সংশোধন করেছে, 🧑 কোড দিয়ে হয় না।
- **অনেক প্রচলিত "নিয়ম" আসলে Google-এর নিয়ম নয়:**
  - শিরোনাম ৬০ অক্ষরের সীমা।
  - FAQ রিচ রেজাল্ট (২০২৬-এর ৭ মে থেকে বন্ধ)।
  - FID, যার জায়গায় এখন INP।
  - সাইটম্যাপের priority।
  - Google-এর জন্য llms.txt।
- **সবচেয়ে বড় ঝুঁকি:** অনেক প্রোগ্রাম-বানানো বা AI-বানানো পাতা, যেগুলোর আলাদা কোনো মূল্য নেই। Google একে বলে "scaled content abuse"।

**ইনস্টল (Claude Code-এ):**
```
/plugin marketplace add Monjil404/google-seo-rules
/plugin install google-seo-rules@monjil404
```
অথবা `plugins/google-seo-rules/skills/google-seo-rules/` ফোল্ডারটা কপি করে `~/.claude/skills/`-এ রাখুন।

**অডিট (Node 18+):**
```bash
node plugins/google-seo-rules/skills/google-seo-rules/seo-audit.mjs https://example.com
```

> এটা Google-এর অফিসিয়াল কিছু নয়, নিজের ভাষায় লেখা সারাংশ। Google প্রায়ই নিয়ম বদলায়, তাই অক্টোবর ২০২৬-এর পরের পরিবর্তন [changelog](https://developers.google.com/search/updates)-এ দেখে নিন।
