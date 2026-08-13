# Point d'étape — dispositif web FOANI-ITC

Situation au 13 août 2026, lue au regard du phasage du CDC (§24.2) et des
décisions restant à valider (§27).

---

## 1. Où nous en sommes

| Phase | Échéance CDC | Objet | État |
| ----- | ------------ | ----- | ---- |
| 0 | Semaine 1 | Infrastructure neuve, isolement de l'ancien environnement, sauvegarde et restauration éprouvée | **Non engagée** — hors de ce dépôt |
| 1a | Fin août | Site institutionnel et fiches de formation | **Livré** — 84 pages |
| 1b | Mi-septembre | Portail de candidature, espace d'instruction, version anglaise, pages légales | **Livré, sauf la version anglaise** |
| 2 | 3 octobre | Plateforme pédagogique Moodle en service | Non engagée |
| 3 | 30 novembre | Espace étudiant, reprise des dossiers, registre des versements | Non engagée |
| 4 | 31 janvier 2027 | Délibérations, relevés, tableaux de bord, authentification unifiée | Non engagée |

**Point de vigilance (§24.4) :** la sauvegarde avec restauration effectivement
testée est un **critère éliminatoire de la phase 0**. C'est le point qui a fait
défaut au dispositif précédent. Rien ne devrait être mis en ligne avant qu'il
soit satisfait.

---

## 2. Ce qui est livré

### 2.1 Le site public — 84 pages

L'arborescence complète du chapitre 8 : les 30 fiches de formation de
l'Annexe A, six fiches techniques agricoles, les pages légales, le catalogue
filtrable, le comparateur, la recherche globale sur tout le portail, les cinq
parcours de formulaire entrants, le plan du site et les données structurées
générés automatiquement.

### 2.2 Le portail de candidature — `/mon-dossier`

Le parcours du §10.1, en six étapes : compte par numéro de téléphone, choix de
formation, identité, parcours scolaire, dépôt des pièces depuis un téléphone,
frais de dossier, récapitulatif et envoi, puis suivi.

- le dossier s'enregistre à chaque étape et se reprend là où il a été laissé ;
- un numéro de dossier opaque est attribué à l'ouverture (§10.4) ;
- un dossier envoyé n'est plus modifiable, sauf demande de complément (§10.3) ;
- une pièce refusée porte son motif, bloque le renvoi et se redépose sans
  refaire le dossier ;
- le dispositif n'encaisse rien : il enregistre une référence de transaction,
  unique en base, qu'un agent rapproche de son relevé (§10.2).

### 2.3 L'espace d'instruction — `/gestion`

Liste et fiche d'instruction des candidatures, décision sur chaque pièce avec
motif, rapprochement des versements, décision d'admission, comptes candidats,
référentiel des personnes, gestion des agents et de leurs rôles.

### 2.4 L'espace d'administration éditoriale — `/gestion/publications`

Le critère de recette du §24.4 — *« le personnel modifie une page et publie une
actualité sans assistance technique »* — est tenu pour les trois rubriques qui
vivent : **actualités**, **événements**, **offres de stage et d'emploi**.

Le cycle est celui du CDC : **Brouillon → À valider → Publié → Archivé**.

- le rédacteur écrit et soumet ; il ne publie pas, et ne peut pas non plus
  modifier ni retirer un contenu déjà en ligne ;
- l'éditeur relit, met en ligne, retire, archive ;
- le responsable carrières dispose des mêmes droits, sur les offres seulement ;
- chaque changement d'état est journalisé avec son auteur et sa date ;
- la mise en ligne régénère les pages publiques concernées : le visiteur ne
  paie aucune requête de base pour lire une actualité ;
- **une offre échue disparaît d'elle-même** à sa date limite, sans intervention.

### 2.5 Recette avant mise en ligne

- **Plan de redirections** (§19.1) — le mécanisme est en place, avec huit
  redirections internes déjà actives. Le tableau à compléter et son mode
  d'emploi sont dans [`src/content/redirections.ts`](../src/content/redirections.ts).
- **Mesure d'audience et consentement** (§19.1, §20.2) — trois outils câblés,
  activés par variable d'environnement. Un outil sans traceur démarre sans
  bandeau ; un outil avec traceur déclenche un bandeau où **refuser est un
  bouton de la même taille qu'accepter**. Sans variable renseignée, aucun
  domaine tiers n'est appelé.
