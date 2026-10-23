---
name: google-seo-rules
description: SEO rules taken straight from Google Search Central (read in full in October 2026) and checked against a common 2026 SEO checklist covering on-page, off-page, technical, AI SEO / AEO / LLMO, local SEO and tools, plus a site audit script. Use before building or changing web pages, and for any SEO, structured data / schema, sitemap, robots.txt, title/meta, canonical, hreflang, indexing, Core Web Vitals, Search Console, Bing or AI-search (AI Overviews, ChatGPT, Perplexity) work.
license: MIT
---

# Google SEO rules

These rules come from **Google's own documentation** (developers.google.com/search/docs and developers.google.com/crawling/docs), read in full in October 2026. Follow them, not SEO folklore.

- The detailed rules, with every number, limit and deprecation date, are in [reference/google-search-rules.md](reference/google-search-rules.md). Read the matching section there before deciding anything non-trivial.
- Google changes these often. When a rule decides the outcome, check https://developers.google.com/search/updates for anything newer than October 2026.

This is an independent summary, not affiliated with Google.

## Workflow (every time)

1. **Know what the site has.** Find how pages render titles, meta, canonicals and JSON-LD, and where the sitemaps and robots.txt come from.
2. **Read the matching rules** below and in the reference.
3. **Run the audit** against a local dev server or the live site:
   ```bash
   node "${CLAUDE_SKILL_DIR}/seo-audit.mjs" https://example.com
   node "${CLAUDE_SKILL_DIR}/seo-audit.mjs" http://localhost:3000 / /about /blog/some-post
   ```
   With no paths it checks the home page plus a sample of URLs from the sitemap. ERR means Google's rule is broken. warn means a convention or a recommendation. The exit code is 1 when there are errors.
4. **Fix, add a regression test if the project has tests, and run the audit again.**
5. **Search Console reports:** check the report's **"Last update"** date first. If it is older than your fix, nothing needs to change in code: press "Validate fix".

## Not Google rules (stop repeating these)

| Belief | What Google actually says |
|---|---|
| Title ≤60 / meta ≤160 characters | **There is no length limit**; Google truncates. Keeping 60/160 is fine as a house convention, but don't call it a Google rule. |
| FAQPage schema gives rich results | **Gone from Google Search since 2026-05-07.** Keep a visible FAQ because it helps readers and other AI engines, but expect nothing from Google. |
| HowTo, sitelinks search box (SearchAction) | Removed (2023, 2024). Don't add them. |
| `<priority>` / `<changefreq>` in sitemaps | Ignored. |
| llms.txt, "AI files", special AI schema | Google ignores them (neither helps nor harms). Other AI engines may read llms.txt. |
| Word count, keywords in the URL or domain, heading order, E-E-A-T as a ranking factor | No effect, or not a direct factor. |
| `image:title`, `caption`, `license` in image sitemaps | Deprecated. Use only `<image:loc>`. |
| FID | Retired in March 2024. The metric is **INP**. |

## Must follow

### Spam (the biggest risk for programmatic and AI-assisted sites)
- **Scaled content abuse:** many pages made to rank without added value, "no matter how created". Every programmatic page (cities, pairs, codes, comparisons) must carry real data specific to that page, or be noindexed or not built.
- **Doorway abuse:** many near-identical location pages that funnel to one place.
- **Fake freshness:** changing dates without a real change is a warning sign.
- **Fabricated authors or credentials** count as deception. Don't invent data either.
- **Paid links** must use `rel="sponsored"` or `nofollow`. Never buy links that pass ranking, and avoid link exchanges.
- Also spam: back-button hijacking (since 2026-04-13), manipulating AI answers (since May 2026), cloaking, hidden text, keyword stuffing, scraping, sneaky redirects.

### Indexing
- An indexable page returns **200**, is not blocked, and has no `noindex`.
- Add a self-referencing `<link rel="canonical">` in `<head>` with an absolute https URL. A canonical is only a hint.
- Return **404/410** for removed pages and empty filter combinations. An error page served with 200 is a **soft 404**.
- `noindex` only works on crawlable pages and still costs crawl. Use robots.txt for crawl-waste URLs. robots.txt is **not** an indexing control.
- Use 301/308 for permanent moves. Keep them at least a year after a site move, and avoid chains.
- Googlebot reads the first **2 MB** of HTML. Mobile and desktop must match (content, robots meta, structured data).
- New sites take **a few weeks**. "Crawled – currently not indexed" needs no resubmission. Use Request indexing only for a handful of key URLs.

