import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ent = readFileSync(resolve(__dirname, '../../api/ent.graphql'), 'utf8');
const custom = readFileSync(resolve(__dirname, '../../api/custom.graphqls'), 'utf8');
let combined = ent + '\n\n' + custom + '\n';
if (!/\btype\s+Mutation\b/.test(ent)) {
  combined = combined.replace(/extend\s+type\s+Mutation/g, 'type Mutation');
}
writeFileSync(resolve(__dirname, '../../api/combined.graphql'), combined, 'utf8');
console.log('Wrote api/combined.graphql');
