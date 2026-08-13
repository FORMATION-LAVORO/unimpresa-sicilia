# UNIMPRESA Sicilia — Site vitrine + Panneau Super Admin

Application web complète pour le programme de formation certifiant **UNIMPRESA Sicilia** (Dakar, Sénégal → insertion professionnelle en Italie).

## Fonctionnalités

**Site public**
- `/` — Page d'accueil : hero, partenaires, 6 filières, déroulement (timeline), tarifs, encadré paiement, infos essentielles, avantages, footer contact. 100 % du contenu vient de la base de données.
- `/inscription` — Dossier candidat multi-étapes (identité, contact, situation pro, formation avec métiers détaillés, engagement) avec numéro de dossier unique (US-AAAA-XXXX). Notification email au Super Admin si SMTP configuré.
- `/rendezvous` — Prise de rendez-vous (motif, date souhaitée).

**Panneau Super Admin** (protégé par JWT + bcrypt)
- `/admin/login` — Connexion
- `/admin/dashboard` — Statistiques
- `/admin/cycles` — CRUD cycles / sessions (dates, durée, participants, activation)
- `/admin/filieres` — CRUD filières (icône, titre, description, durée, métiers, badge, activation)
- `/admin/tarifs` — CRUD tarifs (montants chiffres + lettres, ligne Total)
- `/admin/etapes` — CRUD + réordonnancement de la timeline
- `/admin/partenaires` — CRUD partenaires
- `/admin/avantages` — CRUD avantages (« Pourquoi nous choisir »)
- `/admin/inscriptions` — Dossiers candidats complets (statuts)
- `/admin/rendezvous` — Suivi des rendez-vous
- `/admin/parametres` — Tous les textes globaux, couleurs, devise, logo, contact + changement de mot de passe

## Identifiants admin par défaut

| Champ | Valeur |
|---|---|
| URL | `/admin/login` |
| Utilisateur | `admin` |
| Mot de passe | `admin123` |

⚠️ Changez ce mot de passe après la première connexion (onglet Paramètres).

## Stack

- Frontend : React 19 + TypeScript + Vite + Tailwind CSS
- Backend : Hono + tRPC 11 (API typée de bout en bout)
- BDD : PostgreSQL via Drizzle ORM
- Auth : JWT (12 h) + bcrypt

## Déploiement sur Render

Le dépôt contient un **blueprint** (`render.yaml`) : tout se crée en quelques clics.

1. Sur [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**
2. Connectez le dépôt GitHub `FORMATION-LAVORO/unimpresa-sicilia`
3. Render crée automatiquement :
   - une base **PostgreSQL** (`unimpresa-db`)
   - le **service web** Docker (`formations-senegal-italie`) avec `DATABASE_URL` et `JWT_SECRET` déjà branchés
4. Au premier démarrage, le schéma et les données par défaut (cycle, filières, tarifs, étapes, paramètres, compte admin) sont créés automatiquement en arrière-plan — patientez 1–2 minutes puis rechargez la page.

### Variables d'environnement (créées par le blueprint)

| Clé | Valeur |
|---|---|
| `DATABASE_URL` | fournie automatiquement par la base Render |
| `JWT_SECRET` | générée automatiquement |
| `NODE_ENV` | `production` |

### Reprendre l'URL existante `formations-senegal-italie.onrender.com`

Le blueprint nomme déjà le service `formations-senegal-italie`. Si l'ancien service occupe encore ce nom : supprimez l'ancien service (ou renommez-le) **avant** de lancer le blueprint, l'URL sera alors reprise à l'identique.

## Développement local

```bash
npm install
npm run db:push        # synchronise le schéma
npx tsx db/seed.ts     # données par défaut (captures) + compte admin
npm run dev            # http://localhost:3000
```

## Production

```bash
npm run build
npm start
```

Le `Dockerfile` inclus build l'application et démarre le serveur sur le port 3000.

## Email (optionnel)

La notification email des inscriptions est activée en définissant :
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_EMAIL`.
Sans configuration SMTP, les inscriptions sont simplement journalisées côté serveur.

## Structure

```
api/          Serveur Hono + routeurs tRPC (site public, admin)
contracts/    Types partagés front/back
db/           Schéma Drizzle + seed
src/pages/    Pages publiques et panneau admin
```
