import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { ETABLISSEMENT } from '@/content/site';
import { exigerDossier } from '@/lib/candidat';
import { formatDate } from '@/lib/etats';
import { codeQR } from '@/payload/code-qr';
import { delivrerDocument, documentsDelivrables } from '@/payload/delivrance';

export const metadata: Metadata = { title: 'Ma carte étudiant' };

/* ==========================================================================
   La carte étudiant numérique — Note complémentaire §5.2
   --------------------------------------------------------------------------
   « Portant photographie, numéro étudiant, formation, niveau, année et code de
   vérification. Imprimable, présentable sur téléphone. La carte physique, si
   l'établissement en produit, est remise à la rentrée. »

   Deux destins, donc, et deux géométries. Sur téléphone, elle occupe l'écran
   et se montre à bout de bras : c'est là qu'elle sert le plus souvent, à
   l'entrée d'une salle ou d'un campus. Imprimée, elle tient au format d'une
   carte bancaire — 85,6 sur 54 millimètres —, ce qui permet de la découper et
   de la glisser dans un portefeuille.

   Elle ne porte aucune donnée de santé, et notamment pas le groupe sanguin,
   qu'on trouve encore sur beaucoup de cartes d'étudiant. Il est présenté comme
   utile en cas d'accident, il est médicalement inexploitable sans contrôle, et
   il est juridiquement une donnée de santé. Il n'a rien à faire là.
   ========================================================================== */

export default async function CarteEtudiant() {
  const { dossier } = await exigerDossier();
  if (!documentsDelivrables(dossier)) redirect('/mon-dossier');

  const payload = await getPayload({ config });
  const carte = await delivrerDocument(payload, 'carte-etudiant', dossier);
  const porte = carte.donnees;
  const mentions = porte.mentions ?? {};
  const qr = await codeQR(carte.code);

  const photo = (dossier as unknown as { photo?: { url?: string | null } | null }).photo;
  const portrait = typeof photo === 'object' && photo ? (photo.url ?? null) : null;

  return (
    <div className="min-h-dvh bg-graphite-100 print:bg-white">
      <div className="mx-auto flex w-full max-w-[21cm] flex-wrap items-center justify-between gap-3 px-5 py-4 print:hidden">
        <Link
          href="/mon-dossier/documents"
          className="text-[0.875rem] font-semibold text-ink-700 hover:underline"
        >
          ← Retour à mes documents
        </Link>
        <button type="button" className="bouton bouton--principal h-11 px-5" data-imprimer>
          Imprimer ou enregistrer en PDF
        </button>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.querySelectorAll('[data-imprimer]').forEach(function(b){b.addEventListener('click',function(){window.print()})})",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-[21cm] px-5 pb-10">
        {/* La carte elle-même : ratio 85,6 × 54, comme une carte bancaire. */}
        <div className="acte mx-auto w-full max-w-[26rem] overflow-hidden rounded-2xl bg-ink-800 text-paper shadow-lift print:rounded-none print:shadow-none">
          <div className="flex items-center gap-3 border-b border-paper/15 px-4 py-3">
            <Image
              src="/brand/logo-horizontal.png"
              alt=""
              width={2172}
              height={724}
              sizes="120px"
              className="h-7 w-auto brightness-0 invert"
            />
            <p className="ml-auto text-[0.5625rem] font-bold tracking-[0.16em] text-gold-400 uppercase">
              Carte étudiant
            </p>
          </div>

          <div className="flex gap-4 p-4">
            <div className="w-[5.5rem] shrink-0 overflow-hidden rounded-lg bg-paper/10">
              <div style={{ paddingTop: `${(45 / 35) * 100}%`, position: 'relative' }}>
                {portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portrait}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[0.625rem] text-paper/50">
                    Sans photo
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {/* La police se réduit plutôt que de couper : deux à cinq prénoms
                  sont courants, et un nom tronqué sur une carte est un nom faux. */}
              <p className="font-display text-[1.0625rem] leading-tight font-semibold break-words">
                {porte.titulaire}
              </p>
              <p className="mt-2 font-display text-[1.125rem] leading-none text-gold-400 tabular-nums">
                {mentions.numeroEtudiant ?? '—'}
              </p>
              <dl className="mt-2.5 flex flex-col gap-0.5 text-[0.625rem] leading-snug text-paper/80">
                <div>
                  <dt className="inline text-paper/55">Formation&nbsp;: </dt>
                  <dd className="inline">{porte.formation ?? '—'}</dd>
                </div>
                <div>
                  <dt className="inline text-paper/55">Niveau&nbsp;: </dt>
                  <dd className="inline">{porte.niveau ?? '—'}</dd>
                </div>
                <div>
                  <dt className="inline text-paper/55">Année&nbsp;: </dt>
                  <dd className="inline">{mentions.anneeEntree ?? '—'}</dd>
                </div>
                <div>
                  <dt className="inline text-paper/55">Né(e) le&nbsp;: </dt>
                  <dd className="inline">
                    {mentions.dateNaissance ? formatDate(mentions.dateNaissance) : '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <div
              aria-hidden="true"
              className="h-16 w-16 shrink-0 self-end overflow-hidden rounded bg-paper p-1 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-paper/15 px-4 py-2 text-[0.5625rem] text-paper/70">
            <span>{ETABLISSEMENT.ville}, {ETABLISSEMENT.pays}</span>
            <span className="font-display tracking-[0.08em] text-gold-400">{carte.code}</span>
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-[26rem] text-center text-[0.8125rem] leading-relaxed text-graphite-500 print:hidden">
          Présentez cette carte sur votre téléphone, ou imprimez-la et découpez-la : elle est au
          format d’une carte bancaire. Son authenticité se vérifie en visant le motif, ou en
          saisissant le code {carte.code} sur la page de vérification.
        </p>

        <p className="mx-auto mt-2 max-w-[26rem] text-center text-[0.75rem] text-graphite-400 print:hidden">
          N° {carte.numero} — délivrée le {formatDate(carte.delivreLe)}
        </p>
      </div>
    </div>
  );
}
