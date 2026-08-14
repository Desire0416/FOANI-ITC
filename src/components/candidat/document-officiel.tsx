import Link from 'next/link';
import { ETABLISSEMENT, CONTACT } from '@/content/site';

/** Le domaine réellement servi : c'est lui qu'on imprime sur le document. */
const ADRESSE_VERIFICATION = `${(process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.foani-itc.ci').replace(/^https?:\/\//, '').replace(/\/$/, '')}/verifier`;

/* ==========================================================================
   L'habillage d'un document délivré — Note complémentaire §5.2
   --------------------------------------------------------------------------
   « Numéroté, à en-tête de l'établissement, portant un code de vérification
   renvoyant à une page publique. »

   Cet habillage sert la lettre d'admission aujourd'hui, le certificat de
   scolarité, la carte étudiant et le reçu demain. Il est écrit pour deux
   destins : l'écran d'un téléphone, et une feuille A4 imprimée ou enregistrée
   en PDF depuis le navigateur. D'où la mise en page en centimètres et les
   règles d'impression qui effacent la barre d'outils.

   Aucune bibliothèque de génération de PDF n'est employée. « Enregistrer en
   PDF » est une fonction que tout navigateur, y compris sur téléphone, sait
   faire ; y ajouter une dépendance serveur alourdirait le déploiement sans
   rien apporter au titulaire du document.
   ========================================================================== */

export function DocumentOfficiel({
  titre,
  numero,
  code,
  delivreLe,
  retour,
  children,
}: {
  titre: string;
  numero: string;
  code: string;
  delivreLe: string;
  retour: string;
  children: React.ReactNode;
}) {
  const date = new Date(delivreLe).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-dvh bg-graphite-100 py-0 print:bg-white print:py-0 sm:py-8">
      {/* Barre d'outils — à l'écran seulement. */}
      <div className="mx-auto flex w-full max-w-[21cm] flex-wrap items-center justify-between gap-3 px-5 py-4 print:hidden">
        <Link href={retour} className="text-[0.875rem] font-semibold text-ink-700 hover:underline">
          ← Retour à mon dossier
        </Link>
        <ImprimerCeDocument />
      </div>

      <article className="mx-auto w-full max-w-[21cm] bg-paper px-6 py-10 shadow-[0_1px_3px_rgba(16,24,40,0.08)] print:max-w-none print:px-0 print:py-0 print:shadow-none sm:px-[2.2cm] sm:py-[2cm]">
        {/* --------------------------------------------------------- En-tête */}
        <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-ink-800 pb-5">
          <div className="min-w-0">
            <p className="font-display text-[1.25rem] leading-tight font-semibold text-ink-800">
              {ETABLISSEMENT.nom}
            </p>
            <p className="mt-1 text-[0.8125rem] text-graphite-600">
              {ETABLISSEMENT.positionnement} — {ETABLISSEMENT.ville}, {ETABLISSEMENT.pays}
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-graphite-600">
              {CONTACT.telephone.affichage} — {CONTACT.courriel.valeur}
            </p>
          </div>
          <div className="text-[0.8125rem] text-graphite-600 sm:text-right">
            <p className="font-semibold text-ink-800">N° {numero}</p>
            <p className="mt-0.5">{ETABLISSEMENT.ville}, le {date}</p>
          </div>
        </header>

        {/* ----------------------------------------------------------- Titre */}
        <h1 className="mt-9 text-center font-display text-[1.5rem] font-semibold tracking-tight text-ink-800 uppercase">
          {titre}
        </h1>

        <div className="mt-8 text-[0.9375rem] leading-[1.75] text-ink-800">{children}</div>

        {/* ----------------------------------------------------- Vérification */}
        <footer className="mt-10 border-t border-graphite-200 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[0.75rem] font-semibold tracking-[0.08em] text-graphite-500 uppercase">
                Code de vérification
              </p>
              <p className="mt-1 font-display text-[1.375rem] font-semibold tracking-[0.08em] text-ink-800 tabular-nums">
                {code}
              </p>
              <p className="mt-1.5 max-w-md text-[0.75rem] leading-relaxed text-graphite-600">
                L’authenticité de ce document se vérifie en saisissant ce code sur{' '}
                <span className="font-medium text-ink-800">{ADRESSE_VERIFICATION}</span>
                . La page indique la date de délivrance et la formation concernée, sans divulguer
                d’autre information.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.8125rem] text-graphite-600">Pour l’établissement,</p>
              <p className="mt-8 border-t border-graphite-300 pt-1.5 text-[0.8125rem] font-semibold text-ink-800">
                Le service des admissions
              </p>
            </div>
          </div>
        </footer>
      </article>

      <p className="mx-auto mt-4 max-w-[21cm] px-5 pb-8 text-[0.8125rem] text-graphite-500 print:hidden">
        Pour conserver ce document&nbsp;: touchez «&nbsp;Imprimer&nbsp;», puis choisissez
        «&nbsp;Enregistrer au format PDF&nbsp;». Il restera consultable ici à tout moment.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ImprimerCeDocument() {
  return (
    <>
      <button type="button" className="bouton bouton--principal h-11 px-5" data-imprimer>
        Imprimer ou enregistrer en PDF
      </button>
      {/* L'impression est une fonction du navigateur : deux lignes suffisent,
          et n'exigent pas de faire de la page entière un composant client. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.querySelectorAll('[data-imprimer]').forEach(function(b){b.addEventListener('click',function(){window.print()})})",
        }}
      />
    </>
  );
}

/* --------------------------------------------------------------------------
   Un paragraphe de document, et une mention en deux colonnes.
   -------------------------------------------------------------------------- */

export function Paragraphe({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 first:mt-0">{children}</p>;
}

export function Mentions({
  lignes,
}: {
  lignes: readonly { readonly cle: string; readonly valeur: string }[];
}) {
  return (
    <dl className="mt-6 rounded-lg border border-graphite-200 bg-paper-tint px-5 py-4 print:bg-transparent">
      {lignes.map((ligne) => (
        <div
          key={ligne.cle}
          className="flex flex-wrap gap-x-4 gap-y-0.5 border-b border-graphite-100 py-2.5 last:border-0"
        >
          <dt className="w-full text-[0.8125rem] font-semibold text-graphite-600 sm:w-56 sm:shrink-0">
            {ligne.cle}
          </dt>
          <dd className="min-w-0 flex-1 text-[0.9375rem] text-ink-800">{ligne.valeur}</dd>
        </div>
      ))}
    </dl>
  );
}
