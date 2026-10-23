#!/usr/bin/env node
// Audits a site against Google Search Central rules (see SKILL.md / reference/google-search-rules.md).
// No dependencies; Node 18+ (built-in fetch).
//
//   node seo-audit.mjs https://example.com                 # home page + up to 20 URLs sampled from the sitemap(s)
//   node seo-audit.mjs http://localhost:3000 / /about      # specific paths
//   node seo-audit.mjs https://example.com --sample 50     # sample more sitemap URLs
//
// ERR  = breaks a Google rule (exit code 1)
// warn = a convention or recommendation (title 60 / meta 160, missing breadcrumb, slow page, ...)

const args = process.argv.slice(2)
if (!args[0] || args[0] === '-h' || args[0] === '--help') {
  console.log('Usage: node seo-audit.mjs <base-url> [path ...] [--sample N]')
  process.exit(args[0] ? 0 : 2)
}
const BASE = args[0].replace(/\/$/, '')
const sampleIdx = args.indexOf('--sample')
const SAMPLE = sampleIdx > -1 ? Number(args[sampleIdx + 1]) || 20 : 20
const explicit = args.slice(1).filter((a, i, arr) => a !== '--sample' && arr[i - 1] !== '--sample')
const UA = 'Mozilla/5.0 (compatible; seo-audit/1.0; +https://github.com/Monjil404/google-seo-rules)'

const errs = []
const warns = []
const faqPages = []
const get = (url, opts = {}) => fetch(url, { redirect: 'manual', headers: { 'user-agent': UA }, ...opts })
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'))

// ── robots.txt and sitemaps ──
let sitemaps = []
try {
  const r = await get(BASE + '/robots.txt')
  const txt = r.status === 200 ? await r.text() : ''
  if (r.status !== 200) warns.push(`/robots.txt: status ${r.status}`)
  if (new TextEncoder().encode(txt).length > 500 * 1024) errs.push('/robots.txt: larger than 500 KiB (rest is ignored)')
  if (/^\s*crawl-delay\s*:/im.test(txt)) warns.push('/robots.txt: crawl-delay is not supported by Google')
  if (/^\s*disallow\s*:\s*\/\s*$/im.test(txt) && /user-agent\s*:\s*(\*|googlebot)\s*$/im.test(txt)) warns.push('/robots.txt: "Disallow: /" present — check it does not block Googlebot')
  sitemaps = [...txt.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)].map((m) => m[1])
} catch (e) {
  errs.push(`/robots.txt: ${e.message}`)
}
if (!sitemaps.length) sitemaps = [BASE + '/sitemap.xml']

