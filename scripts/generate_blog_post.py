#!/usr/bin/env python3
"""
Génère un article Markdown + image de couverture (API), met à jour data/blog-manifest.json
et envoie le résumé par e-mail pour validation avant publication manuelle (git).

Usage :
  cd monPortfolio
  python scripts/generate_blog_post.py --title "Mon titre SEO" --keywords "ui ux dashboard saas"

Prérequis : pip install -r scripts/requirements.txt
Variables : copier scripts/.env.example vers scripts/.env
  - GEMINI_API_KEY (recommandé, gratuit) ou GROQ_API_KEY (gratuit) ou OPENAI_API_KEY (payant)
  - UNSPLASH_ACCESS_KEY ou PEXELS_API_KEY : image de couverture
"""

from __future__ import annotations

import argparse
import json
import os
import re
import smtplib
import sys
import unicodedata
from datetime import date
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

try:
    import requests
except ImportError:
    print("Installez les dépendances : pip install -r scripts/requirements.txt", file=sys.stderr)
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT / "data" / "blog-manifest.json"
POSTS_DIR = ROOT / "content" / "blog" / "posts"
IMAGES_DIR = ROOT / "content" / "blog" / "images"
ENV_PATH = ROOT / "scripts" / ".env"


def slugify(title: str) -> str:
    s = unicodedata.normalize("NFKD", title)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s or "article"


def load_env() -> None:
    """Charge dans l’ordre : .env racine → .env.local → scripts/.env (ce dernier prime)."""
    if not load_dotenv:
        return
    load_dotenv(ROOT / ".env")
    load_dotenv(ROOT / ".env.local")
    load_dotenv(ENV_PATH)


