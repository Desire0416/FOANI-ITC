# Contenus à fournir par l'établissement

État au 13 août 2026. Cette liste recense ce que le site attend pour être publié
en l'état, sans rien afficher d'invérifiable.

Elle n'est pas un inventaire de fonctionnalités manquantes : **tout est
construit et en ligne**. Ce sont les données que seule la direction de FITC peut
arrêter, et que le site refuse d'inventer.

Le champ `statut` de chaque contenu, dans `src/content/`, fait foi :

| Statut       | Signification                                                        |
| ------------ | -------------------------------------------------------------------- |
| `verifie`    | Établi par le CDC ou la documentation institutionnelle.               |
| `a-valider`  | Proposition rédactionnelle du prestataire, à relire et approuver.     |
| `a-fournir`  | Donnée absente. L'interface l'annonce explicitement au visiteur.      |

---

## 1. Bloquant pour la mise en ligne publique

Sans ces éléments, le site fonctionne mais reste en deçà de ce qu'un candidat
attend, ou expose l'établissement.

### 1.1 Coordonnées — `src/content/site.ts`, objet `CONTACT`

Toutes à `null`. Le pied de page et la page Contact renvoient vers le
formulaire ; aucun numéro n'est inventé.

- [ ] Adresse ou repère d'accès à Agnibilékrou
- [ ] Numéro de téléphone principal, et par service si distincts
- [ ] Numéro WhatsApp, si utilisé pour les admissions
- [ ] Adresse électronique générale
- [ ] Adresse électronique du service des admissions
- [ ] Adresse électronique du contact presse
- [ ] Horaires d'accueil

### 1.2 Conditions financières — `src/content/formations.ts`, champ `fraisXof`

`null` sur les trente formations. Le CDC est net sur ce point (§9.1) : *« un
candidat qui ne trouve pas le prix quitte le site »*. En attendant, chaque fiche
affiche un encart et un bouton « Demander les conditions ».

- [ ] Grille tarifaire par formation, niveau et année académique
- [ ] Échéancier de règlement
- [ ] Existence ou non d'un dispositif de bourses et de facilités de paiement
- [ ] Numéro officiel de paiement mobile pour les frais de dossier

Une fourchette ou un renvoi vers une demande d'information reste préférable au
silence.

### 1.3 Mentions légales — `src/app/mentions-legales/page.tsx`

- [ ] Forme juridique, numéro d'immatriculation, siège social
- [ ] Nom du directeur de la publication
- [ ] Raison sociale et coordonnées de l'hébergeur
- [ ] Identité du responsable de traitement des données personnelles
- [ ] Durées de conservation par catégorie de données (§20.2)

### 1.4 Réception des demandes — `.env.local`

- [ ] `PROSPECTS_WEBHOOK_URL` : destination des formulaires. Tant qu'elle est
      vide, les formulaires indiquent que la demande n'a **pas** été transmise.

---

## 2. Attendu avant la campagne de recrutement

### 2.1 Admissions — `src/app/admissions/page.tsx`

- [ ] Conditions d'admission détaillées par série de baccalauréat
- [ ] Liste exacte des pièces justificatives par cycle
- [ ] Capacités d'accueil par formation, si elles existent
- [ ] Date de clôture des candidatures
- [ ] Conditions d'admission par équivalence (BTS vers Licence)

### 2.2 Agréments et résultats — `src/content/institution.ts`

- [ ] Référence officielle de l'agrément couvrant le cycle Licence
- [ ] Référence de l'agrément au titre de la formation professionnelle
- [ ] Statut juridique et reconnaissance des diplômes
- [ ] Taux de réussite par promotion, filière et année (§8.3, datés et sourcés)

### 2.3 Équipe — `src/content/institution.ts`, `EQUIPE`

Six fiches structurées attendent leurs contenus. L'annuaire est publié avec les
postes seuls, sans nom inventé.

- [ ] Nom et fonction exacte de chaque responsable
- [ ] Discipline et domaines d'expertise
- [ ] Biographie courte (3 à 5 lignes)
- [ ] Portrait photographique
- [ ] Responsable pédagogique de chaque formation (champ `responsable`, `null`)

### 2.4 Mot de la direction — `MOT_DIRECTION`

Le texte est une proposition rédactionnelle.

- [ ] Relecture et validation du texte, ou réécriture
- [ ] Nom et fonction du signataire
- [ ] Portrait

---

## 3. Photographies — aucune n'est empruntée

Le §9.3 interdit tout élément visuel provenant d'un autre établissement. Les
emplacements sont donc traités comme des surfaces de marque, annoncent leur
sujet, et se remplacent par un `next/image` sans toucher à la mise en page.