const pageUrls = []
for (const sm of sitemaps) {
  try {
    const r = await get(sm)
    if (r.status !== 200) {
      errs.push(`${sm}: status ${r.status}`)
      continue
    }
    const x = await r.text()
    const list = locs(x)
    const isIndex = /<sitemapindex[\s>]/.test(x)
    if (!isIndex && list.length > 50000) errs.push(`${sm}: ${list.length} URLs (max 50,000 per sitemap)`)
    if (new TextEncoder().encode(x).length > 50 * 1024 * 1024) errs.push(`${sm}: larger than 50 MB uncompressed`)
    if (/<priority>|<changefreq>/.test(x)) warns.push(`${sm}: <priority>/<changefreq> are ignored by Google`)
    if (/<image:(title|caption|license|geo_location)>/.test(x)) warns.push(`${sm}: deprecated image sitemap tags (title/caption/license/geo_location)`)
    if (list.some((u) => !/^https?:\/\//.test(u))) errs.push(`${sm}: relative URLs (must be absolute)`)
    const mods = [...x.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1].slice(0, 10))
    const top = Object.entries(mods.reduce((a, d) => ((a[d] = (a[d] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1])[0]
    if (!isIndex && top && list.length > 200 && top[1] / list.length > 0.9) errs.push(`${sm}: ${top[1]}/${list.length} URLs share lastmod ${top[0]} — lastmod must reflect real changes`)
    console.log(`sitemap ${sm}: ${isIndex ? 'index of ' : ''}${list.length} ${isIndex ? 'sitemaps' : 'URLs'}, ${mods.length} with lastmod`)
    if (isIndex && list[0]) {
      const child = await get(list[0])
      if (child.status === 200) pageUrls.push(...locs(await child.text()))
    } else pageUrls.push(...list)
  } catch (e) {
    errs.push(`${sm}: ${e.message}`)
  }
}

// ── pages to check ──
const pick = (arr, n) => (arr.length <= n ? arr : Array.from({ length: n }, (_, i) => arr[Math.floor((i * arr.length) / n)]))
const sameHost = (u) => {
  try {
    return new URL(u).host === new URL(BASE).host
  } catch {
    return false
  }
}
const targets = explicit.length ? explicit.map((p) => (p.startsWith('http') ? p : BASE + (p.startsWith('/') ? p : '/' + p))) : [BASE + '/', ...pick(pageUrls.filter(sameHost), SAMPLE)]

for (const url of [...new Set(targets)]) {
  const path = url.replace(BASE, '') || '/'
  const err = (m) => errs.push(`${path}: ${m}`)
  const warn = (m) => warns.push(`${path}: ${m}`)
  let res, h, ms
  try {
    const t0 = Date.now()
    res = await get(url)
    ms = Date.now() - t0
    h = await res.text()
  } catch (e) {
    err(e.message)
    continue
  }
  if (res.status !== 200) {
    err(`status ${res.status}${res.headers.get('location') ? ' → ' + res.headers.get('location') : ''}`)
    continue
  }
  const isHome = new URL(url).pathname === '/'
  const robotsMeta = (h.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)/i) || [])[1] || ''
  const noindex = /noindex/i.test(robotsMeta) || /noindex/i.test(res.headers.get('x-robots-tag') || '')
  const title = strip((h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '')
  const desc = strip((h.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)/i) || [])[1] || '')
  if (!title) err('no <title>')
  else if ([...title].length > 60) warn(`title ${[...title].length} chars (convention only — Google has no limit)`)
  if (!desc) warn('no meta description')
  else if ([...desc].length > 160) warn(`meta description ${[...desc].length} chars (convention only)`)
  const canon = (h.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)/i) || [])[1]
  if (!noindex) {
    if (!canon) warn('no rel=canonical')
    else if (!/^https?:\/\//.test(canon)) err(`canonical is not absolute: ${canon}`)
    else if (canon.includes('#')) err('canonical points to a fragment URL')
  }
  if ((h.match(/<link[^>]+rel=["']canonical["']/gi) || []).length > 1) err('more than one rel=canonical')
  const h1 = (h.match(/<h1[\s>]/gi) || []).length
  if (h1 !== 1) warn(`${h1} <h1> elements`)
  const noAlt = (h.match(/<img\b[^>]*>/gi) || []).filter((i) => !/\balt\s*=/i.test(i)).length
  if (noAlt) err(`${noAlt} <img> without alt`)
  if (!/<meta[^>]+name=["']viewport["']/i.test(h)) err('no viewport meta (mobile)')
  if (!/<html[^>]+lang=/i.test(h)) warn('no <html lang>')
  if (new TextEncoder().encode(h).length > 2 * 1024 * 1024) err('HTML over 2 MB (Googlebot reads only the first 2 MB)')
  if (ms > 1500) warn(`slow response ${ms} ms`)

  // hreflang: self-reference and absolute URLs (return links need the other page, checked when it is audited too)
  const alts = [...h.matchAll(/<link[^>]+rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)/gi)].map((m) => ({ lang: m[1], href: m[2] }))
  if (alts.length) {
    if (canon && !alts.some((a) => a.href === canon)) err('hreflang set does not include the page itself')
    if (alts.some((a) => !/^https?:\/\//.test(a.href))) err('hreflang URLs must be absolute')
  }

  // structured data
  const ld = []
  for (const m of h.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const j = JSON.parse(m[1])
      ld.push(...(Array.isArray(j) ? j : j['@graph'] ? j['@graph'] : [j]))
    } catch {
      err('invalid JSON-LD')
    }
  }
  const types = ld.flatMap((j) => [j['@type']].flat())
  if (types.includes('WebSite') && !isHome) err('WebSite structured data outside the home page (site name belongs on the home page only)')
  if (isHome && !types.includes('WebSite')) warn('home page has no WebSite structured data (site name)')
  for (const j of ld) {
    const t = [j['@type']].flat()
    if (t.includes('Dataset')) {
      const d = String(j.description || '')
      if (!j.name) err('Dataset without name')
      if (d.length < 50 || d.length > 5000) err(`Dataset description is ${d.length} chars (required 50–5000)`)
    }
    if (t.includes('ImageObject') && (j.license || j.acquireLicensePage) && !(j.contentUrl || j.url)) err('ImageObject licence metadata without contentUrl')
    if (t.includes('ImageObject') && j.license && !(j.creator && j.copyrightNotice && j.creditText)) warn('ImageObject: add creator, creditText and copyrightNotice (recommended)')
    if (t.includes('BreadcrumbList') && (j.itemListElement || []).length < 2) err('BreadcrumbList needs at least 2 items')
    if (t.includes('Event') && !(j.startDate && j.location)) err('Event needs startDate and location (physical events only)')
    if (t.includes('LocalBusiness') && !(j.name && j.address)) err('LocalBusiness needs name and address')
    if (t.includes('FAQPage')) faqPages.push(path)
    if (t.includes('HowTo')) warn('HowTo rich results were removed by Google')
    if (j.potentialAction && [j.potentialAction].flat().some((a) => a['@type'] === 'SearchAction')) warn('SearchAction (sitelinks search box) was removed by Google')
    if (j.dateModified && Date.parse(j.dateModified) > Date.now() + 86400000) err('dateModified is in the future')
  }
  if (!noindex && !isHome && !types.includes('BreadcrumbList')) warn('no BreadcrumbList')
  if (isHome && !/rel=["'](icon|shortcut icon|apple-touch-icon)["'][^>]*\.(png|ico)/i.test(h) && !/href=["'][^"']+\.(png|ico)["'][^>]*rel=["'](icon|shortcut icon|apple-touch-icon)/i.test(h)) warn('no PNG/ICO favicon (Google does not list SVG; use >48px square)')
  console.log(`${noindex ? '[noindex] ' : ''}${path} | ${title.slice(0, 70)} | ${types.join(', ') || '—'} | ${ms} ms`)
}

if (faqPages.length) warns.push(`FAQPage markup on ${faqPages.length} page(s): no Google rich result since 2026-05-07 (harmless; the visible FAQ is still useful for readers and other AI engines)`)

// ── soft 404 ──
try {
  const r = await get(`${BASE}/this-page-should-not-exist-${Date.now()}`)
  if (r.status === 200) errs.push(`unknown URL returns 200 (soft 404) — it should return 404`)
} catch {}
// ── HTTPS redirect ──
if (BASE.startsWith('https://')) {
  try {
    const r = await get(BASE.replace('https://', 'http://') + '/')
    if (![301, 308].includes(r.status)) warns.push(`http:// returns ${r.status} — use a 301/308 to https`)
  } catch {}
}

console.log(`\nERRORS ${errs.length}`)
for (const e of errs) console.log('  ✗', e)
console.log(`warnings ${warns.length}`)
for (const w of warns) console.log('  ·', w)
process.exit(errs.length ? 1 : 0)
