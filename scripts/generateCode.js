const argv = require('yargs').argv;
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const [type, name] = argv._;

const UIDirectoryPath = path.resolve(__dirname, '../client/src/components/UI');

const generateUiElement = () => {
  console.log(`Generating ${chalk.green(name)} ui element..`);

  const elementPath = path.resolve(UIDirectoryPath, name);

  if (fs.existsSync(elementPath)) {
    console.error(
      `${name} seems to be already existing. Let's not override it`
    );
  }

  fs.mkdirSync(elementPath);

  fs.appendFileSync(
    path.resolve(UIDirectoryPath, 'index.tsx'),
    `export { ${name} } from './${name}';\n`,
    'utf8'
  );

  fs.writeFileSync(
    path.resolve(elementPath, `index.tsx`),
    `export { ${name} } from './${name}';\n`,
    'utf8'
  );

  fs.writeFileSync(
    path.resolve(elementPath, `${name}.css`),
    `.${name} {\n  \n}\n`,
    'utf8'
  );

  fs.writeFileSync(
    path.resolve(elementPath, `${name}.tsx`),
    `import './${name}.css';

import React from 'react';
import c from 'classnames';

interface ${name}Props {
  className?: string;
}

export const ${name}: React.FC<${name}Props> = ({ className = '', ...rest }) => {
  const classes = c('${name}', className);

  return <span className={classes} {...rest}></span>;
};

${name}.defaultProps = {
  className: ''
};\n`,
    'utf8'
  );
};

switch (type) {
  case 'ui': {
    generateUiElement();
    break;
  }
  default:
    console.warn('didnt recognize command');
}