Une seule photographie est en ligne : celle du hero, fournie.

- [ ] Vue d'ensemble du campus
- [ ] Salles de cours
- [ ] Laboratoire d'analyse
- [ ] Ateliers d'élevage
- [ ] Parcelles et unités de production
- [ ] Travaux pratiques sur le terrain
- [ ] Vie étudiante et associations
- [ ] Étudiants en stage en entreprise
- [ ] Rencontre entreprises sur le campus
- [ ] Portrait de la direction
- [ ] Une illustration par actualité
- [ ] Plan d'accès au campus
- [ ] Une photographie de travaux pratiques par formation, à terme

Accompagner chaque photographie d'une **autorisation écrite de droit à l'image**
pour les personnes identifiables (§20.2).

---

## 4. Rubriques structurées, en attente de contenu

### 4.1 Vie du campus — `CAMPUS_RUBRIQUES`

Quatre des six rubriques sont à `a-fournir` :

- [ ] Hébergement : capacité, conditions, tarifs
- [ ] Campus et infrastructures : inventaire détaillé
- [ ] Parcelles et unités de production : surfaces et spéculations
- [ ] Vie associative : associations et activités existantes
- [ ] Services étudiants effectivement en place — n'en annoncer aucun qui ne le soit pas

### 4.2 Carrières et alumni

- [ ] Premières offres de stage et d'emploi
- [ ] Témoignages d'anciens étudiants, avec accord écrit de publication
- [ ] Références et réalisations du cabinet, avec accord des organisations

### 4.3 International

- [ ] Accords signés et établissements partenaires
- [ ] Projets de coopération en cours
- [ ] Conditions d'accueil des étudiants internationaux

### 4.4 Presse

- [ ] Fichiers vectoriels du logo et du badge institutionnel
- [ ] Dossier institutionnel et communiqués
- [ ] Photographies autorisées à la diffusion

### 4.5 Recherche & Innovation — non publiée

Le drapeau `RECHERCHE_ACTIVE` (`src/content/site.ts`) est à `false`. La rubrique
n'apparaît ni dans la navigation, ni dans le plan du site, ni dans la recherche
interne. Le §8.8 y conditionne la publication à des contenus réels : *« une
rubrique Recherche vide produit l'effet inverse de celui recherché »*.

Pour l'activer, il faut au minimum :

- [ ] Axes de recherche identifiés
- [ ] Chercheurs nommés, avec fiche
- [ ] Projets, laboratoires ou unités
- [ ] Publications ou communications vérifiables

---

## 5. À relire — propositions rédactionnelles

Ces contenus sont écrits et en ligne. Ils rendent le site démontrable et servent
de base de travail, mais l'établissement reste propriétaire de sa parole.

- [ ] **30 fiches de formation** : objectifs, compétences, programme, débouchés
      et poursuites d'études. Les intitulés sont repris mot pour mot de
      l'Annexe A du CDC et n'ont pas été reformulés.
- [ ] **6 fiches techniques agricoles** : cacao, aviculture, pisciculture,
      anacarde, compostage, hévéa. Contenu technique à valider par un
      responsable pédagogique avant publication.
- [ ] **3 actualités** et 2 événements.
- [ ] **Valeurs, engagements et gouvernance**.
- [ ] **9 offres d'expertise** du cabinet.
- [ ] **8 questions fréquentes** d'admission.

---

## 6. Durées des formations courtes

`dureeMois` vaut `null` sur les 14 certificats et les 5 masterclass — l'Annexe A
du CDC ne les précise pas. Les fiches affichent « Durée à confirmer ».

- [ ] Durée de chaque certificat
- [ ] Durée de chaque masterclass
- [ ] Calendrier des sessions datées, avec lieu, capacité et tarif (§6.3)

Une formation courte n'existe en ligne qu'à travers ses sessions. Tant qu'aucune
session n'est programmée, la formation reste présentée et le visiteur peut
manifester son intérêt.

---

## Où modifier

| Contenu                          | Fichier                            |
| -------------------------------- | ---------------------------------- |
| Coordonnées, navigation, chiffres | `src/content/site.ts`              |
| Catalogue des formations          | `src/content/formations.ts`        |
| Équipe, actualités, expertise, FAQ | `src/content/institution.ts`       |
| Fiches techniques agricoles       | `src/content/ressources.ts`        |
| Adresses des services numériques  | `.env.local`                       |

Toute modification se répercute automatiquement sur les pages, la recherche
interne, le plan du site et les données structurées.
