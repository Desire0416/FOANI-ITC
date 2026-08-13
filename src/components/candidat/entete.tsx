import Image from 'next/image';
import Link from 'next/link';
import { fermerSession } from '@/app/(candidat)/mon-dossier/actions';
import { IconFile } from '@/components/brand/icons';
import { CLASSES_PASTILLE, etat as lireEtat } from '@/lib/etats';
import type { Candidat } from '@/lib/candidat';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   En-tête du portail
   --------------------------------------------------------------------------
   Trois informations, pas une de plus : de qui il s'agit, quel est son numéro
   de dossier, et où en est ce dossier. Le numéro est mis en évidence parce
   que c'est lui que le candidat devra citer au téléphone ou au guichet
   (§10.4).
   ========================================================================== */

export function EnTete({ candidat, dossier }: { candidat: Candidat; dossier: Candidature | null }) {
  const etat = dossier ? lireEtat(dossier.etat) : null;

  return (
    <header className="border-b border-graphite-100 bg-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-4 px-5 py-4 sm:px-8">
        <Link href="/" aria-label="FOANI International Training College — site public" className="shrink-0">
          <Image
            src="/brand/logo-horizontal.png"
            alt="FOANI International Training College"
            width={2172}
            height={724}
            sizes="200px"
            priority
            className="h-9 w-auto"
          />
        </Link>

        {dossier?.reference ? (
          <p className="flex items-center gap-2.5 rounded-xl border border-graphite-200 bg-paper-tint px-3.5 py-2">
            <IconFile aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-700" />
            <span className="text-[0.75rem] text-graphite-500">
              Dossier
              <span className="ml-1.5 font-display text-[0.9375rem] text-ink-800 tabular-nums">
                {dossier.reference}
              </span>
            </span>
          </p>
        ) : null}

        {etat ? (
          <p className={`pastille ${CLASSES_PASTILLE[etat.ton]}`}>
            <span className="pastille__point" aria-hidden="true" />
            {etat.libelle}
          </p>
        ) : null}

        <div className="ml-auto flex items-center gap-3">
          <p className="hidden text-[0.8125rem] text-graphite-500 sm:block">{candidat.identifiant}</p>
          <form action={fermerSession}>
            <button type="submit" className="bouton bouton--discret h-9 px-3 text-[0.8125rem]">
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
