import { redirect } from 'next/navigation';
import { exigerDossier, type Candidat } from '@/lib/candidat';
import { inscriptionModifiable } from '@/lib/etapes-inscription';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   La garde du dossier d'inscription — Note complémentaire §5.1, étape 3
   --------------------------------------------------------------------------
   « La place est alors réservée et le dossier d'inscription s'ouvre. »

   Le dossier d'inscription n'existe pas avant. Un candidat qui devinerait
   l'adresse est renvoyé à son espace, où il lit ce qu'on attend de lui — et
   non vers une page d'erreur, qui ne lui apprendrait rien.

   La garde couvre aussi les états postérieurs : une fois le dossier parti à la
   scolarité, les écrans restent consultables mais leurs champs sont éteints
   par le cadre. On ne renvoie donc pas dans ce cas — on laisse relire.
   ========================================================================== */

const CONSULTABLE = [
  'place-reservee',
  'inscription-a-valider',
  'inscrit',
  'acces-ouverts',
] as const;

export async function exigerDossierInscription(): Promise<{
  readonly candidat: Candidat;
  readonly dossier: Candidature;
  readonly ouvert: boolean;
}> {
  const { candidat, dossier } = await exigerDossier();

  if (!(CONSULTABLE as readonly string[]).includes(dossier.etat)) redirect('/mon-dossier');

  return { candidat, dossier, ouvert: inscriptionModifiable(dossier) };
}
