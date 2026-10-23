# Google Search Central: rules for site owners (detailed reference)

> **What this is:** an independent summary, in our own words, of Google's public documentation at developers.google.com/search/docs and developers.google.com/crawling/docs. It is **not** an official Google document and is not affiliated with or endorsed by Google.
>
> **When it was read:** 2026-10-23, about 85 pages plus the changelog. Google changes these rules often, so check the [documentation updates](https://developers.google.com/search/updates) before relying on any single rule.
>
> **Licence of the source:** Google's documentation is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Contents
1. [Search Essentials](#1-search-essentials)
2. [SEO fundamentals](#2-seo-fundamentals)
3. [Crawling and indexing](#3-crawling-and-indexing)
4. [Ranking and search appearance](#4-ranking-and-search-appearance)
5. [Monitoring and debugging](#5-monitoring-and-debugging)
6. [Site-specific notes](#6-site-specific-notes)

---

## 1. Search Essentials

### Technical requirements (the minimum to be indexable)
- Googlebot is not blocked.
- The page returns HTTP 200.
- The content is indexable and doesn't break the spam policies.
- Meeting these does **not** guarantee indexing.
- A URL blocked in robots.txt can still be indexed (without its content). To keep a page out, use `noindex` **and let it be crawled**.

### Key best practices
- Write helpful, people-first content.
- Put the words people search for in the title, main heading, alt text and link text.
- Use crawlable `<a href>` links.
- Tell people about the site.
- Follow the image, video, structured data and JavaScript guides.

### Spam policies (page updated 2026-08-28)
These apply to all of Google web search, **including generative AI responses (since May 2026)**. Since April 2026, spam reports **may lead to manual actions**.

| Policy | In short |
|---|---|
| Cloaking | Showing search engines different content from users. Paywalls are fine if they follow the flexible sampling guidance. |
| Doorway abuse | Many similar pages (per city, region or near-duplicate domain) that funnel users to one place. |
| Expired domain abuse | Reusing an expired domain's reputation for low-value content. |
| Hacked content | Injected code, pages or redirects. |
| Hidden text and links | White-on-white, off-screen, zero-size, or opacity-0 text or links. Accordions, tabs and screen-reader text are fine. |
| Keyword stuffing | Unnatural repetition, lists of cities or phone numbers. |
| Link spam | Buying or selling links that pass ranking, excessive exchanges, automated links, widget or footer links, low-quality directories. Paid links need `rel="sponsored"` or `nofollow`. |
| Machine-generated traffic | Automated queries and rank-checking scrapers. |
| Malicious practices | Malware, unwanted software, **back-button hijacking** (added 2026-04-13). |
| Misleading functionality | Fake tools that lead to ads instead of the promised service. |
| **Scaled content abuse** | Many pages made mainly to manipulate ranking, "no matter how created": AI or programmatic pages without added value, scraped or synonymized or **translated** feeds, stitched content. |
| Scraping | Republishing others' content without original value. |
| Site reputation abuse | Third-party content placed on a host to use the host's ranking signals. Inside the EEA such sections are ranked separately (Aug 2026); elsewhere a manual action is possible. |
| Sneaky redirects | Deceptive redirects, for example sending mobile users to spam. |
| Thin affiliation | Copied merchant content with no added value. |
| User-generated spam | Spam accounts, posts or comments on your platform. |

Other causes of demotion: many valid DMCA or legal removals, scams and impersonation, and circumventing policies (moving spam to new subdomains or sites).

---

## 2. SEO fundamentals

### SEO Starter Guide: things Google says not to focus on
- The meta keywords tag (not used).
- Keywords in the domain or URL (almost no effect).
- The TLD (only a weak geotargeting signal).
- Word count: **there is no minimum or maximum**.
- Subdomains vs. subfolders: choose what fits the business.
- A "duplicate content penalty" for your own duplicates: there isn't one.
- **Heading order or number:** no effect on ranking (it still matters for accessibility).
- **E-E-A-T as a ranking factor:** it isn't one.

### What the Starter Guide does recommend
- Descriptive URLs, grouped by topic in folders.
- Consolidate duplicates with a redirect or `rel=canonical`.
- Good anchor text.
- Images near related text, with descriptive alt text.
- Expect changes to take effect anywhere from hours to months.

### Helpful, people-first content (updated 2026-10-05)
- **Self-check:**
  - Is the information or analysis original?
  - Is the topic covered completely?
  - Does it add real value when drawing on others?
  - Is the title honest?
  - Is the page worth bookmarking?
  - Is the sourcing clear?
  - Is there author or About information?
  - Is there first-hand experience?
  - Is the reader satisfied?
- **Warning signs:**
  - Content made mainly for search traffic.
  - Heavy automation.
  - Summarising others without adding anything.
  - Chasing trends outside your niche.
  - Writing to a word count.
  - **Changing dates to look fresh without real change.**
  - Mass adding or removing content to look "fresh".
- **E-E-A-T:** trust matters most. YMYL topics (health, money, safety, law) need especially strong accuracy.
- **Fabricated authors** (AI headshots, invented names or credentials) are deception.
- Disclose AI or automation where readers would reasonably want to know.

### Generative AI content (2026-10-01)
- AI use is allowed. Many pages without added value count as scaled content abuse.
- **Fact-check AI output**, including titles, meta descriptions, alt text and structured data.

### AI Overviews and AI Mode
- There are **no extra requirements**: the page must be indexed and eligible for a snippet.
- Search Console has a site-wide **"Search generative AI control"**.
- `nosnippet` and `max-snippet` also limit use as an AI input.
- **Google ignores llms.txt and other "AI files"** (neither helps nor harms). There is no special AI schema, and "chunking for AI" isn't needed.
- Making a page for every query variation counts as scaled content abuse.

---

## 3. Crawling and indexing

### robots.txt
- It sits at the host root, applies per protocol, host and port, and must be UTF-8. **Size limit: 500 KiB.**
- Supported fields are only `user-agent`, `allow`, `disallow` and `sitemap`. **`crawl-delay` is not supported.**
- The most specific (longest) rule wins. On a tie, the **least restrictive** wins.
- Error handling:
  - 4xx (except 429): treated as no robots.txt, so everything may be crawled.
  - 5xx: crawling stops for 12 hours, then the last good copy is used for up to 30 days.
- The file is cached for up to 24 hours. It is not an indexing control. Don't block CSS or JS that Google needs for rendering.

### Sitemaps
- **50,000 URLs or 50 MB (uncompressed) per file.** Use a sitemap index above that (up to 50,000 sitemaps). Up to 500 index files per site in Search Console.
- UTF-8, absolute canonical URLs only. URL order doesn't matter.
- **`<priority>` and `<changefreq>` are ignored.**
- **`<lastmod>` is used only if it is consistently and verifiably accurate.** It should reflect real changes (main content, structured data, links), not a footer date.
- Submit through Search Console, the API, or a `Sitemap:` line in robots.txt. A sitemap is a hint, not a guarantee.
- Image sitemaps: up to 1,000 images per URL. **`caption`, `geo_location`, `title` and `license` are deprecated.**
- News sitemaps: only articles from the last 2 days; at most 1,000 per sitemap.

### Canonicalization
- A canonical is a **hint**. Google also weighs redirects, HTTPS, sitemap inclusion and hreflang.
- Put `rel=canonical` in a valid `<head>`, with an absolute URL and a self-reference. Use either HTML or the HTTP header, not both.
- Don't canonicalize with robots.txt, `noindex` or the removal tool, and don't point canonicals at fragment URLs.
- Link internally to the canonical URL.
- With JavaScript, keep the canonical in the source HTML and don't change it with JS (Dec 2025).

### URLs, parameters and faceted navigation
- Use `key=value`, `&` between parameters, and hyphens. URLs are case-sensitive. Use the audience's language. Use cookies rather than session IDs.
- For facets that shouldn't be indexed, use robots.txt or fragments.
- If facets should be indexed: keep a consistent order, avoid duplicate filters, and **return 404 for empty combinations**.

### noindex and robots meta / X-Robots-Tag
- Supported values:
  - `noindex`, `nofollow`, `none`, `nosnippet`;
  - `indexifembedded`, `max-snippet:N`, `max-image-preview:none|standard|large`, `max-video-preview:N`;
  - `notranslate`, `noimageindex`, `unavailable_after`.
- `noarchive` is historical (the cache was removed in 2024).
- When rules conflict, **the more restrictive one applies**.
- Use X-Robots-Tag for non-HTML files. `data-nosnippet` excludes sections from snippets.
- `noindex` only works if the page can be crawled. If `noindex` is in the original HTML, removing it with JS may not work.

### Redirects
- Permanent: **301/308**, meta refresh 0, or JS as a last resort. Temporary: 302/303/307.
- Google follows up to 10 hops; avoid chains.
- In a site move, keep redirects **for at least 1 year**.

### HTTP status codes
- A 2xx error page is a **soft 404** (bad).
- 404/410 for removed content. 4xx URLs are dropped from the index.
- 429 and 5xx slow crawling, and URLs are dropped if the errors persist.
- Non-200 pages may not be rendered.

### JavaScript
- Pages are rendered in headless Chromium. Use real `<a href>` links and the History API, not `#/` routes.
- Use meaningful status codes. Server-side rendering is still recommended.
- **Googlebot reads the first 2 MB of HTML** (64 MB for PDFs).

### Crawl budget
- Matters mainly for very large or fast-changing sites (1M+ pages changing weekly, 10k+ daily), or many "Discovered – not indexed".
- Consolidate duplicates. Block unimportant URLs with robots.txt (`noindex` still costs crawls).
- Return 404/410 for removed pages and fix soft 404s.
- Keep sitemaps current, serve pages fast, and support `304 Not Modified`.

### hreflang
- Use one method: HTML link tags, HTTP headers, or a sitemap.
- **Every version lists itself and all others; links without a return link are ignored.**
- Use ISO 639-1 language codes with optional ISO 3166-1 region codes, plus `x-default`.
- Google detects language from **visible text**: use one language per page and separate URLs per language.
- **Don't auto-redirect by IP or browser language.**

### Mobile-first
- Google indexes the mobile version.
- Mobile and desktop need the same content, headings, robots meta, structured data, titles and alt text.
- Don't lazy-load primary content on user interaction.

### Page experience
- **Core Web Vitals: LCP ≤ 2.5 s, INP < 200 ms, CLS < 0.1.** INP replaced FID in March 2024.
- CWV feed into ranking. There is no single "page experience score".
- Also: HTTPS, no intrusive interstitials, and main content easy to tell apart from ads.

### Indexing timing and report meanings
- New sites take **a few weeks**. Recrawls take days to weeks.
- Use URL Inspection → Request indexing for a few URLs (there is a quota). Use sitemaps for many.
- **Crawled – currently not indexed:** may be indexed later; there's no need to resubmit.
- **Discovered – currently not indexed:** found but not yet crawled (usually rescheduled).
- **Duplicate, Google chose different canonical:** Google picked another URL.
- **Indexed, though blocked by robots.txt:** to keep the page out, unblock it and use `noindex`.

---

## 4. Ranking and search appearance

### Title links
- Every page needs a unique, descriptive, concise title.
- **Google sets no length limit** (titles are truncated to fit the screen).
- Avoid stuffing and boilerplate. Make the main heading prominent. Match the page's language and script; otherwise Google may rewrite the title.

### Snippets and meta description
- **No length limit.** Write a unique description per page. Programmatic descriptions are fine if varied and readable.
- "Read more" deep links need content that is visible immediately, not hidden in tabs (Apr 2026).

### Favicon
- On the home page: `<link rel="icon">`. One per host; subfolders are not supported.
- **Square, at least 8×8 px; more than 48×48 recommended.**
- Supported formats: ICO, PNG, GIF, JPEG, BMP, PPM, TIFF. SVG isn't listed, so keep a PNG or ICO.

### Site name
- `WebSite` structured data **only on the home page**, with `name`, `url` and optional `alternateName`.
- One site name per domain or subdomain; subfolders are not supported. Keep it consistent with `og:site_name` and the title.

### Images
- Use `<img>` or `<picture>`; CSS background images aren't indexed.
- Descriptive file names and alt text. Consistent URLs.
- **Preferred image (Mar 2026):** `primaryImageOfPage`, `image`, or `og:image`. Avoid logos and text-heavy images.
- **Image licence metadata:**
  - Required: `contentUrl` plus **one of** `creator`, `creditText`, `copyrightNotice`, `license`.
  - Recommended: `acquireLicensePage` and all the others.
  - `license` is needed for the Licensable badge.

### Structured data: general
- JSON-LD is recommended. Mark up only **visible, relevant, original, current** content. Include all required properties.
- Use the most specific type and link entities with `@id`.
- Violations bring a **manual action that removes rich results** (ranking is not affected). Valid markup doesn't guarantee a rich result.

### Features: current status (Oct 2026)
| Feature | Status and key rules |
|---|---|
| Breadcrumb | Active, **desktop only (since Jan 2025)**. BreadcrumbList with at least 2 items, each with `name`, `position` and `item` (`item` optional on the last). |
| Dataset | Active, but **only in Dataset Search since Nov 2025**. Requires `name` and **`description` of 50–5000 characters**. Recommended: license, creator, temporalCoverage, spatialCoverage, variableMeasured, distribution… |
| **FAQPage** | **Not shown in Google Search since 2026-05-07; the docs were removed.** |
| HowTo | Removed (2023). |
| Sitelinks search box | Removed (2024). |
| Organization | No required properties. Logo at least **112×112**. Home or About page. |
| LocalBusiness | Requires `name` and `address`. Telephone with country code, `geo` with at least 5 decimal places, `priceRange` under 100 characters. Reviews only for *other* businesses. |
| Event | Requires `name`, `startDate`, `location`. **Physical, publicly bookable events only** (June 2025). |
| Article | Recommended: author (name, url), datePublished/dateModified (ISO 8601 with time zone), headline, images at least 50k pixels (16:9, 4:3, 1:1). |
| QAPage | Only where **users submit answers**; never for site-written FAQs. |
| Speakable | Beta: US English on Google Home only. |
| Removed in 2025–2026 | Course info, estimated salary, learning video, special announcement, vehicle listing (2025); practice problem (Jan 2026); ClaimReview being phased out. |

### Dates and bylines
- Show a visible "Published" or "Updated" date that matches `datePublished`/`dateModified`.
- No future dates.

### Discover
- No markup needed. Images **at least 1200 px wide** with `max-image-preview:large`. No clickbait.

### News and Top stories
- Selection is automatic and **no markup is required**.
- AMP has no ranking boost; the AMP cache is no longer needed (Jul 2026).

### Video
- A watch page where the video is visible. VideoObject requires `name`, `thumbnailUrl` and `uploadDate`.

### Ranking systems
- Google uses page-level and site-wide signals.
- Usually at most 2 results per site.
- The helpful content system has been part of core ranking since March 2024.
- Core updates run several times a year. Improvements can count without waiting for the next one.

---

## 5. Monitoring and debugging
- **Traffic drops:** algorithm update, technical issue, security issue, manual action, seasonality, site move, or a reporting glitch.
- **After a core update:** wait a full week after it completes, then compare against the week before it started.
- **Reports to use:**
  - Performance (Search, Discover, News, Generative AI);
  - Page indexing and Crawl stats;
  - Sitemaps and URL Inspection;
  - Manual actions and Security;
  - Core Web Vitals and HTTPS;
  - Rich result reports.
- **Check each report's "Last update" date:** data lags by several days.

## 6. Site-specific notes
- **Multilingual sites:** follow the hreflang rules above. Mass machine translation without added value counts as scaled content abuse.
- **Local business:** keep Google Business Profile accurate, with name, address and phone identical to the website. Add LocalBusiness markup.
- **News sites:** news sitemaps (2-day window), optional Article markup. Top stories are automatic.
