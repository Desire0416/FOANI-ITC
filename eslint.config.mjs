import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Depuis Next 16, `eslint-config-next` est livré en configuration plate :
 * il s'importe directement, sans passer par `FlatCompat`.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Générés par Next ou par Payload : ils n'ont pas à respecter nos règles.
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'src/payload-types.ts'],
  },
  {
    rules: {
      /* Un paramètre préfixé d'un tiret bas est déclaré inutilisé à dessein.
         Le cas se présente à chaque action de formulaire : `useActionState`
         impose la signature `(precedent, donnees)`, que l'action utilise ou
         non les deux. Renommer ne servirait qu'à faire taire l'outil. */
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
];

export default eslintConfig;
