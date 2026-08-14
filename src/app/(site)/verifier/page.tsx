import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';
import { ETABLISSEMENT } from '@/content/site';
import { natureDocument, normaliserCode, parCode } from '@/payload/documents';

export const metadata: Metadata = {
  title: 'Vérifier un document',
  description:
    'Contrôler l’authenticité d’un document délivré par FOANI International Training College à partir de son code de vérification.',
  robots: { index: true, follow: true },
};

/* ==========================================================================
   La page publique de vérification — Note complémentaire §5.2
   --------------------------------------------------------------------------
   « Un employeur, une banque ou une administration doit pouvoir vérifier
   qu'un certificat présenté est authentique. Une page publique répond à la
   saisie d'un code de vérification en indiquant si le document a bien été
   délivré, à quelle date et pour quelle formation, sans divulguer d'autre
   information. C'est ce qui donne une valeur réelle à un document délivré à
   distance. »

   Trois choses en découlent, et une quatrième qui n'est pas écrite.

   1. La page est publique : ni compte, ni session. Un employeur ne va pas
      créer un compte pour vérifier une attestation.
   2. Elle ne dit que trois choses : délivré ou non, quand, pour quelle
      formation. Le nom du titulaire n'y figure pas — celui qui vérifie l'a
      déjà sous les yeux sur le document.
   3. Le code passe par l'adresse, pour qu'un lien puisse être transmis tel
      quel. C'est une donnée de document, pas une donnée personnelle : le
      §19.3 n'y fait pas obstacle.

   La quatrième : un code inconnu ne dit pas « ce document est faux ». Il dit
   qu'aucun document ne porte ce code. La nuance compte quand quelqu'un a
   simplement mal recopié un caractère.
   ========================================================================== */

export default async function Verifier({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const saisi = (code ?? '').trim();

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-[0.75rem] font-semibold tracking-[0.12em] text-graphite-500 uppercase">
        {ETABLISSEMENT.sigle}
      </p>
      <h1 className="mt-3 font-display text-[2rem] leading-tight font-semibold tracking-tight text-ink-800 sm:text-[2.5rem]">
        Vérifier un document
      </h1>
      <p className="mt-4 text-[1.0625rem] leading-relaxed text-graphite-600">
        Chaque document délivré par l’établissement porte un code de vérification. Saisissez-le
        ci-dessous pour contrôler qu’il a bien été délivré, à quelle date et pour quelle formation.
      </p>

      {/* Une méthode GET : le résultat est partageable par simple lien, et la
          page reste consultable sans JavaScript. */}
      <form method="get" className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="code"
            className="mb-1.5 block text-[0.8125rem] font-semibold text-graphite-600"
          >
            Code de vérification
          </label>
          <input
            id="code"
            name="code"
            defaultValue={saisi}
            autoComplete="off"
            spellCheck={false}
            placeholder="ABCD-EFG-HJK"
            className="h-13 w-full rounded-2xl border border-graphite-300 bg-paper px-4 font-display text-[1.125rem] tracking-[0.08em] text-ink-800 uppercase outline-none focus:border-ink-700"
          />
        </div>
        <button
          type="submit"
          className="h-13 shrink-0 rounded-2xl bg-ink-800 px-7 text-[0.9375rem] font-semibold text-paper transition-colors hover:bg-ink-700"
        >
          Vérifier
        </button>
      </form>

      {saisi ? <Resultat saisi={saisi} /> : null}

      <p className="mt-10 border-t border-graphite-200 pt-6 text-[0.8125rem] leading-relaxed text-graphite-500">
        Cette page ne révèle que la nature du document, sa date de délivrance et la formation
        concernée. Elle ne communique aucune donnée personnelle. Un doute&nbsp;? Écrivez à
        l’établissement en citant le numéro figurant sur le document.
      </p>
    </main>
  );
}

/* -------------------------------------------------------------------------- */

async function Resultat({ saisi }: { saisi: string }) {
  const normalise = normaliserCode(saisi);

  if (normalise.length !== 10) {
    return (
      <Verdict ton="doute" titre="Ce code n’a pas le bon format">
        Un code de vérification compte dix caractères, écrits en trois groupes — par exemple{' '}
        <span className="font-medium">ABCD-EFG-HJK</span>. Recopiez-le tel qu’il figure sur le
        document.
      </Verdict>
    );
  }

  const payload = await getPayload({ config });
  const document = await parCode(payload, normalise);

  if (!document) {
    return (
      <Verdict ton="doute" titre="Aucun document ne porte ce code">
        Vérifiez la saisie&nbsp;: les caractères se confondent facilement à la lecture. Si le code
        est bien celui imprimé sur le document, celui-ci n’a pas été délivré par l’établissement.
      </Verdict>
    );
  }

  const nature = natureDocument(document.nature);
  const date = new Date(document.delivreLe).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Verdict ton="authentique" titre="Ce document a bien été délivré">
      <dl className="mt-1 flex flex-col gap-2.5">
        <Ligne cle="Nature" valeur={nature.libelle} />
        <Ligne cle="Numéro" valeur={document.numero} />
        <Ligne cle="Délivré le" valeur={date} />
        <Ligne cle="Formation" valeur={document.donnees?.formation ?? 'Non précisée'} />
      </dl>
    </Verdict>
  );
}

function Ligne({ cle, valeur }: { cle: string; valeur: string }) {
  return (
    <div className="flex flex-wrap gap-x-4">
      <dt className="w-full text-[0.8125rem] font-semibold opacity-70 sm:w-32 sm:shrink-0">
        {cle}
      </dt>
      <dd className="min-w-0 flex-1 text-[0.9375rem] font-medium">{valeur}</dd>
    </div>
  );
}

function Verdict({
  ton,
  titre,
  children,
}: {
  ton: 'authentique' | 'doute';
  titre: string;
  children: React.ReactNode;
}) {
  const authentique = ton === 'authentique';
  return (
    <section
      role="status"
      className={
        authentique
          ? 'mt-8 rounded-3xl border border-state-success/25 bg-state-success/[0.06] p-6 text-state-success sm:p-7'
          : 'mt-8 rounded-3xl border border-gold-200 bg-gold-50 p-6 text-gold-800 sm:p-7'
      }
    >
      <h2 className="font-display text-[1.25rem] font-semibold tracking-tight">{titre}</h2>
      <div className="mt-3 text-[0.9375rem] leading-relaxed">{children}</div>
    </section>
  );
}
