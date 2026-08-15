'use client';

import { useState } from 'react';
import { IconCheck, IconInfo } from '@/components/brand/icons';
import { ClicheIdentite } from '@/components/candidat/cliche-identite';
import type { Cliche } from '@/app/(candidat)/mon-dossier/(coque)/inscription/actions';

/* ==========================================================================
   Le consentement au contrôle automatique — loi n° 2013-450
   --------------------------------------------------------------------------
   Comparer deux visages est un traitement de données biométriques. Il suppose
   un consentement libre, explicite et éclairé — et distinct de celui portant
   sur l'impression de la photographie, qui n'est pas le même traitement.

   D'où trois choses, qui ne sont pas des formalités.

   1. La case est vide au départ, et rien ne se dépose tant qu'elle ne l'est
      pas. Une case pré-cochée n'est pas un consentement ; un consentement
      qu'on donne sans le savoir non plus.
   2. Ce qui est fait est écrit avant la case, en clair, et non renvoyé à une
      politique de confidentialité. Le candidat doit savoir que son visage sera
      comparé, à quoi, par qui, et ce qu'il en reste.
   3. Le refus est possible et sans conséquence sur l'inscription : le contrôle
      revient alors entièrement à l'agent, comme avant. Un consentement qu'on
      ne peut pas refuser n'en est pas un — et le §5.5 pose de toute façon que
      « le parcours en ligne ne doit exclure personne ».
   ========================================================================== */

const CLICHES: readonly {
  readonly cliche: Cliche;
  readonly champ: string;
  readonly titre: string;
  readonly consigne: string;
}[] = [
  {
    cliche: 'recto',
    champ: 'pieceRecto',
    titre: 'Le recto de votre pièce',
    consigne:
      'Posez la pièce à plat sur un fond uni, sans reflet, et cadrez-la de près. Les quatre coins doivent être visibles.',
  },
  {
    cliche: 'verso',
    champ: 'pieceVerso',
    titre: 'Le verso de votre pièce',
    consigne:
      'Retournez la pièce et reprenez de la même façon. Même si le verso vous paraît vide, il porte des mentions utiles.',
  },
  {
    cliche: 'selfie',
    champ: 'pieceSelfie',
    titre: 'Vous, tenant votre pièce',
    consigne:
      'Tenez la pièce près de votre visage, face à l’appareil. Votre visage et la pièce doivent être nets tous les deux.',
  },
];

export function ZoneIdentite({
  adresses,
  ouvert,
  biometrie,
  dejaConsenti,
}: {
  adresses: Readonly<Record<string, string | null>>;
  ouvert: boolean;
  /** Un service de reconnaissance est configuré. */
  biometrie: boolean;
  /** Le consentement a déjà été donné, lors d'un dépôt précédent. */
  dejaConsenti: boolean;
}) {
  const [consent, setConsent] = useState(dejaConsenti);

  const demandeConsentement = biometrie && !dejaConsenti;
  const depotOuvert = ouvert && (!demandeConsentement || consent);

  return (
    <div className="flex flex-col gap-5">
      {demandeConsentement ? (
        <section className="carte overflow-hidden">
          <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
            <h2 className="text-[1.0625rem] leading-snug">
              Votre accord pour la vérification automatique
            </h2>
          </header>
          <div className="p-5 sm:p-6">
            <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
              Pour vérifier que la pièce que vous déposez est bien la vôtre, le dispositif compare
              le visage de votre photographie d’identité à celui figurant sur votre pièce, puis à
              celui de la photographie où vous la tenez. Il lit également le texte de la pièce pour
              le rapprocher de ce que vous avez déclaré.
            </p>

            <ul className="mt-4 flex flex-col gap-2">
              {[
                'Les comparaisons sont faites au moment du dépôt, puis oubliées : seul leur résultat est conservé.',
                'Aucune empreinte de votre visage n’est enregistrée, ni ici ni ailleurs.',
                'Le résultat ne décide pas de votre inscription : il éclaire l’agent qui procède au contrôle visuel.',
              ].map((ligne) => (
                <li
                  key={ligne}
                  className="flex items-start gap-2.5 text-[0.875rem] leading-snug text-graphite-600"
                >
                  <IconCheck
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-state-success"
                  />
                  {ligne}
                </li>
              ))}
            </ul>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-graphite-200 bg-paper-tint p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(evenement) => setConsent(evenement.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-graphite-300 accent-ink-700"
              />
              <span className="text-[0.875rem] leading-relaxed text-ink-800">
                J’accepte que mon visage soit comparé automatiquement à celui figurant sur ma pièce
                d’identité, pour la seule vérification de mon identité.
              </span>
            </label>

            <p className="mt-3 flex gap-2.5 text-[0.8125rem] leading-relaxed text-graphite-500">
              <IconInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Vous pouvez refuser&nbsp;: votre inscription suit alors le même cours, et la
              vérification est faite entièrement par un agent. Dites-le au service de la scolarité,
              qui déposera vos pièces pour votre compte.
            </p>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {CLICHES.map((item) => (
          <ClicheIdentite
            key={item.cliche}
            cliche={item.cliche}
            titre={item.titre}
            consigne={item.consigne}
            deja={adresses[item.champ] ?? null}
            ouvert={depotOuvert}
            consentementRequis={demandeConsentement}
          />
        ))}
      </div>

      {demandeConsentement && !consent ? (
        <p className="text-[0.8125rem] text-graphite-500">
          Le dépôt s’ouvrira dès que vous aurez donné votre accord ci-dessus.
        </p>
      ) : null}
    </div>
  );
}
