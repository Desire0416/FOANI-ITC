import type { Fournisseur } from './fournisseur';
import { fournisseurLocal, localDisponible } from './local';
import { rekognition, rekognitionConfigure } from './rekognition';

/* ==========================================================================
   Les contrôles automatiques d'identité — Note complémentaire §5.1 et §5.4
   --------------------------------------------------------------------------
   TROIS CONTRÔLES, ET UNE DÉCISION.

   1. LE PORTRAIT contient-il un visage exploitable ? Un seul, net, éclairé,
      de face, les yeux ouverts, sans lunettes de soleil. C'est ce qui empêche
      qu'une photographie de mur, de paysage ou de groupe finisse sur une carte
      d'étudiant.

   2. LE PORTEUR est-il le titulaire ? Le visage du portrait est comparé à
      celui figurant sur la pièce d'identité, puis à celui de la photographie
      du porteur tenant sa pièce. Deux comparaisons, parce qu'elles ne disent
      pas la même chose : la première lie la photographie au document, la
      seconde lie une personne présente au document qu'elle tient.

   3. LA PIÈCE dit-elle ce que le candidat a déclaré ? Le texte du document est
      lu et rapproché du nom et du numéro saisis. C'est la « cohérence
      croisée » du §5.4, faite par le dispositif au lieu de reposer sur la
      mémoire de l'agent.

   LA DÉCISION, ET POURQUOI ELLE N'EST PAS BINAIRE.

   La note pose que « tout écart est signalé à l'agent, sans blocage
   automatique ». Prise à la lettre, cette règle laisse passer une photographie
   de mur — ce qui n'est pas un écart, c'est une absence de pièce. Prise à
   l'envers, un blocage systématique refuserait des candidats légitimes : une
   pièce d'identité de dix ans, une prise de vue en contre-jour, un changement
   de coiffure font chuter un score sans qu'il y ait fraude.

   D'où trois issues, et non deux :

   — REFUSÉ : ce qui est certainement inexploitable. Aucun visage, plusieurs
     visages sur un portrait, un score de similarité effondré. Le candidat
     reprend, immédiatement, en sachant quoi.
   — À VÉRIFIER : ce qui est douteux. Un score moyen, un nom qui ne se retrouve
     pas dans le texte lu. Le dossier passe, avec son signalement, et l'agent
     voit le chiffre.
   — CONFORME : ce qui concorde nettement. L'agent voit le chiffre aussi, et
     garde la main : le dispositif ne valide jamais à sa place.

   LES SEUILS sont des choix d'ingénierie, non une norme. Ils sont posés ici,
   nommés, et ajustables d'un seul endroit. Une similarité de 90 % sur une
   comparaison un contre un est un accord franc ; en dessous de 70 %, il n'y a
   plus d'accord du tout. L'intervalle entre les deux est précisément la zone
   où un humain doit regarder.
   ========================================================================== */

export const SEUILS = {
  /** Au-dessus : concordance franche. */
  concordance: 90,
  /** En dessous : plus aucune concordance. Le dépôt est refusé. */
  discordance: 70,
  /** Confiance minimale pour tenir une zone détectée pour un visage. */
  visage: 90,
  /** Netteté minimale du visage sur le portrait, sur 100. */
  nettete: 25,
  /** Part minimale de l'image occupée par le visage d'un portrait. */
  surfacePortrait: 0.06,
  /** Rotation maximale tolérée sur un portrait, en degrés. */
  rotation: 25,
} as const;

export type Verdict = 'conforme' | 'a-verifier' | 'refuse' | 'indisponible';

export type Controle = {
  readonly cle: string;
  readonly libelle: string;
  readonly verdict: Verdict;
  readonly detail: string;
  /** Le chiffre qui fonde le verdict, quand il y en a un. */
  readonly score?: number;
};

export type Rapport = {
  readonly fournisseur: string | null;
  readonly faitLe: string;
  readonly controles: readonly Controle[];
  readonly verdict: Verdict;
};

