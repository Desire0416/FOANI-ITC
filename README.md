# FOANI-ITC — Portail institutionnel

Site public de **FOANI International Training College**, université 100 % agricole
implantée à Agnibilékrou (Côte d'Ivoire).

Ce dépôt couvre le **premier des quatre systèmes** décrits au cahier des charges
fonctionnel (§7.1) : le site institutionnel. Le portail d'admission, l'espace de
scolarité et la plateforme pédagogique Moodle sont des systèmes distincts ; ce
site les référence sans les héberger.

---

## Démarrer

```bash
pnpm install
```

```bash
pnpm dev
```

| Commande         | Effet                                            |
| ---------------- | ------------------------------------------------ |
| `pnpm dev`       | Serveur de développement sur `localhost:3000`    |
| `pnpm build`     | Compilation de production                        |
| `pnpm start`     | Serveur de production                            |
| `pnpm typecheck` | Vérification TypeScript stricte, sans émission   |
| `pnpm lint`      | ESLint                                           |

Copier `.env.example` en `.env.local` avant la mise en ligne : deux réglages
changent le comportement visible du site (voir « Points de branchement »).

---

## Choix techniques

| Sujet          | Choix                          | Raison                                                                                       |
| -------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| Cadre          | Next.js 16, App Router         | Rendu serveur par défaut : le contenu part en HTML, pas en JSON à rehydrater.                  |
| Socle d'administration | Payload CMS 3, dans la même application | §22.1 demande un socle éprouvé livrant une interface complète. Contrôle d'accès par rôle et par champ (§5.2, §20.2), cycle Brouillon → Publié natif (§24.4), interface habillable à la charte. |
| Base de données | SQLite (libSQL)               | Le critère éliminatoire du projet est la restauration par un technicien extérieur (§21.1, §24.4). Une base en un fichier se restaure par une copie. |
| Langage        | TypeScript strict              | `noUncheckedIndexedAccess` compris. Le modèle de contenu distingue « absent » de « vide ».     |
| Styles         | Tailwind CSS v4                | Jetons déclarés une fois dans `globals.css`, aucune couleur en dur ailleurs.                    |
| Polices        | Fraunces + Plus Jakarta Sans   | Auto-hébergées par `next/font`, sous-ensemble latin. Aucune requête vers un tiers.             |
| Animation      | CSS + un `IntersectionObserver` | Aucune bibliothèque d'animation : ~102 kB de JS partagé pour l'ensemble du site.               |
| Contenu        | Modules TypeScript typés       | Le catalogue, les fiches et les actualités sont du code typé, versionné et vérifié à la compilation. |

**66 pages générées statiquement**, dont 30 fiches de formation, 6 fiches
techniques et les articles d'actualité.

---

## Structure

```
src/
├── app/
│   ├── (site)/             Portail public — gabarit, en-tête, pied de page
│   │   ├── actions/        Server Action de réception des demandes
│   │   ├── formations/[slug]/  Fiche de formation — l'unité de conversion (§9.1)
│   │   ├── ressources/[slug]/  Fiches techniques agricoles (§8.6)
│   │   ├── sitemap.ts      Plan du site généré depuis le contenu (§19.1)
│   │   └── robots.ts
│   └── (payload)/          Administration et API — gabarit distinct
│       ├── admin/          Interface d'administration
│       ├── api/            REST et GraphQL
│       └── custom.scss     Déclinaison de la charte sur l'administration
├── components/
│   ├── brand/              Les trois signes de marque et le jeu d'icônes
│   ├── layout/             En-tête, pied de page, gabarits de page
│   ├── sections/           Sections de la page d'accueil
│   └── ui/                 Boutons, cartes, accordéon, primitives
├── content/                Éditorial statique du site public, typé
├── payload/                Collections, rôles, contrôle d'accès, séquences
├── payload.config.ts       Configuration du socle
└── lib/                    Index de recherche, polices, utilitaires
```

Les deux groupes de routes ont chacun leur gabarit racine : l'administration
n'hérite ni de l'en-tête, ni du pied de page, ni des styles du portail public.

### Modèle de données

Trois règles structurantes du CDC sont tenues dans le schéma, pas dans
l'interface :

- **La personne et l'inscription sont deux notions distinctes** (§11.2). La
  collection `personnes` ne porte ni filière ni niveau : les y inscrire
  écraserait la trace des années précédentes.
- **Le numéro est opaque** (§11.1). Ni filière, ni niveau, ni millésime — une
  séquence unique partagée par les étudiants et les participants aux formations
  courtes, produite par `payload/sequence.ts`.
- **Une référence de transaction déjà utilisée est rejetée** (§10.2). C'est une
  contrainte d'unicité en base, pas une vérification d'écran.

Rien n'est supprimable : ni une personne, ni une candidature, ni une pièce
déposée. Un dossier change d'état, il ne disparaît pas.

### Amorçage

```bash
ADMIN_EMAIL=vous@exemple.ci ADMIN_MOT_DE_PASSE=… pnpm amorcer
```

Crée le premier compte administrateur. Idempotent : relancé, il ne crée pas de
doublon. Les comptes des agents se créent ensuite depuis `/admin`, par rôle.

Le contenu ne vit **que** dans `src/content/`. Un intitulé de formation, un
tarif ou une actualité se modifie à un seul endroit et se répercute sur les
pages, la recherche interne, le plan du site et les données structurées.

---

## Identité visuelle

Toute la charte dérive d'un seul objet : **la couronne de laurier du logo**.
Trois signes en sortent, et trois seulement.

- **La feuille** (`LeafSprig`) — accent de titre, puce de liste, marqueur.
- **L'arc** (`ArcClipDef`, `ArcTrace`) — la courbe de la couronne agrandie
  jusqu'à devenir une limite de page. Elle découpe le média du hero et se
  double d'un trait d'or décalé.

Le portail est **pleine largeur** : aucune page n'est un bloc centré. La
gouttière `clamp(1.25rem, 4vw, 4.5rem)` suit la taille de l'écran, la
photographie du hero touche le bord droit, et sur les pages de texte la largeur
disponible porte un sommaire ancré plutôt que des marges vides.
- **L'étoile** (`StarMark`) — surmonte la couronne du logo. Réservée aux
  marqueurs de rubrique : si elle apparaît partout, elle ne signale plus rien.

La couronne entière (`LaurelWreath`) revient en filigrane à trois échelles. Ses
folioles ne sont pas dessinées une à une : elles sont réparties le long de deux
arcs par calcul, ce qui permet d'en changer la densité sans redessiner.

**Couleurs relevées au pixel** sur `logos/FOANI_logo_horizontal_couleur_transparent.png` :

| Jeton         | Valeur    | Origine                                       |
| ------------- | --------- | --------------------------------------------- |
| `ink-700`     | `#00168E` | Bleu du mot « FOANI », de la toque, du livre   |
| `gold-400`    | `#F7B500` | Or du laurier                                  |
| `gold-500`    | `#DC9E00` | Fin du dégradé du laurier                      |
| `graphite-700`| `#373537` | « International Training College »             |
| `ink-800`     | `#000F5E` | Bleu de titrage relevé sur la maquette du hero |
| `gold-300`    | `#FBCB03` | Or du bouton « Candidater » de la maquette     |

Deux règles tenues partout :

- **L'or ne porte jamais de texte blanc** (2,2:1). Il porte du bleu (11,2:1).
- **`graphite-400` n'est pas une couleur de texte** (3,25:1). Il sert aux icônes
  et aux bordures ; le texte secondaire est en `graphite-500` (4,96:1) et les
  micro-libellés de 11 px en `graphite-600` (7,34:1).

Le détail complet — états, boutons, champs, grille, espacements — est dans
[`docs/CHARTE-INTERFACE.md`](docs/CHARTE-INTERFACE.md), livrable prévu au §18.1
du CDC pour que le site, le portail d'admission, l'espace étudiant et le thème
Moodle ne divergent pas.

---

## Ce que le site ne fait pas, et pourquoi

Le CDC est explicite (§9.3) : *« Aucune rubrique n'est publiée sans contenu »*, et
*« Toute affirmation portant sur un diplôme, un agrément ou une reconnaissance
doit être vérifiable »*. Le code applique ces règles au lieu de les documenter.

- **Aucun tarif inventé.** `fraisXof` vaut `null` tant que l'établissement n'a
  pas arrêté sa grille. La fiche affiche alors un encart explicite et un moyen
  d'obtenir l'information, plutôt qu'un montant faux ou un silence.
- **Aucune photographie d'emprunt.** `MediaPlaceholder` occupe les emplacements
  attendus, annonce le sujet, et se remplace par un `next/image` sans toucher à
  la mise en page. Le §9.3 interdit tout emprunt visuel à un autre établissement.
- **Aucun contact fabriqué.** Numéros, adresses et horaires sont `null` : le
  pied de page et la page Contact renvoient vers le formulaire.
- **La rubrique Recherche & Innovation n'existe pas.** Le drapeau
  `RECHERCHE_ACTIVE` est à `false` (§8.8) : elle disparaît de la navigation, du
  plan du site et de l'index de recherche tant que les contenus n'existent pas.
- **Aucun compte social affiché.** `RESEAUX` est vide (§8.7) : mieux vaut aucun
  lien qu'un compte abandonné.

Le champ `statut` de chaque contenu (`verifie` / `a-valider` / `a-fournir`) est
la source de vérité. La liste de ce qui manque est dans
[`docs/CONTENUS-A-FOURNIR.md`](docs/CONTENUS-A-FOURNIR.md).

---

## Points de branchement

Deux réglages, dans `.env.local`, changent le comportement visible du site.

**`PROSPECTS_WEBHOOK_URL`** — destination des demandes (information, brochure,
devis, recrutement, presse). Tant qu'elle est vide, les formulaires valident la
saisie puis **disent explicitement que la demande n'a pas été transmise**. Un
formulaire qui affiche « message envoyé » sans destinataire perd des candidats
en leur laissant croire qu'ils ont été entendus.

**`NEXT_PUBLIC_PORTAIL_CANDIDATURE_URL`** et les autres adresses de services —
chaque carte de l'Espace numérique n'affiche un lien que si son adresse est
renseignée. Sinon elle annonce « bientôt disponible ». C'est exactement le
défaut relevé par l'audit sur le dispositif précédent : une adresse annoncée
aux étudiants qui ne correspondait plus à rien.

---

## Performance et robustesse

Contraintes du §19.5 : le site doit rester utilisable depuis un téléphone sur
réseau mobile dégradé.

- **~102 kB de JavaScript partagé** pour l'ensemble du site, pages comprises.
- **Le catalogue est rendu par le serveur.** Le filtre client reçoit les cartes
  déjà rendues, pas le catalogue en JSON : le navigateur ne re-rend rien, et les
  moteurs voient les trente formations, filtre ou pas.
- **Le contenu ne dépend jamais du JavaScript.** L'animation de révélation est
  conditionnée à un attribut posé par un court script en ligne. Sans script — ou
  avec un lot qui n'arrive pas —, l'attribut est absent et tout s'affiche. Un
  garde-fou de trois secondes libère l'affichage si l'observateur n'a rien fait.
- **Images** en AVIF/WebP, tailles calées sur les largeurs réellement rendues à
  partir de 360 px.

## Accessibilité

Objectif §18.3 : **WCAG 2.2 niveau AA** sur les parcours publics.

Contrastes vérifiés par mesure sur les pages rendues, focus visible, navigation
au clavier complète, lien d'évitement, étiquettes de formulaire explicites,
erreurs rattachées au champ par `aria-describedby`, `aria-live` sur les
compteurs de résultats, et respect de `prefers-reduced-motion` sur l'ensemble
des mouvements — y compris le décompte des chiffres clés.

Une recette d'accessibilité complète sur les gabarits critiques reste à conduire
avant mise en service, conformément au CDC.

---

## Mise en service

### 1. Variables d'environnement

Copier `.env.example`, renseigner, et reporter les mêmes valeurs dans Vercel
(*Settings → Environment Variables*). Trois variables suffisent à démarrer :

| Variable | Rôle |
| -------- | ---- |
| `PAYLOAD_SECRET` | Signature des sessions. Une chaîne aléatoire de 64 caractères, distincte par environnement. |
| `DATABASE_URL` | Serveur PostgreSQL, via le pool de connexions. |
| `NEXT_PUBLIC_APP_URL` | Adresse publique : URL canoniques, plan du site, données structurées. |

`DATABASE_URL_UNPOOLED` — la connexion directe, sans pool — n'est utile qu'aux
scripts d'amorçage : un pool de connexions ne supporte pas les instructions qui
modifient le schéma.

### 2. Base de données

Le schéma est appliqué automatiquement à la première connexion. Pour figer ce
comportement une fois le dispositif stabilisé, poser `PAYLOAD_MIGRATIONS=strictes`
et passer par `payload migrate`.

**Sauvegarde et restauration (§21.1, critère éliminatoire du §24.4)** — la base
étant PostgreSQL, la procédure tient en deux commandes, documentées partout :

```
pg_dump "$DATABASE_URL_UNPOOLED" -Fc -f sauvegarde-$(date +%F).dump
pg_restore -d "$DATABASE_URL_UNPOOLED" --clean --if-exists sauvegarde-2026-08-13.dump
```

La restauration doit être **effectivement testée** sur une base vierge avant
toute mise en ligne. C'est ce qui a manqué au dispositif précédent.

### 3. Stockage des pièces justificatives

Trois cas, dans cet ordre de priorité, sans modification de code :

1. **Vercel Blob** — connecter un magasin au projet. La plateforme pose
   `BLOB_READ_WRITE_TOKEN`, l'adaptateur s'active seul.
2. **S3** — renseigner `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`,
   `S3_SECRET_ACCESS_KEY`.
3. **Disque local** — par défaut. Les fichiers restent hors du dossier public
   et ne sont servis que par Payload, sous contrôle d'accès.

Dans les trois cas, une pièce d'identité n'a jamais d'adresse devinable (§20.2).

### 4. Comptes

```
pnpm amorcer            # premier administrateur (ADMIN_EMAIL, ADMIN_MOT_DE_PASSE)
pnpm creer-agent        # un agent, avec son rôle (AGENT_EMAIL, AGENT_MOT_DE_PASSE, AGENT_ROLE)
pnpm amorcer-agents     # neuf comptes d'essai, un par rôle — mots de passe affichés une fois
pnpm amorcer-editorial  # reprend en base les actualités et événements initiaux
```

Tous ces scripts sont idempotents : relancés, ils ne créent pas de doublon.

Les comptes créés par `amorcer-agents` sont des **comptes d'essai**. Ils doivent
être supprimés ou voir leur mot de passe changé, depuis l'espace Agents, avant
l'ouverture au public.

---

## Sources

- `CDC_Fonctionnel_FITC.docx` — cahier des charges fonctionnel, version 1.1,
  août 2026. Document interne, non versionné : le dépôt est public.
- `logos/` — déclinaisons du logo fournies par l'établissement.
- `Section hero.png`, `Image_hero.png` — maquette et photographie du hero.
  Documents de travail, non versionnés ; les visuels réellement servis par le
  site vivent dans `public/`.
