#!/bin/bash
set -e

echo "=== Building Nuxt ==="
npx nuxi build

echo "=== Stripping Vue JS from homepage ==="
python3 << 'PYEOF'
import re

html = open('.vercel/output/static/index.html').read()

# Remove ALL Nuxt/Vue module preloads, scripts, and payload links
html = re.sub(r'<link[^>]*_nuxt[^>]*>', '', html)
html = re.sub(r'<link[^>]*_payload[^>]*>', '', html)
html = re.sub(r'<script[^>]*_nuxt[^>]*>[^<]*</script>', '', html)
html = re.sub(r'<script>window\.__NUXT__[^<]*</script>', '', html)
html = re.sub(r'<div id="teleports"></div>', '', html)
html = re.sub(r' data-ssr="true"', '', html)

# Add hero carousel dots
dots_html = '<div class="hero-dots" id="hero-dots"></div>'
html = html.replace('</section>', f'{dots_html}\n</section>', 1)

# Add vanilla JS carousel
carousel_js = '''<script>
(function(){
  var slides = document.querySelectorAll('.hero-bg-slide');
  var dotsEl = document.getElementById('hero-dots');
  if (!slides.length || !dotsEl) return;
  slides.forEach(function(_, i) {
    var dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.onclick = function() { goTo(i); };
    dotsEl.appendChild(dot);
  });
  var current = 0;
  var dots = dotsEl.querySelectorAll('.hero-dot');
  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = i;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  setInterval(function() { goTo((current + 1) % slides.length); }, 4000);
})();
</script>'''
html = html.replace('</body>', f'{carousel_js}\n</body>')

with open('.vercel/output/static/index.html', 'w') as f:
    f.write(html)

assert len(re.findall(r'_nuxt/[a-zA-Z0-9]', html)) == 0, 'Nuxt JS still present!'
assert '<img' in html, 'No images!'
assert 'hero-dots' in html, 'No carousel dots!'
print(f'OK: {len(html)}B, {html.count("<img")} images, 0 Nuxt JS, carousel ready')
PYEOF

echo "=== Done ==="