def download_cover_image(
    slug: str, keywords: str, unsplash_key: str | None, pexels_key: str | None
) -> tuple[str, str | None]:
    """
    Retourne (chemin_web, crédit_html_optionnel).
    Chemin web type /content/blog/images/slug-cover.jpg ou image par défaut.
    """
    dest = IMAGES_DIR / f"{slug}-cover.jpg"
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    if unsplash_key:
        try:
            r = requests.get(
                "https://api.unsplash.com/search/photos",
                params={"query": keywords, "per_page": 1, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {unsplash_key}"},
                timeout=30,
            )
            r.raise_for_status()
            results = r.json().get("results") or []
            if results:
                img_url = results[0]["urls"]["regular"]
                author = (results[0].get("user") or {}).get("name", "")
                link = (results[0].get("links") or {}).get("html", "")
                ir = requests.get(img_url, timeout=60)
                ir.raise_for_status()
                dest.write_bytes(ir.content)
                credit = f'Photo <a href="{link}">Unsplash</a> — {author}' if link else None
                return f"/content/blog/images/{dest.name}", credit
        except Exception as e:
            print(f"[Unsplash] {e}", file=sys.stderr)

    if pexels_key:
        try:
            r = requests.get(
                "https://api.pexels.com/v1/search",
                params={"query": keywords, "per_page": 1, "orientation": "landscape"},
                headers={"Authorization": pexels_key},
                timeout=30,
            )
            r.raise_for_status()
            photos = r.json().get("photos") or []
            if photos:
                src = photos[0].get("src") or {}
                img_url = src.get("large") or src.get("original")
                if img_url:
                    ir = requests.get(img_url, timeout=60)
                    ir.raise_for_status()
                    dest.write_bytes(ir.content)
                    return f"/content/blog/images/{dest.name}", "Photo Pexels"
        except Exception as e:
            print(f"[Pexels] {e}", file=sys.stderr)

    return "/assets/images/preview.png", None


def excerpt_from_body(body: str, title: str, max_len: int = 220) -> str:
    """Dérive un chapô depuis le corps Markdown (sans le bloc après --- final)."""
    main = body.split("\n---\n", 1)[0].strip()
    text = re.sub(r"^#+\s+.*$", "", main, flags=re.MULTILINE)
    text = re.sub(r"\*\*?([^*]+)\*\*?", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > max_len:
        cut = text[: max_len].rsplit(" ", 1)[0]
        text = (cut or text[:max_len]) + "…"
    return text if text else f"Design UI/UX et product design : {title[:100]}"


def strip_md_fences(text: str) -> str:
    """Retire un éventuel bloc ```markdown ... ``` autour de toute la réponse."""
    t = text.strip()
    if not t.startswith("```"):
        return t
    lines = t.split("\n")
    if lines[0].startswith("```"):
        lines = lines[1:]
    while lines and lines[-1].strip() == "":
        lines.pop()
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines).strip()


# Prompt partagé (Gemini, Groq, OpenAI)
SYSTEM_PROMPT = """Tu es rédacteur spécialisé en design UI/UX et product design.
Tu écris en français, avec un ton professionnel et clair (public : fondateurs, PME, équipes produit).
Contexte géographique souvent pertinent : Afrique de l’Ouest, Bénin, Cotonou quand c’est naturel — sans clichés.

Règles de sortie :
- Réponds UNIQUEMENT avec le corps de l’article en Markdown.
- Pas de frontmatter YAML, pas de titre # niveau 1 (le titre est déjà fixé ailleurs). Commence par une courte intro puis des sections ## et ### si besoin.
- Inclure listes, exemples concrets (SaaS, mobile, fintech, dashboards) quand utile.
- Longueur : environ 800 à 1200 mots.
- Termine par un paragraphe avec un appel discret vers la page contact du portfolio : lien [me contacter](/#contact).
- Pas de phrases creuses type « en conclusion » répétitives."""


def build_user_prompt(title: str, topic: str, keywords: str) -> str:
    return f"""Titre de l’article : {title}

Mots-clés / thème (SEO & image) : {keywords}

Angle ou consigne rédactionnelle : {topic}

Rédige l’article complet (Markdown uniquement)."""


AI_FOOTER = """
---
*Article généré avec assistance IA — relisez, fact-check, adaptez avant publication.*
"""


def finalize_ai_body(raw: str) -> str:
    body = strip_md_fences(raw.strip())
    if not body:
        raise ValueError("Réponse IA vide")
    return body + "\n" + AI_FOOTER


def generate_body_gemini(
    title: str,
    topic: str,
    keywords: str,
    api_key: str,
    model: str,
) -> str:
    """Google Gemini — quota gratuit sur [Google AI Studio](https://aistudio.google.com/apikey)."""
    import google.generativeai as genai

    genai.configure(api_key=api_key)
    user = build_user_prompt(title, topic, keywords)
    try:
        m = genai.GenerativeModel(model_name=model, system_instruction=SYSTEM_PROMPT)
        resp = m.generate_content(
            user,
            generation_config=genai.types.GenerationConfig(
                temperature=0.75,
                max_output_tokens=8192,
            ),
        )
    except (TypeError, ValueError):
        m = genai.GenerativeModel(model_name=model)
        resp = m.generate_content(
            SYSTEM_PROMPT + "\n\n" + user,
            generation_config=genai.types.GenerationConfig(
                temperature=0.75,
                max_output_tokens=8192,
            ),
        )
    text = (getattr(resp, "text", None) or "").strip()
    if not text and getattr(resp, "candidates", None):
        raise ValueError(
            "Réponse Gemini vide ou bloquée (safety). Reformulez le titre ou le topic."
        )
    return finalize_ai_body(text)


def generate_body_groq(
    title: str,
    topic: str,
    keywords: str,
    api_key: str,
    model: str,
) -> str:
    """Groq — inférence rapide, [clé gratuite](https://console.groq.com/)."""
    from openai import OpenAI

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(title, topic, keywords)},
        ],
        temperature=0.75,
        max_tokens=4500,
    )
    raw = (resp.choices[0].message.content or "").strip()
    return finalize_ai_body(raw)


def generate_body_openai(
    title: str,
    topic: str,
    keywords: str,
    api_key: str,
    model: str,
) -> str:
    """OpenAI (payant) — utilisé seulement si aucune clé gratuite ci-dessus."""
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(title, topic, keywords)},
        ],
        temperature=0.75,
        max_tokens=4500,
    )
    raw = (resp.choices[0].message.content or "").strip()
    return finalize_ai_body(raw)


def pick_ai_provider() -> str | None:
    """Priorité : Gemini (gratuit) → Groq (gratuit) → OpenAI (payant)."""
    if os.environ.get("GEMINI_API_KEY", "").strip():
        return "gemini"
    if os.environ.get("GROQ_API_KEY", "").strip():
        return "groq"
    if os.environ.get("OPENAI_API_KEY", "").strip():
        return "openai"
    return None


def build_markdown_body(topic_hint: str) -> str:
    """Squelette statique (FR) si aucune API IA n’est configurée."""
    return f"""## Contexte

Le design de produits digitaux au **Bénin** et en Afrique de l’Ouest prend une place croissante : startups, PME et institutions cherchent des interfaces claires, accessibles et crédibles. {topic_hint}

## Enjeux UX concrets

Les équipes peinent souvent à prioriser : charge informationnelle, parcours mobiles, et cohérence visuelle sur le long terme. Un bon **design system** et des prototypes testables permettent de réduire les allers-retours avec le développement.

## Ce que je recommande

1. **Recherche utilisateur** ciblée (même légère) avant de figer l’UI.
2. **Parcours** mesurables : objectifs, erreurs, temps pour accomplir une tâche clé.
3. **Itérations courtes** : livrer, mesurer, ajuster — plutôt que de viser la perfection au premier jet.

## Conclusion

Si vous lancez un **SaaS**, une app **mobile** ou un service **fintech**, investir tôt dans l’UX évite des coûts plus tard. Vous pouvez [me contacter depuis le portfolio](/#contact) pour en discuter.

---
*Brouillon généré automatiquement — relisez, ajustez le ton et les exemples avant de publier (`published: true`).*
"""


