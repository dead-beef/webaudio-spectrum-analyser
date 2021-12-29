import {
  spawnSync,
  SpawnSyncOptionsWithStringEncoding,
  SpawnSyncReturns,
} from 'child_process';
import * as fs from 'fs';
import readlineSync from 'readline-sync';
import { Observable, Subscriber } from 'rxjs';
import { argv } from 'yargs';

import { COLORS } from './colors';

/**
 * @name cwd
 * @constant
 * @summary Current working directory.
 */
const cwd = __dirname;

/**
 * @name root
 * @constant
 * @summary Project root directory.
 */
const root = `${cwd}/../..`;

type UpdatablePackages = Record<string, string>;

/**
 * Prints script usage instructions.
 */
function printUsageInstructions() {
  console.log(
    `\n${COLORS.CYAN}%s${COLORS.DEFAULT} ${COLORS.YELLOW}%s${COLORS.DEFAULT}
${COLORS.CYAN}%s${COLORS.DEFAULT} ${COLORS.YELLOW}%s${COLORS.DEFAULT}
${COLORS.CYAN}%s${COLORS.DEFAULT} ${COLORS.YELLOW}%s${COLORS.DEFAULT}
${COLORS.CYAN}%s${COLORS.DEFAULT} ${COLORS.YELLOW}%s${COLORS.DEFAULT}\n`,
    'Use --check flag to check for updates, e.g.',
    'yarn workspace:update:check',
    'Use --check --jsonUpgraded flags to check for updates and save updated packages as json in the project root, e.g.',
    'yarn workspace:update:start',
    'Use --migrate=start flag to start migration process, e.g.',
    'yarn workspace:update:process',
    'Use --migrate=execute flag to execute migrations, e.g.',
    'yarn workspace:update:execute'
  );
}

/**
 * Runs a process synchronously, and outputs result.
 * @param command command to run
 * @param [args] command arguments
 * @param [options] spawnSync options
 */
function spawnCommandSync(
  command: string,
  args: string[] = [],
  options: Partial<SpawnSyncOptionsWithStringEncoding> = {}
): SpawnSyncReturns<string> {
  const defaults: SpawnSyncOptionsWithStringEncoding = {
    env: {
      ...process.env,
      FORCE_COLOR: 'true',
    },
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'inherit', 'inherit'],
  };
  const spawnSyncOutput = spawnSync(command, args, { ...defaults, ...options });

  console.log(`${COLORS.CYAN}%s${COLORS.DEFAULT}`, 'Process finished.');
  if (spawnSyncOutput.error) {
    console.log(
      `${COLORS.RED}%s:${COLORS.DEFAULT}\n%s`,
      'ERROR',
      spawnSyncOutput.error
    );
  }
  if (spawnSyncOutput?.stdout.length) {
    console.log(
      `${COLORS.CYAN}%s:${COLORS.DEFAULT}\n%s`,
      'stdout',
      spawnSyncOutput.stdout
    );
  }
  if (spawnSyncOutput?.stderr.length) {
    console.log(
      `${COLORS.CYAN}%s:${COLORS.DEFAULT}\n%s`,
      'stderr',
      spawnSyncOutput.stderr
    );
  }
  const color = spawnSyncOutput.status ? COLORS.RED : COLORS.CYAN;
  console.log(
    `${color}%s:${COLORS.DEFAULT}\n%s`,
    'exit code',
    spawnSyncOutput.status
  );

  return spawnSyncOutput;
}

/**
 * Reads migrations.json, and executes migrations if file exists.
 */
function executeMigrations(): Observable<SpawnSyncReturns<string> | null> {
  const result = new Observable(function (
    this,
    subscriber: Subscriber<SpawnSyncReturns<string> | null>
  ) {
    let i = 0;
    for (; fs.existsSync(`migrations.${i}.json`); ++i);
    if (!i) {
      console.log(
        `\n${COLORS.GREEN}%s${COLORS.DEFAULT}\n`,
        '<< NO MIGRATIONS >>'
      );
      subscriber.next(null);
    }
    while (--i >= 0) {
      const path = `migrations.${i}.json`;
      console.log(
        `\n${COLORS.YELLOW}%s${COLORS.DEFAULT}\n`,
        `<< EXECUTING MIGRATIONS ${path} >>`
      );
      const migrationProcessOutput = spawnCommandSync(
        `yarn nx migrate --run-migrations=${path}`
      );
      if (migrationProcessOutput.error || migrationProcessOutput.status) {
        console.log(
          `\n${COLORS.RED}%s${COLORS.DEFAULT}\n`,
          `<< ERROR EXECUTING MIGRATIONS ${path} >>`
        );
        process.exit(1);
      } else {
        fs.rmSync(path);
      }
      subscriber.next(migrationProcessOutput);
    }
    subscriber.complete();
    subscriber.unsubscribe();
  });
  return result;
}

