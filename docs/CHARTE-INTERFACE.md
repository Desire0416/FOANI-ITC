# Charte d'interface — FOANI-ITC

Livrable prévu au **§18.1 du CDC** : *« Le prestataire décline cette charte sur
le support numérique et produit, en complément, les éléments propres à
l'interface qu'une charte d'identité ne couvre pas : couleurs d'état, styles de
boutons et de champs, grille, espacements, traitement des images et des
tableaux. […] L'ensemble constitue un guide d'interface réutilisable sur le
site, le portail d'admission, l'espace étudiant et le thème Moodle afin d'éviter
quatre expériences visuelles divergentes. »*

Ce document décrit ce qui a été produit ici et doit être repris tel quel sur les
trois autres systèmes. Il ne se substitue pas à la charte d'identité de
l'établissement, qui reste la référence pour le logo et la marque.

Toutes les valeurs vivent dans un seul fichier : `src/app/globals.css`, bloc
`@theme`.

---

## 1. Couleurs

### 1.1 Relevées sur le logo

| Jeton           | Valeur    | Élément du logo                              |
| --------------- | --------- | -------------------------------------------- |
| `ink-700`       | `#00168E` | Mot « FOANI », toque, livre                   |
| `gold-400`      | `#F7B500` | Or du laurier                                 |
| `gold-500`      | `#DC9E00` | Fin du dégradé du laurier                     |
| `graphite-700`  | `#373537` | « International Training College »            |

### 1.2 Relevées sur la maquette du hero

| Jeton          | Valeur    | Élément                            |
| -------------- | --------- | ---------------------------------- |
| `ink-800`      | `#000F5E` | Titrage                             |
| `gold-300`     | `#FBCB03` | Bouton « Candidater »               |
| `graphite-500` | `#6B6F79` | Paragraphe                          |
| `paper-tint`   | `#F7F8FB` | Fond du hero                        |

### 1.3 Échelles complètes

**Bleu** — `ink-950 #00061F`, `ink-900 #000A38`, `ink-800 #000F5E`,
`ink-700 #00168E`, `ink-600 #1B33A6`, `ink-500 #3B52BE`, `ink-400 #6377D1`,
`ink-300 #98A6E0`, `ink-200 #C2CBEE`, `ink-100 #DDE3F7`, `ink-50 #EFF2FC`.

**Or** — `gold-800 #6B4B00`, `gold-700 #8A6100`, `gold-600 #B87F00`,
`gold-500 #DC9E00`, `gold-400 #F7B500`, `gold-300 #FBCB03`, `gold-200 #FDE08A`,
`gold-100 #FEF3D0`, `gold-50 #FFFAEC`.

**Gris** — `graphite-900 #1C1B1D`, `graphite-700 #373537`, `graphite-600 #52555E`,
`graphite-500 #6B6F79`, `graphite-400 #8A8F99`, `graphite-300 #B6BAC3`,
`graphite-200 #D8DBE2`, `graphite-100 #E9EBF0`.

**Surfaces** — `paper #FFFFFF`, `paper-tint #F7F8FB`, `paper-warm #FDFBF6`.

### 1.4 Couleurs d'état

Absentes de la charte d'identité, produites ici. Elles ne sont **jamais** le seul
véhicule d'une information (§18.3) : un état est toujours doublé d'un libellé ou
d'une forme.

| Jeton            | Valeur    | Usage                                    |
| ---------------- | --------- | ---------------------------------------- |
| `state-success`  | `#0F7A4D` | Confirmation, dossier complet             |
| `state-warning`  | `#A15C00` | Complément demandé, échéance proche       |
| `state-danger`   | `#A01223` | Erreur de saisie, rejet                   |
| `state-info`     | `#00168E` | Information neutre — le bleu institutionnel |

### 1.5 Règles de contraste — non négociables

Objectif **WCAG 2.2 AA**. Trois règles suffisent à s'y tenir :

1. **L'or ne porte jamais de texte blanc.** `gold-300` + blanc = 2,2:1.
   `gold-300` + `ink-800` = **11,2:1**. Tous les boutons or portent du bleu.
2. **`graphite-400` n'est pas une couleur de texte.** Sur blanc : 3,25:1. Il est
   réservé aux icônes décoratives et aux bordures. Le texte secondaire est en
   `graphite-500` (4,96:1), les micro-libellés de 11 px en `graphite-600` (7,34:1).
