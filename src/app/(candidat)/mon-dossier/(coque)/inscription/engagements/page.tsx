import type { Metadata } from 'next';
import { CadreInscription } from '@/components/candidat/cadre-inscription';
import { Signature } from '@/components/candidat/signature';
import { Alerte, Carte } from '@/components/candidat/ui';
import { REGLEMENTS, STATUT_REGLEMENTS, VERSION_REGLEMENTS } from '@/content/reglements';
import { exigerDossierInscription } from '@/lib/inscription-garde';
import { formatDate } from '@/lib/etats';

export const metadata: Metadata = { title: 'Vos engagements' };

/* ==========================================================================
   Étape 6 du parcours d'inscription — Note complémentaire §5.1
   --------------------------------------------------------------------------
   « Le candidat prend connaissance du règlement de scolarité et de
   l'engagement financier, comportant l'échéancier qui lui est applicable. Il
   signe électroniquement. »

   Les textes sont affichés en entier, sur la page, et non derrière un lien
   ou dans un cadre à défilement de trois lignes. Une signature n'a de valeur
   que si le signataire a pu lire ce qu'il signe, et un texte qu'on doit aller
   chercher n'est pas lu.

   L'échéancier n'y figure pas encore : l'établissement n'a publié aucune
   grille tarifaire. L'article correspondant dit ce qui est vrai — que les
   montants sont portés par l'appel de frais — plutôt que d'afficher un
   chiffre inventé dans un document que l'étudiant signe.
   ========================================================================== */

export default async function Engagements() {
  const { dossier } = await exigerDossierInscription();
  const d = dossier as unknown as Record<string, string | null>;

  const signeLe = d.engagementsSignesLe ?? null;
  const nomPropose =
    [d.nomActe?.toUpperCase(), d.prenomsActe].filter(Boolean).join(' ').trim() ||
    [dossier.nom?.toUpperCase(), dossier.prenoms].filter(Boolean).join(' ').trim();

  return (
    <CadreInscription
      dossier={dossier}
      etape="engagements"
      chapo="Les deux textes qui vous lient à l’établissement. Lisez-les entièrement : votre signature les rend opposables."
    >
      <div className="flex flex-col gap-6">
        {signeLe ? (
          <Alerte ton="reussite" titre="Vos engagements sont signés">
            Signés le {formatDate(signeLe, true)} par {d.engagementsSignataire ?? 'vous'}, sur la
            version {d.engagementsVersion ?? VERSION_REGLEMENTS} des textes. L’empreinte de votre
            signature est conservée&nbsp;: elle atteste que le texte n’a pas changé depuis.
          </Alerte>
        ) : null}

        {REGLEMENTS.map((document) => (
          <Carte key={document.cle} titre={document.titre} aide={document.chapo}>
            <div className="flex flex-col gap-5">
              {document.articles.map((article) => (
                <article key={article.titre}>
                  <h3 className="text-[0.9375rem] font-semibold text-ink-800">{article.titre}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-graphite-600">
                    {article.texte}
                  </p>
                </article>
              ))}
            </div>
          </Carte>
        ))}

        {signeLe ? null : (
          <Carte titre="Votre signature">
            <Signature nomPropose={nomPropose} provisoire={STATUT_REGLEMENTS !== 'valide'} />
          </Carte>
        )}

        {signeLe ? (
          <Carte titre="Ce qui est conservé">
            <dl className="flex flex-col gap-2.5 text-[0.9375rem]">
              <div className="flex flex-wrap justify-between gap-x-6 border-b border-graphite-100 pb-2.5">
                <dt className="text-graphite-500">Signataire</dt>
                <dd className="font-medium text-ink-800">{d.engagementsSignataire}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6 border-b border-graphite-100 pb-2.5">
                <dt className="text-graphite-500">Date et heure</dt>
                <dd className="font-medium text-ink-800">{formatDate(signeLe, true)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6 border-b border-graphite-100 pb-2.5">
                <dt className="text-graphite-500">Version des textes</dt>
                <dd className="font-medium text-ink-800">{d.engagementsVersion}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6">
                <dt className="text-graphite-500">Empreinte</dt>
                <dd className="font-display text-[0.8125rem] break-all text-ink-800">
                  {d.engagementsEmpreinte}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-graphite-500">
              Cette empreinte est calculée sur le texte intégral que vous avez lu, votre nom et
              l’horodatage. Elle changerait si l’un de ces éléments changeait&nbsp;: c’est ce qui
              rend votre signature vérifiable.
            </p>
          </Carte>
        ) : null}
      </div>
    </CadreInscription>
  );
}
