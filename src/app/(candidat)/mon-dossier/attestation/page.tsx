import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import {
  DocumentOfficiel,
  Mentions,
  Paragraphe,
} from '@/components/candidat/document-officiel';
import { ETABLISSEMENT } from '@/content/site';
import { exigerDossier } from '@/lib/candidat';
import { formatDate } from '@/lib/etats';
import { delivrerDocument, documentsDelivrables } from '@/payload/delivrance';

export const metadata: Metadata = { title: 'Mon attestation d’inscription' };

/* Étape 8 du parcours — Note complémentaire §5.1 et §5.2. Le document est
   délivré à sa première ouverture, numéroté à cet instant, et jamais
   renuméroté : il lit ensuite les valeurs qu'il a figées. */
export default async function Acte() {
  const { dossier } = await exigerDossier();
  if (!documentsDelivrables(dossier)) redirect('/mon-dossier');

  const payload = await getPayload({ config });
  const document = await delivrerDocument(payload, 'attestation-inscription', dossier);
  const porte = document.donnees;
  const mentions = porte.mentions ?? {};

  const civilite = mentions.sexe === 'feminin' ? 'Madame' : mentions.sexe === 'masculin' ? 'Monsieur' : null;

  return (
    <DocumentOfficiel
      titre="Attestation d’inscription"
      numero={document.numero}
      code={document.code}
      delivreLe={document.delivreLe}
      retour="/mon-dossier/documents"
    >
      <Paragraphe>
        Le directeur de {ETABLISSEMENT.nom} certifie que la personne désignée ci-dessous a satisfait aux
        formalités d’inscription pour l’année universitaire indiquée.
      </Paragraphe>

      <Mentions
        lignes={[
          { cle: 'Numéro étudiant', valeur: mentions.numeroEtudiant ?? '—' },
          { cle: 'Nom et prénoms', valeur: porte.titulaire },
          {
            cle: 'Né(e) le',
            valeur: mentions.dateNaissance ? formatDate(mentions.dateNaissance) : '—',
          },
          { cle: 'À', valeur: mentions.lieuNaissance ?? '—' },
          { cle: 'Formation', valeur: porte.formation ?? '—' },
          { cle: 'Niveau', valeur: porte.niveau ?? '—' },
          { cle: 'Année universitaire', valeur: mentions.anneeEntree ?? '—' },
        ]}
      />

      <Paragraphe>
        La présente attestation est destinée aux démarches administratives de l’intéressé(e),
        notamment les demandes de bourse et de logement.
      </Paragraphe>

      <Paragraphe>
        En foi de quoi la présente attestation lui est délivrée pour servir et valoir ce que de droit.
      </Paragraphe>

      {civilite ? null : (
        <Paragraphe>
          <span className="text-[0.75rem] text-graphite-500">
            La civilité n’est pas portée : elle n’a pas été recueillie au dossier.
          </span>
        </Paragraphe>
      )}
    </DocumentOfficiel>
  );
}
