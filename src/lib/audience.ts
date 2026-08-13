/* ==========================================================================
   Mesure d'audience — CDC §19.1 et §20.2
   --------------------------------------------------------------------------
   Deux exigences se croisent ici :

   §19.1 demande un outil de mesure d'audience installé et configuré ;
   §20.2 demande que le refus soit aussi accessible que l'acceptation, et
   qu'aucun traceur non essentiel ne soit déposé avant accord.

   Le dispositif les concilie en distinguant deux familles d'outils :

   — les outils *sans traceur* (Plausible, Umami) ne déposent rien sur
     l'appareil et n'identifient personne. Ils se chargent immédiatement,
     et le bandeau n'a pas lieu d'être : demander un consentement qu'aucune
     règle n'exige, c'est fatiguer le visiteur pour rien ;
   — les outils *avec traceur* (Matomo en mode cookie, Google Analytics) ne se
     chargent qu'après un accord explicite, et le refus est mémorisé.

   Rien n'est chargé tant que `NEXT_PUBLIC_AUDIENCE_OUTIL` n'est pas renseigné :
   le site fonctionne sans mesure, et n'appelle alors aucun domaine tiers.
   ========================================================================== */

export type OutilAudience = 'plausible' | 'umami' | 'matomo' | 'aucun';

export type Configuration = {
  readonly outil: OutilAudience;
  /** Domaine ou identifiant de site, selon l'outil. */
  readonly site: string | null;
  /** Adresse du script. Toujours auto-hébergeable. */
  readonly script: string | null;
  /** Vrai si l'outil dépose un traceur : le consentement devient obligatoire. */
  readonly avecTraceur: boolean;
};

/** Nom du témoin qui mémorise le choix du visiteur. */
export const TEMOIN_CONSENTEMENT = 'fitc-traceurs';

export function lireConfiguration(): Configuration {
  const outil = (process.env.NEXT_PUBLIC_AUDIENCE_OUTIL ?? 'aucun') as OutilAudience;
  const site = process.env.NEXT_PUBLIC_AUDIENCE_SITE ?? null;
  const script = process.env.NEXT_PUBLIC_AUDIENCE_SCRIPT ?? null;

  if (outil === 'aucun' || !site || !script) {
    return { outil: 'aucun', site: null, script: null, avecTraceur: false };
  }

  return { outil, site, script, avecTraceur: outil === 'matomo' };
}

/** Vrai lorsqu'un bandeau de consentement est juridiquement nécessaire. */
export function bandeauNecessaire(configuration: Configuration): boolean {
  return configuration.avecTraceur;
}
