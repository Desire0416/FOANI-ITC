import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight } from '@/components/brand/icons';
import { EnTetePage } from '@/components/gestion/ui';
import { FormulaireGrille } from '@/components/gestion/grille-formulaire';
import { CYCLE_LABELS, FORMATIONS, titreComplet } from '@/content/formations';
import { ETABLISSEMENT } from '@/content/site';
import { exigerRole } from '@/lib/session';
import { ROLES_GRILLES } from '@/payload/roles';

export const metadata: Metadata = { title: 'Nouvelle grille' };

export default async function NouvelleGrille() {
  await exigerRole(ROLES_GRILLES);

  const anneeParDefaut = `${new Date(ETABLISSEMENT.rentree).getFullYear()}-${
    new Date(ETABLISSEMENT.rentree).getFullYear() + 1
  }`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/gestion/grilles"
          className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-graphite-500 transition-colors hover:text-ink-700"
        >
          <IconArrowRight className="h-4 w-4 rotate-180" />
          Retour aux grilles
        </Link>
      </div>

      <EnTetePage
        surtitre="Finances"
        titre="Nouvelle grille tarifaire"
        resume="Elle est créée en brouillon. Elle ne devient opposable qu’une fois arrêtée, par un geste distinct."
      />

      <FormulaireGrille
        lignes={[]}
        modifiable
        entete={
          <div className="carte p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="formation" className="etiquette">
                  Formation
                </label>
                <select id="formation" name="formation" className="champ" defaultValue="">
                  <option value="">Aucune — session courte ou prestation</option>
                  {FORMATIONS.map((formation) => (
                    <option key={formation.slug} value={formation.slug}>
                      {CYCLE_LABELS[formation.cycle]} — {titreComplet(formation)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="anneeAcademique" className="etiquette">
                  Année académique
                </label>
                <input
                  id="anneeAcademique"
                  name="anneeAcademique"
                  defaultValue={anneeParDefaut}
                  className="champ"
                />
              </div>

              <div>
                <label htmlFor="intitule" className="etiquette">
                  Intitulé
                </label>
                <input
                  id="intitule"
                  name="intitule"
                  className="champ"
                  placeholder="Masterclass — Transformation du cacao"
                />
                <p className="aide">Pour une session ou une prestation sans formation au catalogue.</p>
              </div>

              <div>
                <label htmlFor="circuit" className="etiquette">
                  Circuit
                </label>
                <select id="circuit" name="circuit" className="champ" defaultValue="academique">
                  <option value="academique">Académique</option>
                  <option value="cabinet">Cabinet — prestations aux organisations</option>
                </select>
                <p className="aide">Les prestations aux entreprises suivent un circuit distinct.</p>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
