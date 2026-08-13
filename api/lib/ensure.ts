import { execFile } from "child_process";

/**
 * Au démarrage : synchronise le schéma puis seede les données par défaut
 * en arrière-plan (non bloquant, sans jamais faire échouer le serveur).
 * Le seed n'insère rien si les tables sont déjà remplies.
 */
export function ensureDatabaseInBackground() {
  const run = (cmd: string, args: string[]) =>
    new Promise<void>((resolve) => {
      execFile(cmd, args, { cwd: process.cwd(), env: process.env }, (err, stdout, stderr) => {
        if (err) console.error(`[ensure-db] ${cmd} ${args.join(" ")}:`, stderr || err.message);
        else console.log(`[ensure-db] ${cmd} ${args.join(" ")} OK`, stdout?.slice(0, 300));
        resolve();
      });
    });

  // N'attend pas la fin : le serveur écoute immédiatement.
  (async () => {
    await run("npx", ["drizzle-kit", "migrate"]);
    await run("npx", ["tsx", "db/seed.ts"]);
  })().catch((e) => console.error("[ensure-db]", e));
}
