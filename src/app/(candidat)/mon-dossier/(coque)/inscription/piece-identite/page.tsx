import type { Metadata } from 'next';
import { CadreInscription } from '@/components/candidat/cadre-inscription';
import { ZoneIdentite } from '@/components/candidat/consentement-biometrie';
import { Alerte, Carte } from '@/components/candidat/ui';
import { exigerDossierInscription } from '@/lib/inscription-garde';
import { RapportControle } from '@/components/commun/rapport-controle';
import { biometrieActive, type Rapport } from '@/payload/biometrie/controles';

export const metadata: Metadata = { title: 'Votre pièce d’identité' };

/* ==========================================================================
   Étape 5 du parcours d'inscription — Note complémentaire §5.1
   --------------------------------------------------------------------------
   « Le candidat photographie sa pièce d'identité recto et verso, puis se
   photographie tenant cette pièce. Le dispositif contrôle la lisibilité et la
   cohérence entre les informations déclarées et celles figurant sur la pièce.
   Le service Scolarité procède au contrôle visuel. »

   Le troisième cliché est celui qui remplace la présence physique. Sans lui,
   deux photographies d'une pièce d'identité ne prouvent rien : n'importe qui
   peut photographier la pièce de quelqu'un d'autre. Le porteur tenant sa
   pièce lie la personne au document, et c'est ce lien que l'agent contrôle.

   L'écran dit ce qui est contrôlé ici — la lisibilité — et ce qui ne l'est
   pas : ni le texte de la pièce, ni le visage. Le §5.4 pose la règle générale
   du dispositif : « tout écart est signalé à l'agent, sans blocage
   automatique ».
   ========================================================================== */


function adresseDe(dossier: unknown, champ: string): string | null {
  const valeur = (dossier as Record<string, unknown>)[champ];
  if (valeur && typeof valeur === 'object' && 'url' in valeur) {
    return ((valeur as { url?: string | null }).url ?? null);
  }
  return null;
}

export default async function PieceIdentite() {
  const { dossier, ouvert } = await exigerDossierInscription();
  const d = dossier as unknown as Record<string, unknown>;

  const controle = String(d.identiteControle ?? 'attente');
  const motif = (d.identiteMotif as string | null) ?? null;
  const rapport = (d.controleAuto as Rapport | null) ?? null;
  const consenti = Boolean(d.biometrieConsentieLe);

  return (
    <CadreInscription
      dossier={dossier}
      etape="piece-identite"
      chapo="Trois photographies : votre pièce d’identité de chaque côté, et vous la tenant. C’est ce qui remplace le passage au guichet."
    >
      <div className="flex flex-col gap-6">
        {controle === 'conforme' ? (
          <Alerte ton="reussite" titre="Votre identité a été vérifiée">
            Le service de la scolarité a procédé au contrôle visuel. Vous n’avez plus rien à faire
            pour cette étape.
          </Alerte>
        ) : null}

        {controle === 'a-revoir' ? (
          <Alerte ton="erreur" titre="Une reprise est demandée">
            {motif ?? 'Reprenez les photographies indiquées par le service de la scolarité.'}
          </Alerte>
        ) : null}

        {rapport ? (
          <section className="carte overflow-hidden">
            <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
              <h2 className="text-[1.0625rem] leading-snug">Ce que la vérification automatique a trouvé</h2>
            </header>
            <div className="p-5 sm:p-6">
              <RapportControle rapport={rapport} />
            </div>
          </section>
        ) : null}

        <ZoneIdentite
          adresses={{
            pieceRecto: adresseDe(d, 'pieceRecto'),
            pieceVerso: adresseDe(d, 'pieceVerso'),
            pieceSelfie: adresseDe(d, 'pieceSelfie'),
          }}
          ouvert={ouvert && controle !== 'conforme'}
          biometrie={biometrieActive()}
          dejaConsenti={consenti}
        />

        <Carte titre="Ce que nous vérifions">
          {biometrieActive() ? (
            <>
              <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
                Deux contrôles se succèdent. Le premier porte sur la{' '}
                <strong>lisibilité</strong> de l’image, et se fait dans votre téléphone avant
                l’envoi&nbsp;: une pièce mesure 85 sur 54 millimètres et son numéro est imprimé en
                caractères de deux millimètres&nbsp;; en deçà d’un certain cadrage, il n’est plus
                lisible.
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-600">
                Le second porte sur votre <strong>identité</strong>. Le visage de votre photographie
                est comparé à celui figurant sur votre pièce, puis à celui de la photographie où
                vous la tenez. Le texte de la pièce est lu et rapproché de ce que vous avez déclaré.
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-600">
                Ces comparaisons ne décident pas de votre inscription&nbsp;: elles écartent ce qui
                est manifestement inexploitable, et signalent le reste à un agent de la scolarité,
                qui procède au contrôle visuel et tranche. Son contrôle porte son nom et sa date.
              </p>
            </>
          ) : (
            <>
              <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
                Le contrôle automatique porte sur la <strong>lisibilité</strong> de l’image&nbsp;:
                sa définition et sa netteté. Il est fait dans votre téléphone, avant l’envoi.
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-600">
                La vérification de votre identité est faite par un agent de la scolarité, qui lit
                votre pièce et contrôle qu’elle vous correspond. Son contrôle porte son nom et sa
                date.
              </p>
            </>
          )}
        </Carte>

        <Carte titre="Ce que deviennent ces images">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
            Elles sont conservées telles que vous les avez déposées, avec leur date. Seuls les
            services des admissions et de la scolarité peuvent les ouvrir, et chaque consultation
            est enregistrée avec le nom de son auteur.
          </p>
          {biometrieActive() ? (
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-600">
              Les comparaisons de visages sont faites au moment du dépôt, puis oubliées&nbsp;: seul
              leur résultat est conservé. Aucune empreinte de votre visage n’est enregistrée, et
              aucune de vos images n’est conservée par le service qui procède à la comparaison.
            </p>
          ) : null}
        </Carte>
      </div>
    </CadreInscription>
  );
}
