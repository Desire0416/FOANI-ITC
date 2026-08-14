import { getPayload } from 'payload';
import config from '@payload-config';

/* Applique le schéma à la base. À lancer sur l'endpoint non poolé, avec
   PAYLOAD_DB_PUSH=1 : le mode transaction de pgbouncer refuse le DDL. */
await getPayload({ config });
console.log('Schéma appliqué.');
process.exit(0);
