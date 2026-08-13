import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarMark } from '@/components/brand/marks';

/* ==========================================================================
   Cadre des écrans d'accès — inscription et connexion
   --------------------------------------------------------------------------
   Même dessin que l'écran d'accès du back-office : la photographie de la cour
   de l'établissement occupe la page, un voile clair la ramène au second plan,
   et la carte blanche porte le formulaire. C'est la première image que le
   candidat garde de l'école ; elle est fournie par l'établissement, aucun
   visuel d'emprunt (§9.3).
   ========================================================================== */

export function CadreAcces({
  surtitre,
  titre,
  chapo,
  formulaire,
  pied,
  argumentaire,
}: {
  surtitre: string;
  titre: string;
  chapo: string;
  formulaire: ReactNode;
  pied: ReactNode;
  argumentaire: ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
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

      <header className="px-6 pt-7 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="inline-flex rounded-2xl bg-paper px-5 py-3.5 shadow-raise"
          aria-label="FOANI International Training College — site de l’école"
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

      <main className="flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          <div className="rounded-3xl border border-paper bg-paper p-7 shadow-float sm:p-9">
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.18em] text-ink-700 uppercase">
              <StarMark className="h-2.5 w-2.5 text-gold-400" />
              {surtitre}
            </p>
            <h1 className="mt-4 text-[1.625rem] leading-tight">{titre}</h1>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-graphite-500">{chapo}</p>

            <div className="mt-7">{formulaire}</div>

            <div className="mt-6 border-t border-graphite-100 pt-5 text-[0.8125rem] leading-relaxed text-graphite-500">
              {pied}
            </div>
          </div>

          <div className="max-w-xl">{argumentaire}</div>
        </div>
      </main>

      <footer className="flex flex-col gap-3 px-6 pb-7 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-graphite-500">
          <Link href="/" className="inline-block py-1 transition-colors hover:text-ink-700">
            Site de l’école
          </Link>
          <Link href="/formations" className="inline-block py-1 transition-colors hover:text-ink-700">
            Formations
          </Link>
          <Link href="/admissions" className="inline-block py-1 transition-colors hover:text-ink-700">
            Comment s’inscrire
          </Link>
          <Link href="/contact" className="inline-block py-1 transition-colors hover:text-ink-700">
            Nous écrire
          </Link>
          <Link href="/confidentialite" className="inline-block py-1 transition-colors hover:text-ink-700">
            Vos données
          </Link>
        </nav>
        <p className="text-[0.75rem] text-graphite-500">
          Rentrée du 5 octobre 2026 — Agnibilékrou, Côte d’Ivoire
        </p>
      </footer>
    </div>
  );
}
