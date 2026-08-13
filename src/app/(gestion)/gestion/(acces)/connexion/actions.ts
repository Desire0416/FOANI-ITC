'use server';

import { cookies as temoins } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';

/* ==========================================================================
   Ouverture de session
   --------------------------------------------------------------------------
   Le message d'échec ne distingue jamais « compte inconnu » de « mot de passe
   incorrect » : la distinction renseignerait un tiers sur l'existence d'un
   compte. Payload limite par ailleurs les tentatives et verrouille
   temporairement (§21.3).
   ========================================================================== */

export type EtatConnexion = { readonly message: string | null };

export async function ouvrirSession(
  _precedent: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  const email = String(donnees.get('email') ?? '').trim();
  const motDePasse = String(donnees.get('motDePasse') ?? '');

  if (!email || !motDePasse) {
    return { message: 'Renseignez votre adresse et votre mot de passe.' };
  }

  const payload = await getPayload({ config });

  try {
    const resultat = await payload.login({
      collection: 'utilisateurs',
      data: { email, password: motDePasse },
    });

    if (!resultat.token) {
      return { message: 'Identifiants incorrects.' };
    }

    // Un compte désactivé conserve son historique mais ne se connecte plus.
    if ((resultat.user as { actif?: boolean }).actif === false) {
      return { message: 'Cet accès a été désactivé. Contactez l’administrateur du dispositif.' };
    }

    const boite = await temoins();
    boite.set({
      name: `${payload.config.cookiePrefix}-token`,
      value: resultat.token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
  } catch {
    return { message: 'Identifiants incorrects, ou trop de tentatives. Réessayez dans un moment.' };
  }

  redirect('/gestion');
}

export async function fermerSession(): Promise<void> {
  const payload = await getPayload({ config });
  const boite = await temoins();
  boite.delete(`${payload.config.cookiePrefix}-token`);
  redirect('/gestion/connexion');
}
