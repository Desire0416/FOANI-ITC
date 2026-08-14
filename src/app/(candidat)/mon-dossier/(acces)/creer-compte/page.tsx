import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { IconCheck, IconClock, IconFile, IconPhone, IconShield } from '@/components/brand/icons';
import { CadreAcces } from '@/components/candidat/acces';
import { candidatConnecte } from '@/lib/candidat';
import { FormulaireInscription } from '../formulaires';

export const metadata: Metadata = {
  title: 'Créer mon compte',
  robots: { index: false, follow: false },
};

/** Ce que le compte apporte, dit du point de vue du candidat. */
const AVANTAGES = [
  { icone: IconPhone, texte: 'Tout se fait depuis votre téléphone. Aucun déplacement à Agnibilékrou.' },
  { icone: IconClock, texte: 'Vous vous arrêtez quand vous voulez : votre dossier est enregistré à chaque étape.' },
  { icone: IconFile, texte: 'Vous photographiez vos documents : le site vérifie le format et allège les images.' },
  { icone: IconCheck, texte: 'Vous recevez un numéro de dossier, et vous suivez son avancement en ligne.' },
  { icone: IconShield, texte: 'Vos informations ne sont lues que par le service des admissions.' },
];

export default async function PageInscription() {
  if (await candidatConnecte()) redirect('/mon-dossier');

  return (
    <CadreAcces
      surtitre="Candidature — rentrée 2026"
      titre="Créer mon compte"
      chapo="Un numéro de téléphone et un mot de passe suffisent. Vous pourrez commencer votre dossier tout de suite."
      formulaire={<FormulaireInscription />}
      pied={
        <>
          Vous avez déjà un compte&nbsp;?{' '}
          <Link href="/mon-dossier/connexion" className="font-semibold text-ink-700 hover:text-ink-600">
            Connectez-vous
          </Link>
          .
        </>
      }
      argumentaire={
        <>
          <h2 className="text-[2rem] leading-[1.1] lg:text-[2.75rem]">
            Votre dossier tient dans votre téléphone.
          </h2>
          <p className="mt-3 text-[1.0625rem] font-semibold text-ink-700">
            Ce que vous pourrez faire ici
          </p>

          <ul className="mt-7 flex flex-col gap-4">
            {AVANTAGES.map((ligne) => {
              const Icone = ligne.icone;
              return (
                <li key={ligne.texte} className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-graphite-200 bg-paper/80">
                    <Icone className="h-[1.0625rem] w-[1.0625rem] text-ink-700" />
                  </span>
                  <span className="pt-1.5 text-[0.9375rem] leading-snug text-graphite-600">
                    {ligne.texte}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 border-l-2 border-gold-400 pl-4 font-display text-[1.0625rem] leading-snug text-ink-800 italic">
            Cultiver la terre, c’est semer l’avenir.
          </p>
        </>
      }
    />
  );
}