3. **L'or en texte sur fond clair, c'est `gold-700`** (5,52:1) — jamais `gold-400`
   (1,8:1). Sur fond sombre, `gold-400` convient (10,5:1 sur `ink-900`).

Contrastes de référence : `ink-700` sur blanc **14,0:1** · `ink-800` sur blanc
**17,1:1** · `graphite-500` sur blanc **4,96:1** · `ink-100` sur `ink-900`
**15,8:1**.

---

## 2. Typographie

| Rôle          | Fonte              | Pourquoi                                                                                     |
| ------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| Titres, chiffres | **Fraunces**    | Serif variable dont l'axe `SOFT` arrondit les empattements — le pont entre le « FOANI » gravé du logo et une lettre contemporaine. |
| Texte, interface | **Plus Jakarta Sans** | Grotesque humaniste aux terminaisons légèrement adoucies, lisible à 14 px sur un téléphone d'entrée de gamme. |

Réglage des titres : `font-variation-settings: 'SOFT' 28, 'WONK' 1`, graisse 600,
interlettrage `-0.015em`, `text-wrap: balance`.

Les deux fontes sont **auto-hébergées**, sous-ensemble latin, `display: swap`.
Aucune requête vers un tiers.

### Échelle

| Usage                       | Taille                                    |
| --------------------------- | ----------------------------------------- |
| Titre de hero               | `2.05rem` → `3.4rem` selon la largeur      |
| Titre de page (`h1`)        | `2.25rem` → `3.5rem`                       |
| Titre de section (`h2`)     | `2rem` → `3rem`                            |
| Titre de bloc (`h3`)        | `1.125rem` – `1.5rem`                      |
| Texte courant               | `0.9375rem` – `1.0625rem`                  |
| Texte secondaire            | `0.875rem`                                 |
| Micro-libellé               | `0.6875rem`, capitales, `tracking 0.16em`  |

Les tailles du hero sont calées sur la ligne la plus longue — « Université 100 % »
mesure 9,75 em dans cette fonte — de sorte que la coupure en deux lignes tienne à
chaque palier, y compris à 360 px.

---

## 3. Formes

### Rayons — registre volontairement court

| Jeton          | Valeur    | Usage                                  |
| -------------- | --------- | -------------------------------------- |
| `radius-pill`  | `9999px`  | Boutons, pastilles, badges, champs      |
| `radius-card`  | `1.25rem` | Blocs internes                          |
| `radius-card-lg` | `1.75rem` | Cartes, panneaux, sections              |
| `radius-media` | `2rem`    | Images et emplacements photographiques  |

Rien entre les deux : la marque n'a pas de coin timide.

### Élévation — teintée de bleu, jamais de noir neutre

| Jeton     | Usage                                    |
| --------- | ---------------------------------------- |
| `shadow-raise` | Cartes au repos, champs                |
| `shadow-lift`  | Survol, en-tête au défilement           |
| `shadow-float` | Panneaux de navigation, carte du hero    |

---

## 4. Boutons

| Variante  | Fond           | Texte      | Usage                                       |
| --------- | -------------- | ---------- | ------------------------------------------- |
| `gold`    | `gold-300`     | `ink-800`  | Action principale : « Candidater »           |
| `ink`     | `ink-800`      | blanc      | Action principale sur fond clair             |
| `outline` | blanc, bord `graphite-200` | `ink-800` | Action secondaire                 |
| `ghost`   | transparent    | `ink-800`  | Action tertiaire                             |
| `onDark`  | `paper/5`, bord `paper/30` | blanc | Action sur fond bleu                    |

Hauteurs : `sm` 40 px · `md` 48 px · `lg` 56 px. Toutes au-dessus de la cible
tactile minimale.

L'icône de droite avance de 3 px au survol — un seul geste, partout.

---

## 5. Champs de formulaire

- Hauteur 52 px, rayon pilule, fond `paper-tint`, bordure `graphite-200`.
- Au focus : fond blanc, bordure `ink-300`, contour `3px solid ink-700` à 3 px.
- En erreur : bordure `state-danger`, message en dessous, rattaché par
  `aria-describedby`, jamais uniquement rouge.
- Étiquette toujours visible, jamais remplacée par un texte d'aide.
- Consentement jamais pré-coché (§20.2).

---

## 6. Grille et espacements

**Le portail n'a pas de largeur maximale.** Les pages occupent l'écran ; ce qui
reste borné, c'est la longueur des lignes de texte, au niveau des blocs de
lecture et non de la mise en page. Une colonne de texte de 1600 px est
illisible ; une grille de cartes de 1600 px ne l'est pas.

