import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StarMark } from '@/components/brand/marks';
import { CadreAcces } from '@/components/candidat/acces';
import { ETAPES_CANDIDATURE } from '@/content/institution';
import { candidatConnecte } from '@/lib/candidat';
import { FormulaireConnexionCandidat } from '../formulaires';

export const metadata: Metadata = {
  title: 'Me connecter',
  robots: { index: false, follow: false },
};

export default async function PageConnexionCandidat() {
  if (await candidatConnecte()) redirect('/mon-dossier');

  return (
    <CadreAcces
      surtitre="Candidature — rentrée 2026"
      titre="Retrouver mon dossier"
      chapo="Connectez-vous avec le numéro de téléphone que vous avez utilisé pour créer votre compte."
      formulaire={<FormulaireConnexionCandidat />}
      pied={
        <>
          Vous n’avez pas encore de compte&nbsp;?{' '}
          <Link href="/mon-dossier/creer-compte" className="font-semibold text-ink-700 hover:text-ink-600">
            En créer un
          </Link>
          .
          <br />
          Mot de passe oublié&nbsp;?{' '}
          <Link href="/contact?sujet=candidature" className="font-semibold text-ink-700 hover:text-ink-600">
            Écrivez au service des admissions
          </Link>{' '}
          en indiquant votre numéro de dossier.
        </>
      }
      argumentaire={
        <>
          <h2 className="text-[2rem] leading-[1.1] lg:text-[2.75rem]">
            Reprenez là où vous vous étiez arrêté.
          </h2>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-graphite-600">
            Votre dossier est enregistré à chaque étape. Rien de ce que vous avez saisi n’est perdu,
            même si le réseau a coupé.
          </p>

          <ol className="mt-8 flex flex-col gap-3">
            {ETAPES_CANDIDATURE.map((etape, index) => (
              <li key={etape.titre} className="flex items-start gap-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-graphite-200 bg-paper/80 font-display text-[0.8125rem] text-ink-700">
                  {index + 1}
                </span>
                <span className="pt-1">
                  <span className="block text-[0.9375rem] font-semibold text-ink-800">
                    {etape.titre}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-graphite-500">
                    {etape.corps}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-8 inline-flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.14em] text-ink-700 uppercase">
            <StarMark className="h-2.5 w-2.5 text-gold-400" />
            Rentrée du 5 octobre 2026
          </p>
        </>
      }
    />
  );
}