### Sitemaps
- At most 50,000 URLs or 50 MB per file; use a sitemap index above that. Absolute canonical URLs only.
- **`<lastmod>` only if consistently accurate:**
  - daily-changing pages: the real change date;
  - data pages: the date the data was fetched;
  - static pages: leave it out.
  - Never stamp today's date on everything.
- Apply the same rule to `dateModified` in structured data.

### hreflang (multilingual)
- Annotations must be **reciprocal and self-referencing**; one-way links are ignored.
- Use ISO 639-1 codes (optionally with an ISO 3166-1 region) plus `x-default`.
- Keep one visible language per page and separate URLs per language. Never auto-redirect by IP or browser language.

### Site name, Organization, favicon
- `WebSite` structured data goes **only on the home page**: `name`, `url`, optional `alternateName`, with an `@id` such as `/#website`. One site name per domain, so no second WebSite on `/en` or other subfolders.
- Organization: a stable `@id` (`/#organization`), the same name in every language, and a logo of at least **112×112**.
- Favicon: square and **larger than 48×48**, in PNG or ICO. Google doesn't list SVG as a favicon format.

### Structured data
- Mark up only what is **visible, true and current**, and include all required properties. Violations can bring a manual action that removes rich results.
- **Dataset:** `name` plus `description` of **50–5000 characters**. Since Nov 2025 it is used by Dataset Search only.
- **Image licence:** `contentUrl` plus at least one of `creator`, `creditText`, `copyrightNotice`, `license`. `license` is needed for the Licensable badge; also add `acquireLicensePage`.
- **Breadcrumb:** at least 2 items, each with `name`, `position` and `item` (`item` optional on the last). Shown on desktop only.
- **Event:** only physical events the public can book.
- **QAPage:** only where users submit answers.
- **Article:** author (name, url) and ISO dates with a time zone. The date must also be visible on the page. Images at least 50k pixels in 16:9, 4:3 and 1:1.
- **LocalBusiness:** `name` and `address`, telephone with the country code, `geo` with 5 or more decimal places. Reviews only of *other* businesses.

### Content (helpful, people-first)
- Original information or analysis, with **clear sources**. About and contact pages, plus a corrections policy, for trust.
- YMYL topics (health, money, law, safety) need extra accuracy and clear "reference, not advice" notes.
- **Fact-check AI-written text**, including titles, meta descriptions, alt text and structured data. AI content is fine only with real added value.

### Experience
- **LCP ≤ 2.5 s, INP < 200 ms, CLS < 0.1.**
- HTTPS, responsive design, no intrusive interstitials.
- For Discover: images at least 1200 px wide plus `max-image-preview:large`.

## A common 2026 SEO checklist, checked against Google

Legend: ✓ = do it · ⚠ = do it, with Google's correction · 🧑 = not code; advise the site owner

**On-page**
| Item | Status | Note |
|---|---|---|
| Keyword research | ⚠ | Start with **free** data: Search Console queries, Google autocomplete, Trends, "People also ask". Paid tools (Ahrefs, SEMrush, Ubersuggest) are optional. Put user intent ahead of keyword lists. |
| Title / meta length | ⚠ | Keep 60/160 as a convention. Make each unique, descriptive and in the page's language; brand once. |
| One H1, then H2/H3 | ✓ | Good for readers and accessibility. The order itself doesn't affect ranking. |
| E-E-A-T | ⚠ | Show sources, dates, About and contact. Trust matters most. E-E-A-T isn't itself a ranking factor. No fake authors. |
| Internal links | ✓ | Descriptive anchors to canonical URLs; no orphan pages. |
| Image alt text | ✓ | Descriptive and not stuffed, on real `<img>` elements, with descriptive file names. |
| Short readable URLs | ✓ | Hyphens, lowercase, ASCII slugs (é→e). Use a 301 whenever a URL changes. |