- **En-têtes de sécurité** (§20.1) — `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, et `no-store` sur les espaces privés.
- **Accessibilité** (§18.3, WCAG 2.2 AA) — contraste, alternatives textuelles,
  noms accessibles, étiquettes de formulaire, ordre des titres, taille des
  cibles tactiles et absence de débordement horizontal contrôlés sur les
  parcours critiques, à 375 px. Trente-quatre cibles tactiles sous les 24 px du
  critère 2.5.8 ont été corrigées, et un texte à 3,06:1 relevé à 4,96:1.

---

## 3. Ce qui reste à faire

### 3.1 Sur le périmètre public

| Sujet | Référence | Dépend de |
| ----- | --------- | --------- |
| **Version anglaise** | §19.3, §27.3 | Périmètre exact et fourniture des traductions |
| **Liste des anciennes adresses** à rediriger | §19.1 | Export du plan de site précédent |
| **Choix de l'outil de mesure d'audience** | §19.1 | Une décision, puis trois variables à renseigner |
| **Sessions datées** des certificats et masterclass | §6.3 | Calendrier de l'année |
| **Brochures PDF** versionnées et datées | §9.5 | Production des brochures |
| **Rubrique Recherche & Innovation** | §8.8, §27.2 | Décision de maintien ou de retrait |
| **Adresse exacte de la page Facebook** | §8.7 | Le compte est cité, sans lien, faute d'URL |

### 3.2 Service d'envoi de messages

Aucun service de courriel ou de message court n'est branché. Le §10.4 prévoit
une notification à chaque changement d'état d'un dossier : en son absence, la
page de suivi en tient lieu, et le dit franchement au candidat plutôt que de
laisser croire qu'un message est parti.

---

## 4. Décisions attendues de votre part

### 4.1 Bloquant avant toute mise en ligne (§27.1)

> La formule **« première université ivoirienne intégralement dédiée à
> l'agriculture »** figure en description de la page d'accueil et sur la page
> L'Université. Le CDC la range parmi les points bloquants : il faut *« valider
> toute formule de positionnement telle que celle-ci et conserver les éléments
> permettant de l'étayer »*.
>
> - vous détenez de quoi l'établir → nous la conservons ;
> - sinon → nous la remplaçons par « université spécialisée dans les domaines
>   agricole, agropastoral et agroalimentaire ». Dix minutes de travail.

### 4.2 Autres points (§27.1 à §27.3)

- [ ] **Périmètre de l'agrément** — numéro, autorité émettrice, date, filières
      et niveaux couverts. *Avant publication des fiches de formation.*
- [ ] **Grilles tarifaires** par formation et par niveau
- [ ] **Frais de dossier** — exigibilité, montant, numéros officiels de réception
- [ ] **Liste des pièces** attendues par cycle
- [ ] **Portrait de la directrice** — le nom et la fonction sont publiés
- [ ] **Profils des enseignants** — fonction, discipline, expertise, biographie,
      photographie autorisée
- [ ] **Photographies du campus** et autorisations de droit à l'image
- [ ] **Horaires d'accueil** et adresses électroniques par service
- [ ] **Passerelle après le BTS** vers la troisième année de Licence
- [ ] **Ouverture du cycle Master** — confirmer avant toute mention
- [ ] **Responsable des données** désigné, et durées de conservation par catégorie

Le détail des contenus attendus figure dans
[CONTENUS-A-FOURNIR.md](CONTENUS-A-FOURNIR.md).

---

## 5. Ce qu'il faut retenir

**Le recrutement peut démarrer.** Un candidat crée son compte, dépose son
dossier depuis son téléphone et en suit l'instruction ; un agent l'instruit et
décide. La boucle est complète.

**L'établissement est autonome sur ses contenus vivants.** Actualités,
événements et offres se publient depuis le back-office, sans développeur.

**Ce qui manque tient à des décisions et à des contenus, pas à du
développement** : les gabarits existent, les emplacements sont prêts, et chaque
donnée absente est signalée à l'écran au lieu d'être inventée.

**La phase 0 conditionne tout le reste.** Infrastructure neuve, isolement de
l'ancien environnement, sauvegarde restaurée et vérifiée. Le CDC en fait un
critère éliminatoire, et l'audit a montré pourquoi.

---

## 6. Procédures d'exploitation

| Commande | Effet |
| -------- | ----- |
| `pnpm amorcer` | Crée le premier compte administrateur (`ADMIN_EMAIL`, `ADMIN_MOT_DE_PASSE`) |
| `pnpm creer-agent` | Crée un compte d'agent avec son rôle (`AGENT_EMAIL`, `AGENT_MOT_DE_PASSE`, `AGENT_ROLE`) |
| `pnpm amorcer-editorial` | Reprend en base les actualités et événements initiaux — idempotent |
| `pnpm typecheck` / `pnpm lint` / `pnpm build` | Contrôles avant livraison |
