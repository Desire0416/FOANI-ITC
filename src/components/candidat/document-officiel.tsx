import Image from 'next/image';
import Link from 'next/link';
import { ETABLISSEMENT, CONTACT } from '@/content/site';
import { adresseVerification, codeQR } from '@/payload/code-qr';

/** Le domaine réellement servi : c'est lui qu'on imprime sur le document. */
const DOMAINE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.foani-itc.ci')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');

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

   Sur la composition : elle suit celle d'un acte administratif, pas celle
   d'une page web. Marque centrée, filet bicolore, titre souligné, tableau des
   mentions à lignes alternées, et un pied qui sépare nettement ce qui
   authentifie — le code et son motif — de ce qui engage : la signature du
   service. Ce n'est pas une coquetterie. Un document qui ne ressemble pas à un
   document n'est pas présenté à un guichet.
   ========================================================================== */

export async function DocumentOfficiel({
  titre,
  numero,
  code,
  delivreLe,
  destinataire,
  retour,
  children,
}: {
  titre: string;
  numero: string;
  code: string;
  delivreLe: string;
  destinataire?: string;
  retour: string;
  children: React.ReactNode;
}) {
  const date = new Date(delivreLe).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const qr = await codeQR(code);

  return (
    <div className="min-h-dvh bg-graphite-100 print:bg-white">
      {/* Barre d'outils — à l'écran seulement. */}
      <div className="mx-auto flex w-full max-w-[21cm] flex-wrap items-center justify-between gap-3 px-5 py-4 print:hidden">
        <Link href={retour} className="text-[0.875rem] font-semibold text-ink-700 hover:underline">
          ← Retour à mes documents
        </Link>
        <ImprimerCeDocument />
      </div>

      <article className="acte mx-auto w-full max-w-[21cm] bg-paper px-6 py-8 text-ink-900 shadow-[0_1px_3px_rgba(16,24,40,0.08)] print:max-w-none print:px-0 print:py-0 print:shadow-none sm:px-[1.9cm] sm:py-[1.6cm]">
        {/* --------------------------------------------------------- En-tête */}
        <header>
          <Image
            src="/brand/logo-horizontal.png"
            alt="FOANI International Training College"
            width={2172}
            height={724}
            sizes="400px"
            priority
            className="mx-auto h-[3.25rem] w-auto sm:h-[4.25rem]"
          />

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="text-[0.6875rem] leading-relaxed text-graphite-600">
              <p>
                {ETABLISSEMENT.positionnement} · {ETABLISSEMENT.ville}, {ETABLISSEMENT.pays}
              </p>
              <p>
                {CONTACT.telephone.affichage} &nbsp;|&nbsp; {CONTACT.courriel.valeur}
              </p>
            </div>
            <div className="text-right text-[0.6875rem] leading-relaxed">
              <p className="font-semibold text-ink-800">N° {numero}</p>
              <p className="text-graphite-600">
                {ETABLISSEMENT.ville}, le {date}
              </p>
            </div>
          </div>

          {/* Le filet bicolore : quatre cinquièmes d'encre, un cinquième d'or.
              C'est la seule ornementation du document, et elle porte les deux
              couleurs de la charte sans rien coûter à l'impression. */}
          <div aria-hidden="true" className="mt-2 flex h-[5px]">
            <span className="flex-[4] bg-ink-800" />
            <span className="flex-1 bg-gold-400" />
          </div>
        </header>

        {/* ----------------------------------------------------------- Titre */}
        <div className="mt-8 text-center">
          <h1 className="font-display text-[1.375rem] font-semibold tracking-[0.01em] text-ink-800 uppercase sm:text-[1.5rem]">
            {titre}
          </h1>
          <span aria-hidden="true" className="mx-auto mt-2 block h-[5px] w-28 bg-gold-400" />
        </div>

        {/* ---------------------------------------------------------- Corps */}
        {destinataire ? (
          <p className="mt-8 text-[0.875rem]">
            <span className="text-graphite-600">À l’attention de&nbsp;: </span>
            <strong className="font-semibold text-ink-800">{destinataire}</strong>
          </p>
        ) : null}

        <div className="mt-4 text-[0.875rem] leading-[1.7] text-ink-900">{children}</div>

        {/* ----------------------------------------------------- Vérification */}
        <footer className="mt-9 grid gap-0 border border-graphite-200 border-t-[3px] border-t-gold-400 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="flex items-start gap-4 p-4">
            <div
              /* Le motif est produit sur le serveur, en SVG : il reste net à
                 l'impression, et ne dépend d'aucun chargement extérieur au
                 moment précis où l'on imprime. */
              aria-hidden="true"
              className="h-[4.5rem] w-[4.5rem] shrink-0 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <div className="min-w-0">
              <p className="text-[0.625rem] font-bold tracking-[0.1em] text-ink-800 uppercase">
                Code de vérification
              </p>
              <p className="mt-0.5 font-display text-[1.25rem] leading-none font-semibold tracking-[0.06em] text-gold-600">
                {code}
              </p>
              <p className="mt-2 text-[0.625rem] leading-relaxed text-graphite-600">
                Visez le motif ci-contre, ou saisissez ce code sur{' '}
                <span className="font-medium text-ink-800">{DOMAINE}/verifier</span>, pour contrôler
                l’authenticité du présent document. Le partage de ce code est strictement réservé à
                l’organisme destinataire.
              </p>
            </div>
          </div>

          <div className="border-graphite-200 p-4 text-[0.75rem] sm:border-l">
            <p className="text-graphite-600">Pour l’établissement,</p>
            <p className="mt-8 border-t border-graphite-400 pt-1.5 font-semibold text-ink-800">
              Le service des admissions
            </p>
          </div>
        </footer>

        {/* L'adresse en clair : une photocopie en noir et blanc peut rendre le
            motif illisible, et il faut alors pouvoir taper. */}
        <p className="mt-2 text-center text-[0.5625rem] text-graphite-500">
          {adresseVerification(code)}
        </p>
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
   Les pièces d'un document : paragraphe, intertitre, mentions, modalités.
   -------------------------------------------------------------------------- */

export function Paragraphe({ children }: { children: React.ReactNode }) {
  return <p className="mt-3.5 first:mt-0">{children}</p>;
}

export function Intertitre({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-7 text-[0.8125rem] font-bold tracking-[0.06em] text-ink-800 uppercase">
      {children}
    </h2>
  );
}

/**
 * Le tableau des mentions.
 *
 * Un acte administratif porte ses données dans un tableau, pas dans une
 * phrase : c'est ce qui permet à un agent de guichet de trouver la ligne qu'il
 * cherche sans lire le document. Les lignes alternent pour que l'œil ne saute
 * pas d'une ligne à l'autre en suivant une colonne du doigt.
 */
export function Mentions({
  lignes,
}: {
  lignes: readonly { readonly cle: string; readonly valeur: string }[];
}) {
  return (
    <table className="mt-5 w-full border-collapse text-[0.8125rem]">
      <tbody>
        {lignes.map((ligne, rang) => (
          <tr key={ligne.cle} className={rang % 2 === 0 ? 'bg-ink-50/70' : undefined}>
            <th
              scope="row"
              className="w-[42%] border border-graphite-200 px-3 py-1.5 text-left font-semibold text-ink-800"
            >
              {ligne.cle}
            </th>
            <td className="border border-graphite-200 px-3 py-1.5 text-ink-700">{ligne.valeur}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Les modalités : numérotées en or, parce qu'elles se suivent dans l'ordre. */
export function Modalites({ etapes }: { etapes: readonly React.ReactNode[] }) {
  return (
    <ol className="mt-3 flex flex-col gap-1.5">
      {etapes.map((etape, rang) => (
        <li key={rang} className="flex gap-2.5">
          <span className="shrink-0 font-display text-[0.8125rem] font-semibold text-gold-600">
            {rang + 1}.
          </span>
          <span className="min-w-0">{etape}</span>
        </li>
      ))}
    </ol>
  );
}
