import Link from 'next/link';
import { EnTete } from '@/components/candidat/entete';
import { sessionCandidat } from '@/lib/candidat';

/**
 * Coque des écrans authentifiés.
 *
 * La session est vérifiée ici, et de nouveau dans chaque page : une garde de
 * mise en page protège l'affichage, pas les données. Ce sont les pages et les
 * actions qui relisent le dossier et en vérifient la propriété.
 */
export default async function CoqueDossier({ children }: { children: React.ReactNode }) {
  const { candidat, dossier } = await sessionCandidat();

  return (
    <div className="flex min-h-dvh flex-col">
      <EnTete candidat={candidat} dossier={dossier} />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-graphite-100 bg-paper">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] text-graphite-500">
            <Link href="/admissions" className="transition-colors hover:text-ink-700">
              Comment s’inscrire
            </Link>
            <Link href="/contact" className="transition-colors hover:text-ink-700">
              Nous écrire
            </Link>
            <Link href="/confidentialite" className="transition-colors hover:text-ink-700">
              Vos données
            </Link>
            <Link href="/" className="transition-colors hover:text-ink-700">
              Site de l’école
            </Link>
          </nav>
          <p className="text-[0.75rem] text-graphite-400">
            Vos informations ne sont lues que par le service des admissions.
          </p>
        </div>
      </footer>
    </div>
  );
}