def write_post(
    *,
    title: str,
    slug: str,
    excerpt: str,
    cover_web_path: str,
    body_md: str,
    published: bool,
) -> Path:
    today = date.today().isoformat()
    pub = "true" if published else "false"
    front = f"""---
title: "{title.replace('"', '\\"')}"
slug: {slug}
date: "{today}"
excerpt: "{excerpt.replace('"', '\\"')}"
coverImage: "{cover_web_path}"
lang: "fr"
published: {pub}
---

"""
    path = POSTS_DIR / f"{slug}.md"
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(front + body_md, encoding="utf-8")
    return path


def update_manifest(
    *,
    slug: str,
    title: str,
    excerpt: str,
    cover_web_path: str,
    published: bool,
) -> None:
    data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    posts = data.get("posts") or []
    entry = {
        "slug": slug,
        "title": title,
        "date": date.today().isoformat(),
        "excerpt": excerpt,
        "coverImage": cover_web_path,
        "lang": "fr",
        "published": published,
    }
    replaced = False
    for i, p in enumerate(posts):
        if p.get("slug") == slug:
            posts[i] = entry
            replaced = True
            break
    if not replaced:
        posts.append(entry)
    posts.sort(key=lambda p: str(p.get("date", "")), reverse=True)
    data["posts"] = posts
    MANIFEST_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def send_email_smtp(
    subject: str,
    html_body: str,
    text_body: str,
) -> None:
    host = os.environ.get("SMTP_HOST", "").strip()
    port = int(os.environ.get("SMTP_PORT", "465"))
    user = os.environ.get("SMTP_USER", "").strip()
    password = os.environ.get("SMTP_PASS", "").strip()
    to_addr = os.environ.get("EMAIL_TO", user).strip()

    if not host or not user or not password:
        print("SMTP non configuré — e-mail non envoyé. Renseignez scripts/.env", file=sys.stderr)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_addr
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP_SSL(host, port) as server:
            server.login(user, password)
            server.sendmail(user, [to_addr], msg.as_string())
    except smtplib.SMTPAuthenticationError as e:
        print(
            "\n⚠️  Échec connexion SMTP (identifiants refusés).\n"
            "   Gmail : utilisez un « mot de passe d’application », pas le mot de passe du compte.\n"
            "   https://support.google.com/accounts/answer/185833\n"
            f"   Détail : {e}\n",
            file=sys.stderr,
        )
        return False
    except OSError as e:
        print(f"\n⚠️  Erreur réseau / SMTP : {e}\n", file=sys.stderr)
        return False
    print(f"E-mail envoyé à {to_addr}")
    return True


