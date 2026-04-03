# Blog — génération d’articles (phase 1)

Ce dossier contient le script Python qui crée les **brouillons** d’articles. La **mise en ligne** se fait par **Git** (Vercel redéploie automatiquement après `git push`).

---

## Ce qui est « OK » côté projet

| Élément | Rôle |
|--------|------|
| `data/blog-manifest.json` | Liste des articles ; champ **`published`** : seul critère pour afficher l’article sur le site (`/blog/` et page article). |
| `content/blog/posts/<slug>.md` | Texte Markdown + métadonnées (frontmatter). Doit exister pour l’URL `?slug=<slug>`. |
| `content/blog/images/` | Images de couverture téléchargées par le script (optionnel). |
| `blog/index.html` / `blog/article.html` | Pages du blog (déjà branchées au manifeste + `.md`). |
| `vercel.json` | Routes `/blog` et `/blog/` → liste des articles. |

**Règle importante :** le navigateur lit **`published` dans `blog-manifest.json`**. Si `published: false`, l’article **n’apparaît pas** dans la liste et la page dédiée affiche « non publié » — même si le fichier `.md` est présent.

---

## Installation (une fois)

```bash
cd chemin/vers/monPortfolio
pip install -r scripts/requirements.txt
copy scripts\.env.example scripts\.env
```

Puis définissez les clés dans l’un de ces fichiers (le script les charge **dans cet ordre**, le dernier gagne pour une même variable) :

1. **`.env`** à la racine du dépôt  
2. **`.env.local`** à la racine (souvent ignoré par Git — pratique pour les secrets en local)  
3. **`scripts/.env`** (déjà listé dans `.gitignore`)

Voir **`scripts/.env.example`** pour les noms exacts des variables (`GEMINI_API_KEY`, etc.).

### Clés pour le **texte** (IA)

| Clé | Coût | Lien |
|-----|------|------|
| **`GEMINI_API_KEY`** (recommandé) | Gratuit (quota) | [Google AI Studio](https://aistudio.google.com/apikey) |
| **`GROQ_API_KEY`** | Gratuit (limites) | [Groq](https://console.groq.com/keys) |
| **`OPENAI_API_KEY`** | Payant | [OpenAI](https://platform.openai.com/api-keys) |

**Ordre automatique :** Gemini → Groq → OpenAI → sinon modèle statique intégré.

Modèles par défaut : `GEMINI_MODEL=gemini-1.5-flash`, `GROQ_MODEL=llama-3.3-70b-versatile`, `OPENAI_MODEL=gpt-4o-mini`.

### Clés pour l’**image** de couverture (optionnel)

- `UNSPLASH_ACCESS_KEY` — [Unsplash API](https://unsplash.com/developers)  
- ou `PEXELS_API_KEY` — [Pexels API](https://www.pexels.com/api/)  

Sans clé, l’image par défaut du portfolio est utilisée.

### **E-mail** de notification (optionnel)

Pour Gmail, utilisez un [**mot de passe d’application**](https://support.google.com/accounts/answer/185833), pas le mot de passe habituel.  
En cas d’erreur `535`, voir la section [Dépannage](#dépannage-smtp-gmail).  
Pour ne jamais envoyer de mail : `SKIP_EMAIL=1` dans `.env` ou option `--no-email` sur la commande.

---

## Générer un nouvel article (brouillon)

Depuis la **racine du dépôt** :

```bash
python scripts/generate_blog_post.py --title "Mon titre d’article SEO" --keywords "ui ux saas dashboard"
```

Options utiles :

- `--topic "…"` — angle / consigne pour l’IA.
- `--excerpt "…"` — chapô affiché sur la carte (sinon extrait auto).
- `--publish` — crée directement avec **`published: true`** dans le `.md` **et** le manifeste (publication immédiate après push).
- `--no-ai` — pas d’appel IA (texte modèle statique).
- `--no-email` — pas d’e-mail.
- `--dry-run` — affiche slug et fournisseur IA, **sans** appel réseau ni fichier.

Par défaut (sans `--publish`), le script enregistre un **brouillon** : `published: false`.

---

## Comment **publier** un article (mise en ligne)

Objectif : l’article est **visible** sur `https://votre-domaine/blog/` et accessible en `.../blog/article.html?slug=mon-slug`.

### Étape 1 — Relire le contenu

1. Ouvrir `content/blog/posts/<slug>.md`.
2. Corriger le texte, titres, liens, ton.
3. Vérifier le **frontmatter** en haut du fichier (titre, date, `coverImage`, etc.).

### Étape 2 — Activer la publication dans le manifeste

Ouvrir **`data/blog-manifest.json`**, trouver l’objet avec le bon **`slug`**, et mettre :

```json
"published": true
```

Si tu as généré avec **`--publish`**, c’est déjà à `true`. Sinon, passe-le à la main de `false` → `true`.

> Les deux (`published` dans le `.md` et dans le JSON) peuvent être alignés pour clarté, mais **c’est le JSON que le site utilise** pour afficher ou masquer l’article.

### Étape 3 — Vérifier les fichiers ajoutés

Si une nouvelle image a été téléchargée :

- `content/blog/images/<slug>-cover.jpg`

### Étape 4 — Envoyer sur GitHub (déploiement Vercel)

```bash
git status
git add data/blog-manifest.json content/blog/posts/ content/blog/images/
git commit -m "blog: publication de mon-slug"
git push origin main
```

Après le push, Vercel **reconstruit** le site : l’article apparaît sur `/blog/` sous quelques minutes.

### Étape 5 — (Optionnel) SEO

Pour aider Google à découvrir la page, tu peux ajouter une entrée dans **`sitemap.xml`** avec l’URL de l’article, puis commit / push. Ce n’est pas obligatoire pour que le site fonctionne.

### Récap « brouillon → en ligne »

| État | `published` dans `blog-manifest.json` | Visible sur le site ? |
|------|----------------------------------------|----------------------|
| Brouillon | `false` | Non (liste + page article bloquées) |
| Publié | `true` | Oui (après `git push`) |

---

## Fichiers côté site (référence)

| Fichier | Usage |
|---------|--------|
| `data/blog-manifest.json` | Carte des articles + **visibilité** (`published`). |
| `content/blog/posts/*.md` | Corps de l’article (Markdown). |
| `content/blog/images/` | Couvertures générées par le script. |
| `blog/index.html` | Liste des articles. |
| `blog/article.html?slug=…` | Page d’un article. |

---

## Dépannage SMTP (Gmail)

Erreur **`535` / `Username and Password not accepted`** :

1. Activer la **validation en deux étapes** sur le compte Google.
2. Créer un **mot de passe d’application** pour « Courrier ».
3. Mettre ce mot de passe dans `SMTP_PASS` et l’adresse complète dans `SMTP_USER`.

En attendant : lancer le script avec **`--no-email`** — les fichiers sont quand même créés.

---

## Tester en local

- Lancer ton serveur statique habituel (`npm run dev`, etc.).
- Ouvrir `/blog/` et `/blog/article.html?slug=exemple-bienvenue-blog` (ou ton slug).
- Si l’article est en `published: false`, la page article affichera une erreur : c’est **normal** tant que tu n’as pas passé à `published: true`.
