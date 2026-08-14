import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

/* ==========================================================================
   Code à usage unique — Note complémentaire §5.1 et RG-49
   --------------------------------------------------------------------------
   « L'acceptation est confirmée par un code à usage unique envoyé sur son
   téléphone, et horodatée. »

   Le code remplace un geste que la présence physique rendait évident : la
   signature au guichet. Il doit donc en avoir la valeur, ce qui suppose trois
   choses — qu'il soit à usage unique, qu'il expire, et qu'on ne puisse pas le
   deviner par essais successifs.

   Il n'est jamais conservé en clair. Ce qui est enregistré est son empreinte ;
   la comparaison se fait à durée constante, pour ne rien révéler par le temps
   de réponse.

   Sur l'envoi : aucun service de messagerie n'est aujourd'hui branché. Le
   dispositif ne fait donc pas semblant — il refuse d'annoncer un envoi qui
   n'aurait pas lieu, et propose au candidat de passer par le service des
   admissions, qui peut accepter pour son compte (§5.5, mode assisté).
   ========================================================================== */

/** Six chiffres : assez long pour résister, assez court pour se recopier. */
const LONGUEUR = 6;

/** Dix minutes. Au-delà, le candidat en redemande un. */
export const MINUTES_VALIDITE = 10;

/** Au-delà, le code est brûlé : on en exige un nouveau. */
export const ESSAIS_MAXIMUM = 5;

export type CodeEmis = {
  readonly code: string;
  readonly empreinte: string;
  readonly expire: string;
};

/** Tire un code et rend son empreinte. Le code en clair ne survit pas ici. */
export function emettreCode(): CodeEmis {
  const code = String(randomInt(0, 10 ** LONGUEUR)).padStart(LONGUEUR, '0');
  const expire = new Date(Date.now() + MINUTES_VALIDITE * 60_000).toISOString();
  return { code, empreinte: empreinteDe(code), expire };
}

export function empreinteDe(code: string): string {
  return createHash('sha256').update(code.trim()).digest('hex');
}

export type VerificationCode =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string; readonly brule?: true };

/**
 * Vérifie un code saisi.
 *
 * Les trois refus disent la même chose au candidat — « ce code ne convient
 * pas » — mais l'appelant sait, lui, s'il doit en réémettre un.
 */
export function verifierCode(
  saisi: string,
  attendu: {
    readonly empreinte: string | null | undefined;
    readonly expire: string | null | undefined;
    readonly essais: number | null | undefined;
  },
): VerificationCode {
  if (!attendu.empreinte || !attendu.expire) {
    return { ok: false, message: 'Aucun code n’est en attente. Demandez-en un nouveau.' };
  }

  if (new Date(attendu.expire).getTime() < Date.now()) {
    return {
      ok: false,
      brule: true,
      message: `Ce code a dépassé ses ${MINUTES_VALIDITE} minutes de validité. Demandez-en un nouveau.`,
    };
  }

  if ((attendu.essais ?? 0) >= ESSAIS_MAXIMUM) {
    return {
      ok: false,
      brule: true,
      message: 'Trop d’essais sur ce code. Demandez-en un nouveau.',
    };
  }

  const a = Buffer.from(empreinteDe(saisi), 'hex');
  const b = Buffer.from(attendu.empreinte, 'hex');
  const concorde = a.length === b.length && timingSafeEqual(a, b);

  if (!concorde) {
    return { ok: false, message: 'Ce code ne correspond pas. Vérifiez les six chiffres.' };
  }

  return { ok: true };
}

/* --------------------------------------------------------------------------
   L'envoi
   -------------------------------------------------------------------------- */

export type Acheminement =
  | { readonly envoye: true; readonly par: string }
  | { readonly envoye: false; readonly raison: string; readonly codeVisible?: string };

/**
 * Achemine le code vers le candidat.
 *
 * Tant qu'aucun service de messagerie n'est configuré, la fonction le dit au
 * lieu de laisser croire à un envoi. Le §10.6 pose la même règle pour les
 * formulaires du site public : ne jamais afficher une confirmation qui n'a pas
 * eu lieu.
 *
 * `CODE_VISIBLE_EN_RECETTE` rend le code à l'écran pour éprouver le parcours
 * sans opérateur. Cette variable ne doit jamais être posée en service : elle
 * afficherait à quiconque le code qui engage le signataire.
 */
export async function acheminerCode(
  code: string,
  destinataire: string | null,
): Promise<Acheminement> {
  const passerelle = process.env.SMS_WEBHOOK_URL;

  if (passerelle && destinataire) {
    try {
      const reponse = await fetch(passerelle, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ destinataire, message: `FOANI-ITC — votre code : ${code}` }),
        cache: 'no-store',
      });
      if (reponse.ok) return { envoye: true, par: destinataire };
    } catch {
      // On retombe sur le refus explicite ci-dessous.
    }
  }

  return {
    envoye: false,
    raison:
      'Aucun service d’envoi de messages n’est configuré : le code ne peut pas vous être transmis.',
    ...(process.env.CODE_VISIBLE_EN_RECETTE === '1' ? { codeVisible: code } : {}),
  };
}