def main() -> None:
    load_env()

    parser = argparse.ArgumentParser(description="Génère un brouillon d’article de blog.")
    parser.add_argument("--title", required=True, help="Titre de l’article (H1 / balise title)")
    parser.add_argument(
        "--keywords",
        default="ui ux design workspace minimal product",
        help="Mots-clés pour la recherche d’image (Unsplash/Pexels)",
    )
    parser.add_argument(
        "--topic",
        default="Cet article pose les bases d’une approche produit centrée utilisateur.",
        help="Phrase de contexte injectée dans le corps Markdown",
    )
    parser.add_argument(
        "--excerpt",
        default="",
        help="Chapô court (sinon dérivé du titre)",
    )
    parser.add_argument(
        "--publish",
        action="store_true",
        help="Marquer published=true dans le .md et le manifeste (sinon brouillon)",
    )
    parser.add_argument(
        "--no-email",
        action="store_true",
        help="Ne pas envoyer l’e-mail de notification",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Afficher les chemins sans écrire les fichiers",
    )
    parser.add_argument(
        "--no-ai",
        action="store_true",
        help="Ne pas appeler d’API IA — modèle statique uniquement",
    )
    args = parser.parse_args()

    title = args.title.strip()
    slug = slugify(title)

    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    gemini_model = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash").strip() or "gemini-1.5-flash"
    groq_key = os.environ.get("GROQ_API_KEY", "").strip()
    groq_model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile").strip() or "llama-3.3-70b-versatile"
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    openai_model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"

    provider = None if args.no_ai else pick_ai_provider()
    use_ai_planned = provider is not None

    md_path = POSTS_DIR / f"{slug}.md"
    if args.dry_run:
        labels = {
            "gemini": "Gemini (gratuit, Google AI Studio)",
            "groq": "Groq (gratuit)",
            "openai": "OpenAI (payant)",
        }
        print("Slug     :", slug)
        print("Markdown :", md_path)
        print("published:", args.publish)
        print("IA       :", labels.get(provider, "non (modèle statique)"))
        print("(dry-run : aucun appel API ni écriture fichier)")
        return

    unsplash = os.environ.get("UNSPLASH_ACCESS_KEY", "").strip()
    pexels = os.environ.get("PEXELS_API_KEY", "").strip()

    cover_path, credit = download_cover_image(slug, args.keywords, unsplash or None, pexels or None)

    use_ai = provider is not None
    body: str
    if use_ai:
        try:
            if provider == "gemini":
                print("Génération du texte via Google Gemini…", file=sys.stderr)
                body = generate_body_gemini(
                    title=title,
                    topic=args.topic,
                    keywords=args.keywords,
                    api_key=gemini_key,
                    model=gemini_model,
                )
            elif provider == "groq":
                print("Génération du texte via Groq…", file=sys.stderr)
                body = generate_body_groq(
                    title=title,
                    topic=args.topic,
                    keywords=args.keywords,
                    api_key=groq_key,
                    model=groq_model,
                )
            else:
                print("Génération du texte via OpenAI…", file=sys.stderr)
                body = generate_body_openai(
                    title=title,
                    topic=args.topic,
                    keywords=args.keywords,
                    api_key=openai_key,
                    model=openai_model,
                )
        except Exception as e:
            print(
                f"⚠️  API IA indisponible ({e}) — utilisation du modèle statique.\n",
                file=sys.stderr,
            )
            body = build_markdown_body(args.topic)
            use_ai = False
    else:
        if not args.no_ai:
            print(
                "ℹ️  Aucune clé IA détectée (GEMINI_API_KEY, GROQ_API_KEY ou OPENAI_API_KEY).\n"
                "   Ajoutez-la dans : .env ou .env.local (racine du projet) ou scripts/.env\n"
                "   (voir scripts/.env.example). Le texte de l’article utilise alors le modèle statique.\n",
                file=sys.stderr,
            )
        body = build_markdown_body(args.topic)

    excerpt = (args.excerpt or "").strip()
    if not excerpt:
        excerpt = excerpt_from_body(body, title)

    write_post(
        title=title,
        slug=slug,
        excerpt=excerpt,
        cover_web_path=cover_path,
        body_md=body,
        published=args.publish,
    )
    update_manifest(
        slug=slug,
        title=title,
        excerpt=excerpt,
        cover_web_path=cover_path,
        published=args.publish,
    )

    print(f"OK — {md_path.relative_to(ROOT)}")
    print(f"    Manifeste mis à jour : {MANIFEST_PATH.relative_to(ROOT)}")

    skip_email = args.no_email or os.environ.get("SKIP_EMAIL") == "1"
    if not skip_email:
        rel_md = md_path.relative_to(ROOT).as_posix()
        link_article = f"https://imdadadenon.vercel.app/blog/article.html?slug={slug}"
        subj = f"[Blog brouillon] {title}"
        text_body = (
            f"Titre : {title}\nSlug : {slug}\n\n"
            f"Fichiers à relire :\n- {rel_md}\n- data/blog-manifest.json\n\n"
            f"Après correction : git add, commit, push.\n"
            f"Pour afficher en ligne (brouillon) : ouvrir {link_article}\n"
            f"Passez published à true dans le .md et le JSON pour indexer l’article.\n"
        )
        credit_html = f"<p><small>{credit}</small></p>" if credit else ""
        html_body = f"""<html><body>
<h2>Brouillon généré</h2>
<p><strong>{title}</strong></p>
<p>Slug : <code>{slug}</code></p>
<p>Couverture : <code>{cover_path}</code></p>
{credit_html}
<p>Relisez le Markdown, puis :</p>
<ol>
<li><code>git add {rel_md} data/blog-manifest.json content/blog/images/</code></li>
<li><code>git commit -m "blog: {slug}"</code></li>
<li><code>git push</code></li>
</ol>
<p>Lien direct (après déploiement) : <a href="{link_article}">{link_article}</a></p>
</body></html>"""
        send_email_smtp(subj, html_body, text_body)
        # Les fichiers sont déjà écrits : pas d’exit code d’erreur si l’e-mail seul échoue.


if __name__ == "__main__":
    main()
