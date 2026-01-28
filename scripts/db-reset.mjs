import { spawn } from 'node:child_process';

const steps = [
  {
    label: 'A parar containers e volumes',
    command: 'docker',
    args: ['compose', 'down', '-v'],
  },
  {
    label: 'A iniciar containers',
    command: 'docker',
    args: ['compose', 'up', '-d'],
  },
  {
    label: 'A aplicar migrations',
    command: 'pnpm',
    args: ['db:migrate'],
  },
  {
    label: 'A aplicar seed',
    command: 'pnpm',
    args: ['db:seed'],
  },
];

const runStep = ({ label, command, args }) =>
  new Promise((resolve, reject) => {
    console.log(`[db:reset] ${label}...`);
    const child = spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} falhou com código ${code}.`));
    });
  });

const run = async () => {
  try {
    for (const step of steps) {
      await runStep(step);
    }
    console.log('[db:reset] Concluído com sucesso.');
  } catch (error) {
    console.error('[db:reset] Erro ao reiniciar a base de dados.');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

void run();
