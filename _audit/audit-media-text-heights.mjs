#!/usr/bin/env node
/* Audit: every side-by-side MEDIA + TEXT pair whose column heights disagree.
   Class-agnostic by construction -- it finds any multi-column grid/flex row that
   contains an <img> and compares the direct children's rendered heights, so a
   component nobody remembered is still caught. Renders over file:// like the gates. */
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/aeroncloydc.malinab/Oso/.claude/skills/client-site-build/scripts/node_modules/playwright-core');

const ROOT = '/Users/aeroncloydc.malinab/Oso/Code/client-sites/radiantsmiles/pages';
const VW = 1440, VH = 900;
const TOL = 24;
const MIN_H = 100;

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !f.endsWith('.content.html')).sort();
const b = await chromium.launch({ channel: 'chrome', headless: true });
const findings = [];

for (const f of pages) {
  const p = await b.newPage({ viewport: { width: VW, height: VH } });
  try {
    await p.goto(pathToFileURL(path.join(ROOT, f)).href, { waitUntil: 'load', timeout: 30000 });
    await p.evaluate(() => new Promise(r => {
      const imgs = [...document.images].filter(i => !i.complete);
      if (!imgs.length) return r();
      let n = imgs.length;
      imgs.forEach(i => { i.addEventListener('load', () => --n || r(), { once: true });
                          i.addEventListener('error', () => --n || r(), { once: true }); });
      setTimeout(r, 4000);
    }));
    const rows = await p.evaluate(({ TOL, MIN_H }) => {
      const out = [];
      const seen = new Set();
      document.querySelectorAll('#main *').forEach(el => {
        const cs = getComputedStyle(el);
        const isGrid = cs.display === 'grid' && (cs.gridTemplateColumns || '').split(' ').filter(Boolean).length >= 2;
        const isRow  = cs.display === 'flex' && cs.flexDirection === 'row';
        if (!isGrid && !isRow) return;
        const kids = [...el.children].filter(k => k.getBoundingClientRect().height > 0);
        if (kids.length < 2 || kids.length > 4) return;
        const withImg = kids.filter(k => k.querySelector('img') || k.tagName === 'IMG');
        const withTxt = kids.filter(k => !k.querySelector('img') && k.tagName !== 'IMG'
                                       && (k.innerText || '').trim().length > 40);
        if (!withImg.length || !withTxt.length) return;
        const m = withImg[0].getBoundingClientRect();
        const t = withTxt[0].getBoundingClientRect();
        if (m.height < MIN_H || t.height < MIN_H) return;
        const diff = Math.round(Math.abs(m.height - t.height));
        if (diff <= TOL) return;
        if (Math.min(m.bottom, t.bottom) - Math.max(m.top, t.top) < 40) return;
        const key = (el.className || el.tagName) + ':' + Math.round(m.top);
        if (seen.has(key)) return; seen.add(key);
        out.push({
          cls: (typeof el.className === 'string' ? el.className : el.tagName).split(' ').slice(0,3).join(' '),
          align: cs.alignItems,
          mediaH: Math.round(m.height), textH: Math.round(t.height), diff,
          taller: m.height > t.height ? 'MEDIA' : 'TEXT'
        });
      });
      return out;
    }, { TOL, MIN_H });
    if (rows.length) findings.push({ page: f, rows });
  } catch (e) {
    findings.push({ page: f, error: String(e).slice(0, 90) });
  } finally { await p.close(); }
}
await b.close();

const byComponent = {};
for (const fnd of findings) {
  if (fnd.error) { console.log('  ERR ' + fnd.page + ' ' + fnd.error); continue; }
  for (const r of fnd.rows) {
    const k = r.cls;
    (byComponent[k] ||= { pages: new Set(), worst: 0, sample: null });
    byComponent[k].pages.add(fnd.page);
    if (r.diff > byComponent[k].worst) { byComponent[k].worst = r.diff; byComponent[k].sample = { page: fnd.page, ...r }; }
  }
}
console.log('\n=== MISALIGNED MEDIA/TEXT PAIRS @1440 (tolerance ' + TOL + 'px) ===');
const keys = Object.keys(byComponent).sort((a,b2) => byComponent[b2].pages.size - byComponent[a].pages.size);
if (!keys.length) console.log('  none');
for (const k of keys) {
  const v = byComponent[k];
  console.log('\n  ' + k);
  console.log('    pages: ' + v.pages.size + '   worst gap: ' + v.worst + 'px   align-items: ' + v.sample.align);
  console.log('    e.g. ' + v.sample.page + '  media ' + v.sample.mediaH + ' vs text ' + v.sample.textH + '  (' + v.sample.taller + ' taller)');
}
console.log('\npages scanned: ' + pages.length + '   pages with a finding: ' + findings.filter(f=>f.rows&&f.rows.length).length);