**Off-page (🧑)**
| Item | Guidance |
|---|---|
| Backlinks | Earn natural links from relevant local and industry sites. Never buy links that pass ranking; paid links must be `sponsored`. |
| Guest posting | Only genuinely useful articles. Links in them should be `nofollow` or `sponsored`. Mass guest posting for links is spam. |
| Social signals | Good for traffic and brand mentions, but not a direct ranking signal. |
| Google Business Profile | Feeds local results and AI answers. Keep the name, address and phone **identical** to the website. |
| Wikipedia / Reddit / Quora / PR | Get mentioned only through genuine contributions. Adding your own links to Wikipedia breaks its rules. |

**Technical**
| Item | Status | Note |
|---|---|---|
| Mobile-friendly | ✓ | Mobile and desktop must have the same content, robots meta and structured data. |
| Core Web Vitals | ⚠ | Use INP, not FID. Check with PageSpeed Insights or the Search Console CWV report. |
| Schema | ⚠ | Use only the types Google still supports (see above), and only for visible content. |
| Sitemap + robots.txt | ⚠ | Accurate lastmod. robots.txt only controls crawling. |
| HTTPS | ✓ | Redirect HTTP→HTTPS and www↔root with a 301. |

**AI SEO (AEO / LLMO)**
| Item | Status | Note |
|---|---|---|
| Direct answer first | ✓ | Put a clear answer paragraph at the top. AI Overviews draw on page text. Don't use `nosnippet` or `max-snippet` unless you mean to limit AI use. |
| FAQ schema | ⚠ | Keep the visible FAQ for readers, ChatGPT, Perplexity and Bing. There is no Google rich result. |
| Question-style subheadings | ✓ | "What is…", "How to…" where natural. |
| Lists and tables | ✓ | Structured, scannable answers. |
| Comprehensive coverage | ⚠ | Cover the topic fully on one page. Don't create a page per query variation (scaled content abuse). |
| Entity SEO | ✓ | Organization, Place or Person with `@id`, identifiers and `sameAs` (e.g. Wikidata). |
| Conversational / long-tail | ✓ | Natural language that answers real questions. |
| Brand mentions | 🧑 | Genuine mentions only. Manipulating AI answers is spam. |
| Cited sources and fresh content | ⚠ | Cite every source. Update dates only on real change. |
| llms.txt | ⚠ | Google ignores it; other AI engines may read it. |
| AI crawlers | ✓ | Decide policy in robots.txt (GPTBot, OAI-SearchBot, PerplexityBot…). Search Console has a "Search generative AI control". |
| Speakable | ⚠ | Beta: US English on Google Home only. |
| Bing / Copilot | ✓ | IndexNow for instant URL submission. Bing Webmaster Tools has an AI Performance report. |

**Tools (free first)**
| Job | Tools |
|---|---|
| Keywords | Search Console queries, Google Trends, autocomplete, Google Ads Keyword Planner (free with an account). Ahrefs, SEMrush and Ubersuggest are paid. |
| Technical audit | `seo-audit.mjs` (this skill), Search Console, Bing Webmaster Tools, Screaming Frog (free up to 500 URLs). |
| Schema | Rich Results Test, validator.schema.org |
| Speed | PageSpeed Insights, Search Console Core Web Vitals |

**2026 best practices**
- User intent first, and quality over quantity.
- Video gets a dedicated watch page with VideoObject.
- Local SEO through an accurate Google Business Profile with identical NAP (name, address, phone).
- Voice and "near me" rely on accurate location data, with no special markup.
- Human-edit and fact-check AI text before publishing.

## Reading Search Console reports
| Report | Meaning | Action |
|---|---|---|
| Crawled / Discovered – currently not indexed | Google hasn't taken the page yet | Wait (weeks for a new site). Improve internal links, earn links, improve quality. |
| Excluded by 'noindex' | The site's own choice | If deliberate (thin pages, filters), leave it. |
| Duplicate, Google chose different canonical | Google picked another URL | Check internal links and canonicals; consolidate. |
| Rich result issue (Dataset, Image metadata…) | Missing required or recommended field | Fix, deploy, then "Validate fix". |
| Traffic drop after a core update | — | Wait a full week after it completes, then compare. |
