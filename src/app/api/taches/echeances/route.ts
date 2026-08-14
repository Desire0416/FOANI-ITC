import { NextResponse, type NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { balayerLesEcheances } from '@/payload/actions/echeances';

/* ==========================================================================
   Tâche planifiée : les échéances de la chaîne — RG-45
   --------------------------------------------------------------------------
   « L'expiration du délai d'acceptation vaut désistement et libère la place. »

   Une conséquence du temps n'a pas d'auteur humain : il faut donc que quelque
   chose passe, une fois par jour, constater ce que le calendrier a tranché.
   Cette adresse est ce quelque chose.

   Elle est protégée par un secret, et non par une session : l'appelant est une
   machine. Sans `TACHES_SECRET` renseigné, elle refuse tout — mieux vaut une
   tâche qui ne tourne pas qu'une adresse ouverte capable de faire basculer des
   dossiers.

   Sur Vercel, la planification se déclare dans `vercel.json` :

       { "crons": [{ "path": "/api/taches/echeances", "schedule": "0 6 * * *" }] }

   La plateforme appelle alors l'adresse chaque matin, en présentant son propre
   en-tête d'autorisation. Tant que ce n'est pas branché, l'admission déclenche
   le même balayage à la main depuis sa file.
   ========================================================================== */

export async function GET(requete: NextRequest) {
  const secret = process.env.TACHES_SECRET;

  if (!secret) {
    return NextResponse.json(
      { ok: false, message: 'TACHES_SECRET n’est pas renseigné : la tâche est désactivée.' },
      { status: 503 },
    );
  }

  /* Vercel Cron présente `Authorization: Bearer <CRON_SECRET>`. On accepte
     aussi un paramètre, pour pouvoir éprouver la tâche depuis un terminal. */
  const entete = requete.headers.get('authorization');
  const fourni = entete?.startsWith('Bearer ')
    ? entete.slice(7)
    : requete.nextUrl.searchParams.get('secret');

  if (fourni !== secret) {
    return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const traites = await balayerLesEcheances(payload, 'Dispositif (délai expiré)');

  return NextResponse.json({
    ok: true,
    traites,
    message:
      traites === 0
        ? 'Aucune offre n’a dépassé son délai d’acceptation.'
        : `${traites} dossier(s) passé(s) en désistement, place(s) libérée(s).`,
  });
}