/**
 * Le fournisseur en service.
 *
 * Le service distant l'emporte s'il est configuré : il lit en outre le texte
 * des pièces, ce que le moteur local ne fait pas. À défaut, le moteur local
 * prend le relais — et c'est le cas ordinaire, puisqu'il ne demande ni compte
 * ni configuration. Le dispositif n'est donc jamais muet par défaut.
 *
 * `null` ne subsiste que si l'établissement a explicitement éteint le moteur
 * local et n'a pas branché de service distant.
 */
export function fournisseur(): Fournisseur | null {
  if (rekognitionConfigure()) return rekognition;
  if (localDisponible()) return fournisseurLocal;
  return null;
}

export function biometrieActive(): boolean {
  return fournisseur() !== null;
}

/* --------------------------------------------------------------------------
   Rapprochement de texte
   -------------------------------------------------------------------------- */

/**
 * Réduit une chaîne à sa forme comparable.
 *
 * Les accents sautent, la casse aussi, les apostrophes et les tirets
 * également : une pièce d'identité imprime « N'GUESSAN » là où le candidat
 * saisit « N’Guessan », et les deux désignent la même personne. Ce repli sert
 * uniquement à comparer — la graphie saisie, elle, n'est jamais modifiée,
 * puisque c'est elle qui sera imprimée sur les documents.
 */
