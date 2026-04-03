/**
 * Blog statique : data/blog-manifest.json + content/blog/posts/*.md
 */
(function () {
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseFrontmatter(raw) {
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!m) return { meta: {}, body: raw.trim() };
    const yaml = m[1];
    const body = m[2].trim();
    const meta = {};
    yaml.split(/\r?\n/).forEach((line) => {
      const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
      if (!kv) return;
      let val = kv[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      meta[kv[1]] = val;
    });
    return { meta, body };
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  async function loadManifest() {
    const res = await fetch("/data/blog-manifest.json");
    if (!res.ok) throw new Error("Manifeste blog introuvable");
    return res.json();
  }

  function initList() {
    const root = document.getElementById("blog-list");
    if (!root) return;

    loadManifest()
      .then((data) => {
        const posts = (data.posts || [])
          .filter((p) => p.published !== false)
          .sort((a, b) => String(b.date).localeCompare(String(a.date)));

        if (!posts.length) {
          root.innerHTML =
            '<p class="text-gray-400 text-center py-16">Aucun article publié pour le moment.</p>';
          return;
        }

        root.innerHTML = posts
          .map(
            (p) => `
        <article class="blog-card holographic rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/40 transition-colors">
          <a href="/blog/article.html?slug=${encodeURIComponent(p.slug)}" class="block group">
            <div class="aspect-[16/9] overflow-hidden bg-gray-900">
              <img src="${p.coverImage || "/assets/images/preview.png"}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" decoding="async" width="640" height="360" />
            </div>
            <div class="p-6">
              <time class="text-xs text-blue-300/90 uppercase tracking-wide">${formatDate(p.date)}</time>
              <h2 class="text-xl font-bold mt-2 tech-font gradient-text group-hover:text-blue-200 transition-colors">${escapeHtml(p.title)}</h2>
              <p class="text-gray-400 mt-3 text-sm leading-relaxed line-clamp-3">${escapeHtml(p.excerpt || "")}</p>
              <span class="inline-flex items-center gap-2 mt-4 text-sm text-blue-400 font-medium">Lire l’article <i class="fas fa-arrow-right text-xs"></i></span>
            </div>
          </a>
        </article>`
          )
          .join("");
      })
      .catch(() => {
        root.innerHTML =
          '<p class="text-red-400 text-center py-16">Impossible de charger la liste des articles.</p>';
      });
  }

  function initArticle() {
    const root = document.getElementById("blog-article-body");
    const coverEl = document.getElementById("blog-article-cover");
    const titleEl = document.getElementById("blog-article-title");
    const dateEl = document.getElementById("blog-article-date");
    const metaDesc = document.getElementById("blog-meta-description");
    const metaTitle = document.getElementById("blog-meta-title");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (!slug) {
      root.innerHTML =
        '<p class="text-gray-400">Paramètre <code class="text-blue-300">slug</code> manquant.</p>';
      return;
    }

    Promise.all([loadManifest(), fetch("/content/blog/posts/" + encodeURIComponent(slug) + ".md")])
      .then(([data, res]) => {
        if (!res.ok) throw new Error("Article introuvable");
        const post = (data.posts || []).find((p) => p.slug === slug);
        if (!post || post.published === false) throw new Error("Non publié");

        return res.text().then((raw) => ({ raw, post }));
      })
      .then(({ raw, post }) => {
        const { meta, body } = parseFrontmatter(raw);
        const title = meta.title || post.title;
        const desc = meta.excerpt || post.excerpt || "";
        if (titleEl) titleEl.textContent = title;
        if (dateEl) dateEl.textContent = formatDate(meta.date || post.date);
        if (metaDesc) metaDesc.setAttribute("content", desc);
        if (metaTitle) metaTitle.setAttribute("content", title + " | Blog — Imdad ADENON");
        document.title = title + " | Blog — Imdad ADENON";

        const cover = meta.coverImage || post.coverImage || "/assets/images/preview.png";
        if (coverEl) {
          coverEl.src = cover;
          coverEl.alt = title;
        }

        if (typeof marked !== "undefined" && marked.parse) {
          root.innerHTML = marked.parse(body, { mangle: false, headerIds: true });
        } else {
          root.innerHTML = "<pre class=\"text-gray-300 whitespace-pre-wrap\">" + escapeHtml(body) + "</pre>";
        }
      })
      .catch(() => {
        root.innerHTML =
          '<p class="text-gray-400 text-center py-12">Article introuvable ou non publié. <a href="/blog/" class="text-blue-400 hover:underline">Retour au blog</a></p>';
        if (titleEl) titleEl.textContent = "Article introuvable";
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initList();
    initArticle();
  });
})();