/**
 * Write update summary.
 * @param packages
 */
function writeUpdateSummary(packages: UpdatablePackages) {
  const path = `${root}/migrations-packages.json`;
  fs.writeFile(
    path,
    JSON.stringify(packages),
    (error: NodeJS.ErrnoException | null) => {
      if (error !== null) {
        console.log(`\n${COLORS.RED}%s${COLORS.DEFAULT}\n%s\n`, 'ERROR', error);
        process.exit(1);
      }
      console.log(
        `\n${COLORS.GREEN}%s${COLORS.DEFAULT}%s\n`,
        'Update summary saved: ',
        path
      );
    }
  );
}

/**
 * Check for available updates.
 * @param [jsonUpgraded] defaults to true; passes flag to ncu cli, as a result output is in json format;
 */
function checkForUpdates(jsonUpgraded = false): UpdatablePackages {
  const args = jsonUpgraded ? ['--jsonUpgraded'] : [];
  console.log(
    `\n${COLORS.YELLOW}%s${COLORS.DEFAULT}\n`,
    'Checking for updates. Wait for it...'
  );
  const ncuOutput = spawnCommandSync('ncu', args, {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const updatablePackages: UpdatablePackages = jsonUpgraded
    ? JSON.parse(ncuOutput.stdout.substr(ncuOutput.stdout.indexOf('{'))) ?? {}
    : {};
  if (jsonUpgraded) {
    writeUpdateSummary(updatablePackages);
  } else {
    console.log(
      `\n${COLORS.YELLOW}%s${COLORS.DEFAULT}\n`,
      'Verify output above. Dependencies highlighted with red may have breaking changes but not necessarily.'
    );
  }
  return updatablePackages;
}

/**
 * Executes packages migration procedure.
 */
function migratePackages(packageNames: string[]) {
  const migrate: string[] = [];
  let skipQuestion = false;
  let answer = false;

  readlineSync.setDefaultOptions({
    limit: ['yes', 'no', 'all', 'y', 'n', 'a', 'Y', 'N', 'A'],
  });

  for (const packageName of packageNames) {
    if (!skipQuestion) {
      const answer_ = readlineSync.question(
        `> Migrate ${packageName} to the latest version (y/N/a)? `,
        {
          trueValue: ['yes', 'y', 'Y'],
          falseValue: ['no', 'n', 'N'],
        }
      );

      if (typeof answer_ === 'boolean') {
        answer = Boolean(answer_);
      } else if (answer_ === 'all' || answer_ === 'a' || answer_ === 'A') {
        answer = true;
        skipQuestion = true;
      }
    }

    if (answer) {
      migrate.push(packageName);
    }
  }
  const path = `${root}/migrations.json`;
  let i = 0;
  for (const packageName of migrate) {
    const migratePackageOutput = spawnCommandSync(
      `yarn nx migrate ${packageName}`
    );
    if (migratePackageOutput.error || migratePackageOutput.status) {
      process.exit(1);
    }
    if (fs.existsSync(path)) {
      fs.renameSync(path, path.replace(/\.json$/, `.${i++}.json`));
    }
  }
}

/**
 * Starts migration for all packages defined in the migrations-packages.json that should have been creaed previously.
 */
function startPackagesMigration() {
  const path = `${root}/migrations-packages.json`;
  fs.readFile(path, (error: NodeJS.ErrnoException | null, data?: Buffer) => {
    if (error !== null) {
      console.log(`\n${COLORS.RED}%s${COLORS.DEFAULT}\n%s\n`, 'ERROR', error);
      process.exit(1);
    }

    if (typeof data !== 'undefined') {
      const updatablePackages: UpdatablePackages = JSON.parse(data.toString());

      console.log(
        `\n${COLORS.CYAN}%s${COLORS.DEFAULT}\n%s\n`,
        `Updatable packages (local cache, rerun --check --jsonUpgraded to regenerate if output differs from the subsequent live check)`,
        updatablePackages
      );

      const packageNames = Object.keys(updatablePackages);

      migratePackages(packageNames);
    }
  });
}

/**
 * Reads input, and follows control flow.
 */
function readInputAndRun(): void {
  const check = argv.check;
  const migrate = argv.migrate;
  if (check) {
    const jsonUpgraded = Boolean(argv.jsonUpgraded);
    checkForUpdates(jsonUpgraded);
  } else if (migrate === 'start') {
    startPackagesMigration();
  } else if (migrate === 'execute') {
    void executeMigrations().subscribe();
  } else {
    printUsageInstructions();
  }
}

readInputAndRun();
