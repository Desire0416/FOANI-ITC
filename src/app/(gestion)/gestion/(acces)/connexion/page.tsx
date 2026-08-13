import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  IconBriefcase,
  IconFile,
  IconGraduation,
  IconShield,
  IconUsers,
} from '@/components/brand/icons';
import { StarMark } from '@/components/brand/marks';
import { agentConnecte } from '@/lib/session';
import { FormulaireConnexion } from './formulaire';

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

/** Ce à quoi l'espace donne accès. Le §5.2 attribuant les droits par rôle,
 *  un agent doit savoir où il entre. */
const ACCES = [
  { icone: IconFile, texte: 'Instruire les candidatures, demander une pièce, décider.' },
  { icone: IconGraduation, texte: 'Tenir le référentiel unique des personnes et des dossiers.' },
  { icone: IconBriefcase, texte: 'Consulter les pièces justificatives, sous accès restreint.' },
  { icone: IconUsers, texte: 'Suivre les comptes créés depuis le portail public.' },
  { icone: IconShield, texte: 'Administrer les agents et leurs rôles.' },
];

/**
 * Écran d'accès.
 *
 * La photographie du campus occupe toute la page — elle est fournie par
 * l'établissement, aucun visuel d'emprunt (§9.3). Un voile clair la ramène au
 * second plan : le formulaire, posé en carte blanche, reste le point de
 * fixation, et le texte conserve son contraste quelle que soit la lumière de
 * la photo.
 */
export default async function PageConnexion() {
  if (await agentConnecte()) redirect('/gestion');

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      {/* ------------------------------------------------------ Arrière-plan */}
      <Image
        src="/images/campus-cour.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-paper/94 via-paper/88 to-ink-50/92"
      />

      {/* ------------------------------------------------------------- Logo */}
      <header className="px-6 pt-7 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="inline-flex rounded-2xl bg-paper px-5 py-3.5 shadow-raise"
          aria-label="FOANI International Training College — portail public"
        >
          <Image
            src="/brand/logo-horizontal.png"
            alt="FOANI International Training College"
            width={2172}
            height={724}
            sizes="240px"
            priority
            className="h-10 w-auto"
          />
        </Link>
      </header>

      {/* ------------------------------------------------------------ Corps */}
      <main className="flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          {/* ------------------------------------------------------- Carte */}
          <div className="rounded-3xl border border-paper bg-paper p-7 shadow-float sm:p-9">
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-ink-700">
              <StarMark className="h-2.5 w-2.5 text-gold-400" />
              Back-office
            </p>
            <h1 className="mt-4 text-[1.625rem] leading-tight">Connexion</h1>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-graphite-500">
              Avec le compte que l’administrateur du dispositif vous a attribué.
            </p>

            <div className="mt-7">
              <FormulaireConnexion />
            </div>

            <p className="mt-6 border-t border-graphite-100 pt-5 text-[0.8125rem] leading-relaxed text-graphite-500">
              Accès perdu&nbsp;? L’administrateur du dispositif peut réinitialiser votre compte depuis
              l’espace Agents.
            </p>
          </div>

          {/* -------------------------------------------------------- Texte */}
          <div className="max-w-xl">
            <h2 className="text-[2rem] leading-[1.1] lg:text-[2.75rem]">
              Le dispositif administratif de FITC.
            </h2>
            <p className="mt-3 text-[1.0625rem] font-semibold text-ink-700">
              Ce que cet espace vous permet
            </p>

            <ul className="mt-7 flex flex-col gap-4">
              {ACCES.map((ligne) => {
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

            <p className="mt-8 border-l-2 border-gold-400 pl-4 font-display text-[1.0625rem] italic leading-snug text-ink-800">
              Cultiver la terre, c’est semer l’avenir.
            </p>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- Pied */}
      <footer className="flex flex-col gap-3 px-6 pb-7 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-graphite-500">
          <Link href="/" className="inline-block py-1 transition-colors hover:text-ink-700">
            Portail public
          </Link>
          <Link href="/admissions" className="inline-block py-1 transition-colors hover:text-ink-700">
            Admissions
          </Link>
          <Link href="/contact" className="inline-block py-1 transition-colors hover:text-ink-700">
            Contact
          </Link>
          <Link href="/confidentialite" className="inline-block py-1 transition-colors hover:text-ink-700">
            Confidentialité
          </Link>
        </nav>
        <p className="text-[0.75rem] text-graphite-500">
          Accès réservé aux agents de l’établissement — Agnibilékrou, Côte d’Ivoire
        </p>
      </footer>
    </div>
  );
}
