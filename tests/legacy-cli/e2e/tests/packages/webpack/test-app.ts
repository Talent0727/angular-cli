import { normalize } from 'path';
import { createProjectFromAsset } from '../../../utils/assets';
import { expectFileSizeToBeUnder, expectFileToMatch, replaceInFile } from '../../../utils/fs';
import { exec } from '../../../utils/process';

export default async function (skipCleaning: () => void) {
  const webpackCLIBin = normalize('node_modules/.bin/webpack-cli');

  await createProjectFromAsset('webpack/test-app');

  await exec(webpackCLIBin);

  // Note: these sizes are without Build Optimizer or any advanced optimizations in the CLI.
  await expectFileSizeToBeUnder('dist/app.main.js', 656 * 1024);
  await expectFileSizeToBeUnder('dist/501.app.main.js', 1 * 1024);
  await expectFileSizeToBeUnder('dist/888.app.main.js', 2 * 1024);
  await expectFileSizeToBeUnder('dist/972.app.main.js', 2 * 1024);


  // test resource urls without ./
  await replaceInFile('app/app.component.ts', './app.component.html', 'app.component.html');
  await replaceInFile('app/app.component.ts', './app.component.scss', 'app.component.scss');

  // test the inclusion of metadata
  // This build also test resource URLs without ./
  await exec(webpackCLIBin, '--mode=development');
  await expectFileToMatch('dist/app.main.js', 'AppModule');

  skipCleaning();
}