function replier(valeur: string): string {
  return valeur
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/** Un mot du nom déclaré se retrouve-t-il dans le texte lu sur la pièce ? */
function nomRetrouve(declare: string, lignes: readonly string[]): boolean {
  const texte = replier(lignes.join(' '));
  const mots = declare
    .split(/[\s-]+/)
    .map(replier)
    .filter((mot) => mot.length >= 3);

  if (mots.length === 0) return false;
  const trouves = mots.filter((mot) => texte.includes(mot));
  // La moitié des mots suffit : une pièce n'imprime pas toujours tous les
  // prénoms, et la lecture optique se trompe sur un caractère de temps à autre.
  return trouves.length >= Math.ceil(mots.length / 2);
}

/* --------------------------------------------------------------------------
   Les contrôles
   -------------------------------------------------------------------------- */

function verdictGlobal(controles: readonly Controle[]): Verdict {
  if (controles.some((controle) => controle.verdict === 'refuse')) return 'refuse';
  if (controles.some((controle) => controle.verdict === 'a-verifier')) return 'a-verifier';
  if (controles.every((controle) => controle.verdict === 'indisponible')) return 'indisponible';
  return 'conforme';
}

/**
 * Contrôle le portrait seul, au moment de son dépôt.
 *
 * C'est le contrôle le plus utile des trois, parce qu'il est le seul qui
 * s'exécute avant tout le reste : une photographie sans visage n'a pas à
 * franchir cette étape, et le candidat le sait dans la seconde.
 */
export async function controlerPortrait(
  image: Buffer,
  /* Injectable : c'est la couture par laquelle un second fournisseur entrera,
     et celle par laquelle la logique de décision se met à l'épreuve sans
     appeler un service payant. */
  service: Fournisseur | null = fournisseur(),
): Promise<Rapport> {
  const faitLe = new Date().toISOString();

  if (!service) {
    return {
      fournisseur: null,
      faitLe,
      verdict: 'indisponible',
      controles: [
        {
          cle: 'visage',
          libelle: 'Présence d’un visage',
          verdict: 'indisponible',
          detail: 'Aucun service de reconnaissance n’est configuré.',
        },
      ],
    };
  }

  const visages = (await service.detecterVisages(image)).filter(
    (visage) => visage.confiance >= SEUILS.visage,
  );

  const controles: Controle[] = [];

  if (visages.length === 0) {
    controles.push({
      cle: 'visage',
      libelle: 'Présence d’un visage',
      verdict: 'refuse',
      detail: 'Aucun visage n’est reconnu sur cette image. Reprenez la photographie de face.',
    });
  } else if (visages.length > 1) {
    controles.push({
      cle: 'visage',
      libelle: 'Présence d’un visage',
      verdict: 'refuse',
      detail: `${visages.length} visages sont reconnus. Une photographie d’identité ne montre que vous.`,
    });
  } else {
    const visage = visages[0]!;
    controles.push({
      cle: 'visage',
      libelle: 'Présence d’un visage',
      verdict: 'conforme',
      detail: 'Un visage unique est reconnu.',
      score: Math.round(visage.confiance),
    });

    if (visage.surface < SEUILS.surfacePortrait) {
      controles.push({
        cle: 'cadrage',
        libelle: 'Cadrage',
        verdict: 'refuse',
        detail: 'Votre visage est trop petit dans l’image. Rapprochez-vous de l’appareil.',
        score: Math.round(visage.surface * 100),
      });
    }

    if (visage.nettete < SEUILS.nettete) {
      controles.push({
        cle: 'nettete',
        libelle: 'Netteté du visage',
        verdict: 'refuse',
        detail: 'Le visage est flou. Tenez l’appareil stable et reprenez.',
        score: Math.round(visage.nettete),
      });
    }

    if (visage.lunettesSoleil === true) {
      controles.push({
        cle: 'lunettes',
        libelle: 'Lunettes de soleil',
        verdict: 'refuse',
        detail: 'Retirez vos lunettes de soleil : vos yeux doivent être visibles.',
      });
    }

    if (visage.yeuxOuverts === false) {
      controles.push({
        cle: 'yeux',
        libelle: 'Yeux ouverts',
        verdict: 'a-verifier',
        detail: 'Vos yeux paraissent fermés. Reprenez la photographie si c’est le cas.',
      });
    }

    const rotation = Math.max(
      Math.abs(visage.lacet ?? 0),
      Math.abs(visage.tangage ?? 0),
      Math.abs(visage.roulis ?? 0),
    );
    if (rotation > SEUILS.rotation) {
      controles.push({
        cle: 'pose',
        libelle: 'Position de la tête',
        verdict: 'a-verifier',
        detail: 'Votre tête est inclinée ou tournée. Regardez droit vers l’appareil.',
        score: Math.round(rotation),
      });
    }
  }

  return { fournisseur: service.nom, faitLe, controles, verdict: verdictGlobal(controles) };
}

/* -------------------------------------------------------------------------- */

export type PiecesAControler = {
  readonly portrait: Buffer | null;
  readonly recto: Buffer | null;
  readonly selfie: Buffer | null;
  readonly nomDeclare: string;
  readonly numeroDeclare: string;
};

/**
 * Contrôle l'ensemble : le porteur, la pièce, et ce qui est déclaré.
 *
 * Les trois clichés sont nécessaires. Tant qu'il en manque un, le rapport le
 * dit plutôt que de conclure sur une base incomplète — un contrôle qui rend
 * « conforme » alors qu'il n'a rien pu comparer est pire que pas de contrôle.
 */
export async function controlerIdentiteComplete(
  pieces: PiecesAControler,
  service: Fournisseur | null = fournisseur(),
): Promise<Rapport> {
  const faitLe = new Date().toISOString();

  if (!service) {
    return {
      fournisseur: null,
      faitLe,
      verdict: 'indisponible',
      controles: [
        {
          cle: 'service',
          libelle: 'Contrôle automatique',
          verdict: 'indisponible',
          detail:
            'Aucun service de reconnaissance n’est configuré. Le contrôle repose entièrement sur l’agent.',
        },
      ],
    };
  }

  const controles: Controle[] = [];

  /* ------------------------------------------ La photographie et la pièce */
  if (pieces.portrait && pieces.recto) {
    const { similarite } = await service.comparerVisages(pieces.portrait, pieces.recto);
    if (similarite === null) {
      controles.push({
        cle: 'portrait-piece',
        libelle: 'Votre photographie et celle de votre pièce',
        verdict: 'refuse',
        detail:
          'Aucun visage exploitable n’a été trouvé sur la pièce. Reprenez le recto de plus près, sans reflet.',
      });
    } else {
      controles.push({
        cle: 'portrait-piece',
        libelle: 'Votre photographie et celle de votre pièce',
        verdict:
          similarite >= SEUILS.concordance
            ? 'conforme'
            : similarite >= SEUILS.discordance
              ? 'a-verifier'
              : 'refuse',
        detail:
          similarite >= SEUILS.concordance
            ? 'Les deux visages concordent.'
            : similarite >= SEUILS.discordance
              ? 'La concordance est partielle. Une pièce ancienne peut l’expliquer ; un agent vérifiera.'
              : 'Les deux visages ne concordent pas. Vérifiez que la pièce déposée est bien la vôtre.',
        score: Math.round(similarite),
      });
    }
  } else {
    controles.push({
      cle: 'portrait-piece',
      libelle: 'Votre photographie et celle de votre pièce',
      verdict: 'indisponible',
      detail: 'Il manque votre photographie d’identité ou le recto de votre pièce.',
    });
  }

  /* ------------------------------------------------- Le porteur et la pièce */
  if (pieces.portrait && pieces.selfie) {
    const { similarite } = await service.comparerVisages(pieces.portrait, pieces.selfie);
    if (similarite === null) {
      controles.push({
        cle: 'porteur',
        libelle: 'Vous, tenant votre pièce',
        verdict: 'refuse',
        detail: 'Aucun visage n’est reconnu sur cette photographie. Reprenez-la de face.',
      });
    } else {
      controles.push({
        cle: 'porteur',
        libelle: 'Vous, tenant votre pièce',
        verdict:
          similarite >= SEUILS.concordance
            ? 'conforme'
            : similarite >= SEUILS.discordance
              ? 'a-verifier'
              : 'refuse',
        detail:
          similarite >= SEUILS.concordance
            ? 'C’est bien la même personne que sur votre photographie d’identité.'
            : similarite >= SEUILS.discordance
              ? 'La concordance est partielle. Un agent vérifiera.'
              : 'Cette photographie ne montre pas la même personne que votre photographie d’identité.',
        score: Math.round(similarite),
      });
    }
  } else {
    controles.push({
      cle: 'porteur',
      libelle: 'Vous, tenant votre pièce',
      verdict: 'indisponible',
      detail: 'Il manque votre photographie d’identité ou celle où vous tenez votre pièce.',
    });
  }

  /* ------------------------------------------------------ Ce qui est déclaré */
  if (pieces.recto) {
    if (!service.litLeTexte) {
      controles.push({
        cle: 'lecture',
        libelle: 'Lecture de la pièce',
        verdict: 'indisponible',
        detail:
          'Le texte de la pièce n’est pas lu automatiquement : un agent le rapprochera de vos déclarations.',
      });
      return { fournisseur: service.nom, faitLe, controles, verdict: verdictGlobal(controles) };
    }

    const lignes = await service.lireTexte(pieces.recto);

    if (lignes.length === 0) {
      controles.push({
        cle: 'lecture',
        libelle: 'Lecture de la pièce',
        verdict: 'a-verifier',
        detail: 'Aucun texte n’a pu être lu sur la pièce. Un agent la lira.',
      });
    } else {
      const nomOk = nomRetrouve(pieces.nomDeclare, lignes);
      controles.push({
        cle: 'nom',
        libelle: 'Nom déclaré et nom porté sur la pièce',
        verdict: nomOk ? 'conforme' : 'a-verifier',
        detail: nomOk
          ? 'Le nom déclaré se retrouve sur la pièce.'
          : 'Le nom déclaré ne se retrouve pas dans le texte lu. Vérifiez votre saisie ; un agent contrôlera.',
      });

      if (pieces.numeroDeclare) {
        const texte = replier(lignes.join(' '));
        const numeroOk = texte.includes(replier(pieces.numeroDeclare));
        controles.push({
          cle: 'numero',
          libelle: 'Numéro déclaré et numéro porté sur la pièce',
          verdict: numeroOk ? 'conforme' : 'a-verifier',
          detail: numeroOk
            ? 'Le numéro déclaré se retrouve sur la pièce.'
            : 'Le numéro déclaré ne se retrouve pas dans le texte lu. Vérifiez votre saisie ; un agent contrôlera.',
        });
      }
    }
  }

  return { fournisseur: service.nom, faitLe, controles, verdict: verdictGlobal(controles) };
}