- Gouttière unique : `clamp(1.25rem, 4vw, 4.5rem)`, appliquée par `Container`.
  Elle suit la largeur de l'écran au lieu de sauter par paliers.
- En-tête : gouttière plus courte, `clamp(0.75rem, 2vw, 2.5rem)`, pour que la
  carte flottante ne paraisse pas rétrécie sur un très grand écran.
- Colonnes de lecture : `max-w-3xl` (48rem) sur le bloc de texte lui-même. La
  largeur restante porte un sommaire ancré, une illustration ou un encart de
  contact — jamais du vide.
- Sections : `4.5rem` de respiration verticale, `7.5rem` au-delà de 1024 px.
- Grilles de cartes : 1 colonne, 2 à 640 px, 3 à 1024 px. Écart `1.25rem`.
- Conception à **360 px d'abord**, puis élargissement (§18.2).

Points de rupture : `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
La navigation complète apparaît à `lg`. Le hero passe en deux colonnes à `xl`
seulement : en dessous, le panneau photographique deviendrait plus haut que
large et rognerait le sujet par les côtés.

---

## 7. Mouvement

Une seule courbe pour tout le dispositif :
`--ease-arc: cubic-bezier(0.22, 1, 0.36, 1)`. C'est elle qui donne au mouvement
une signature reconnaissable au lieu d'un easing différent par composant.

| Geste                       | Durée   |
| --------------------------- | ------- |
| Survol, changement de couleur | 300 ms |
| Panneau, accordéon          | 400 ms  |
| Révélation au défilement     | 700 ms  |
| Tracé de l'arc du hero      | 1600 ms |

**Deux règles :**

1. `prefers-reduced-motion: reduce` désactive tout. Le script de révélation ne
   s'arme même pas.
2. **Le contenu ne dépend jamais du mouvement.** Le masquage de révélation est
   conditionné à un attribut posé par script ; sans script, tout s'affiche.

---

## 8. Signes de marque

Trois, dérivés de la couronne du logo, et trois seulement.

| Signe        | Composant       | Emploi                                                       |
| ------------ | --------------- | ------------------------------------------------------------ |
| La feuille   | `LeafSprig`     | Accent de titre, puce de liste, marqueur                      |
| L'arc        | `ArcClipDef` / `ArcTrace` | Découpe des médias, limite de section, doublé d'un trait d'or |
| L'étoile     | `StarMark`      | Marqueur de rubrique — usage parcimonieux                     |

La couronne entière (`LaurelWreath`) sert de filigrane à trois échelles, à une
opacité de 4 à 7 %.

Le **filet or** — 2 px, 40 px de long — ouvre chaque titre de section.

### Icônes

Grille 24, trait 1,6, extrémités et jonctions arrondies. L'arrondi n'est pas
décoratif : c'est ce qui raccorde les pictogrammes aux lettres du logo et aux
rayons de l'interface. Aucune icône pleine, aucune icône d'une autre famille.

---

## 9. Images et emplacements

- Formats AVIF et WebP, tailles calées sur les largeurs réellement rendues à
  partir de 360 px.
- Description alternative obligatoire sur toute image porteuse d'information.
- **Aucune image d'emprunt** (§9.3). Un emplacement en attente est traité comme
  une surface de marque : fond `ink-800`, couronne en filigrane, sujet annoncé.
- Tout texte posé sur une image porte un voile dégradé : le contraste ne doit pas
  dépendre de la luminosité de la photographie.

---

## 10. Tableaux

- Défilement horizontal propre au tableau, jamais à la page.
- En-têtes `th` avec `scope`, `caption` en lecture d'écran.
- Lignes alternées en `paper-tint`, séparateurs `graphite-100`.
- Une donnée absente s'affiche « Non publié à ce jour » en `graphite-500` — une
  case vide est une information, une case inventée est une faute.

---

## 11. Reprise sur les autres systèmes

Pour le portail d'admission, l'espace étudiant et le thème Moodle, reprendre
dans cet ordre :

1. Le bloc `@theme` de `src/app/globals.css` — c'est la source unique.
2. Les deux fontes et leurs réglages variables.
3. Les quatre rayons et les trois niveaux d'élévation.
4. Les cinq variantes de bouton et le style de champ.
5. La courbe `--ease-arc` et les quatre durées.
6. Les trois signes de marque, aux mêmes emplois.

Un étudiant qui passe du site au portail puis à Moodle doit percevoir qu'il
reste chez FITC (§7.2).
