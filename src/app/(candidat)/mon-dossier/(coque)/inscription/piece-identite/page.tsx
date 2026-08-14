import type { Metadata } from 'next';
import { CadreInscription } from '@/components/candidat/cadre-inscription';
import { ClicheIdentite } from '@/components/candidat/cliche-identite';
import { Alerte, Carte } from '@/components/candidat/ui';
import { exigerDossierInscription } from '@/lib/inscription-garde';

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

const CLICHES = [
  {
    cliche: 'recto' as const,
    champ: 'pieceRecto',
    titre: 'Le recto de votre pièce',
    consigne:
      'Posez la pièce à plat sur un fond uni, sans reflet, et cadrez-la de près. Les quatre coins doivent être visibles.',
  },
  {
    cliche: 'verso' as const,
    champ: 'pieceVerso',
    titre: 'Le verso de votre pièce',
    consigne:
      'Retournez la pièce et reprenez de la même façon. Même si le verso vous paraît vide, il porte des mentions utiles.',
  },
  {
    cliche: 'selfie' as const,
    champ: 'pieceSelfie',
    titre: 'Vous, tenant votre pièce',
    consigne:
      'Tenez la pièce près de votre visage, face à l’appareil. Votre visage et la pièce doivent être nets tous les deux.',
  },
];

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

        <div className="grid gap-4 lg:grid-cols-3">
          {CLICHES.map((item) => (
            <ClicheIdentite
              key={item.cliche}
              cliche={item.cliche}
              titre={item.titre}
              consigne={item.consigne}
              deja={adresseDe(d, item.champ)}
              ouvert={ouvert && controle !== 'conforme'}
            />
          ))}
        </div>

        <Carte titre="Ce que nous vérifions, et ce que nous ne vérifions pas">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
            Le contrôle automatique porte sur la <strong>lisibilité</strong>&nbsp;: la définition et
            la netteté de l’image. Une pièce d’identité mesure 85 sur 54 millimètres et son numéro
            est imprimé en caractères de deux millimètres&nbsp;; en deçà d’un certain cadrage, il
            devient illisible, et vous l’envoyer quand même ne ferait que retarder le refus.
          </p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-600">
            Aucune lecture automatique du texte de votre pièce n’est faite, et aucune reconnaissance
            faciale n’est employée. C’est un agent de la scolarité qui lira votre pièce et
            vérifiera qu’elle vous correspond. Son contrôle porte son nom et sa date.
          </p>
        </Carte>

        <Carte titre="Ce que deviennent ces images">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
            Elles sont conservées telles que vous les avez déposées, avec leur date. Seuls les
            services des admissions et de la scolarité peuvent les ouvrir, et chaque consultation
            est enregistrée avec le nom de son auteur.
          </p>
        </Carte>
      </div>
    </CadreInscription>
  );
}
