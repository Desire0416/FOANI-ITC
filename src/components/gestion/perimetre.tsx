import { IconCheck, IconClose, IconShield } from '@/components/brand/icons';
import { LIBELLES_ROLE, PERIMETRE_DETAILLE, type Role } from '@/payload/roles';

/* ==========================================================================
   Ce que votre rôle vous permet
   --------------------------------------------------------------------------
   Le §5.2 attribue à chaque rôle un périmètre, et une colonne « ne peut pas »
   qui compte autant que la première. Jusqu'ici elle n'était qu'appliquée :
   l'agent constatait qu'un écran manquait, sans savoir si c'était une panne,
   un oubli, ou une règle.

   Ce bloc l'affiche. Il tient sur le tableau de bord, à la première place où
   l'on regarde en arrivant, et il nomme le service à qui revient ce qui n'est
   pas permis — pour qu'un chargé d'admission sache à qui adresser une
   vérification de versement, et un rédacteur à qui demander une mise en ligne.
   ========================================================================== */

export function Perimetre({ role }: { role: Role }) {
  const perimetre = PERIMETRE_DETAILLE[role];

  return (
    <section className="carte overflow-hidden">
      <header className="flex items-center gap-3 border-b border-graphite-100 bg-paper-tint px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-gold-400">
          <IconShield className="h-[1.125rem] w-[1.125rem]" />
        </span>
        <span>
          <h2 className="text-[1.0625rem] leading-tight">Votre rôle&nbsp;: {LIBELLES_ROLE[role]}</h2>
          <p className="mt-0.5 text-[0.8125rem] text-graphite-500">
            Ce que le dispositif vous ouvre, et ce qu’il réserve à d’autres services.
          </p>
        </span>
      </header>

      <div className="grid gap-x-8 gap-y-6 p-5 sm:p-6 lg:grid-cols-2">
        <div>
          <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-[#0f7a4d] uppercase">
            Vous pouvez
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {perimetre.peut.map((ligne) => (
              <li key={ligne} className="flex items-start gap-2.5">
                <IconCheck
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#0f7a4d]"
                />
                <span className="text-[0.875rem] leading-snug text-graphite-700">{ligne}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-graphite-500 uppercase">
            Vous ne pouvez pas
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {perimetre.nePeutPas.map((ligne) => (
              <li key={ligne} className="flex items-start gap-2.5">
                <IconClose
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-graphite-400"
                />
                <span className="text-[0.875rem] leading-snug text-graphite-600">{ligne}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
