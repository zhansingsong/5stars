#!/usr/bin/env node

/**
 * https://www.w3.org/TR/SVG11/single-page.html#masking-EstablishingANewClippingPath
 *
 * A ‘clipPath’ element can contain ‘path’ elements, ‘text’ elements,
 * basic shapes (such as ‘circle’) or a ‘use’ element.If a ‘use’ element
 * is a child of a ‘clipPath’ element, it must directly reference ‘path’,
 * ‘text’ or basic shape elements. Indirect references are an error
 */

const template = (data) => `
<svg class="5stars-svg" id="5stars-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${
  data.isClickMode ? '' : 'data-width="0.5"'
} width="100%" height="100%"
viewBox="${data.viewBox}">
  <!-- Generator: 5stars. https://github.com/zhansingsong/5stars -->
  <defs>
    <clipPath id="5stars-clip">
    <rect x="0" y="0" width="0" height="${data.height}" fill="#000" id="5stars-rect"/>
    </clipPath>
  </defs>
  ${data.normalSymbol}
  ${data.activeSymbol}
  <g>
    ${data.normal}
  </g>
  <g clip-path="url(#5stars-clip)">
    ${data.active}
  </g>
  <script>
    <![CDATA[
      ${data.helper}
      var svg = document.getElementById('5stars-svg');
      var rect = document.getElementById('5stars-rect');
      var percent = svg.getAttribute('data-width');
      ${data.clickLogic}
      rect.style.width = mapToSvgRealWidthPercent(percent) * 100 + '%';
    ]]>
  </script>
</svg>
`;

const { JSDOM } = require('jsdom');
const program = require('commander');
const debug = require('debug')('5stars');
const Ajv = require('ajv');
const path = require('path');
const chalk = require('chalk');
const bluebird = require('bluebird');
const fs = require('./fsPromise');
const request = require('request-promise');
const URL_REGEXP = /^((ht|f)tps?):\/\/([\w-]+(\.[\w-]+)*\/?)+(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?$/; // eslint-disable-line

const svgo = require('./svgo');

// defaults
const defaults = {
  // normal svg file
  normal: undefined,
  // active svg file
  active: undefined,
  // space between stars
  space: 0,
  // width of normal and active svg files
  width: 'auto',
  // height of normal and active svg files
  height: 'auto',
  // output path
  output: './output.svg',
  // if space isn't included on computing svg width.
  computeSpace: false,
  // generation mode: display | click
  mode: 'display'
};
const relativeToCurrentDirectory = (url) => path.join(process.cwd(), url);

const computeSvgWidth = (isNotComputeSpace) =>
  Array(4)
    .fill(0)
    .reduce((sum) => (!isNotComputeSpace ? sum + config.width + config.space : sum + config.width), config.width);

const computeViewBox = () => [0, 0, computeSvgWidth(), config.height].join(' ');

const createUse = (id) =>
  Array(5)
    .fill(0)
    .map(
      (item, index) =>
        `<use ${
          config.mode === 'click'
            ? `class="js-5stars-star" data-percent="${((index + 1) * 0.2).toFixed(1)}" data-n="${index + 1}"`
            : ''
        } xlink:href="#${id}" x="${(config.width + config.space) * index}" y="0" width="${config.width}" />`
    )
    .join('');

const readSvgFile = (svgFile) => {
  const isUrlPath = URL_REGEXP.test(svgFile);
  debug('start to read %s', svgFile);
  return (isUrlPath ? request(svgFile) : fs.readFile(svgFile))
    .then((data) => svgo(data, isUrlPath ? undefined : svgFile))
    .then((fileSvgData) => {
      debug('complete reading %s: %o', svgFile, fileSvgData);
      console.log(
        chalk.greenBright(`${chalk.bold.whiteBright('        ')} complete reading ${chalk.bold.cyan(svgFile)}`)
      );
      return fileSvgData;
    });
};
const generateNewSymbol = (symbolElement, id, preserveAspectRatio) => {
  debug('start to generate symbol element: %s', id);
  const newSymbolElement = symbolElement.createElement('symbol');
  newSymbolElement.setAttribute('viewBox', `${config.minx} ${config.miny} ${config.width} ${config.height}`);
  newSymbolElement.setAttribute('id', id);
  if (preserveAspectRatio) {
    newSymbolElement.setAttribute('preserveAspectRatio', preserveAspectRatio);
  }
  newSymbolElement.innerHTML = symbolElement.querySelector('svg').innerHTML;
  debug('complete %s symbol element generation.', id);
  console.log(
    chalk.greenBright(
      `${chalk.bold.whiteBright('        ')} complete creating new symbol element ${chalk.bold.cyan(id)}`
    )
  );
  return newSymbolElement.outerHTML;
};

const getWidthAndHeightFromViewbox = (viewBox) => {
  const arrayParsed = viewBox.trim().split(/\s+/);
  return {
    minx: arrayParsed[0],
    miny: arrayParsed[1],
    width: arrayParsed[2],
    height: arrayParsed[3]
  };
};

program
  .version('0.0.1', '-v, --version')
  .option('-c, --config [config]', 'config file')
  .option('-a, --normal [normal]', 'normal svg file')
  .option('-b, --active [active]', 'active svg file')
  .option('-s, --space [space]', 'space between stars', (val) => Number(val))
  .option('--width [width]', 'width of normal and active svg files')
  .option('--height [height]', 'height of normal and active svg files')
  .option('-o, --output [output]', 'output path')
  .option('-m, --mode [mode]', 'generation mode')
  .option('-M, --no-compute-space', 'if space is not included on computing svg width.', (val) =>
    val == 'true' ? true : false
  )
  .on('--help', () => {
    console.log(`\n${chalk.bold('Examples:')}\n`);
    console.log(`  ${chalk.bold.yellow('$')} ${chalk.green('5stars')} ${chalk.dim('# use default config.json')}`);
    console.log(`  ${chalk.bold.yellow('$')} ${chalk.green('5stars')} ${chalk.bold.cyan('-c')} yourConfig.json`);
    console.log(`  ${chalk.bold.yellow('$')} ${chalk.green('5stars')} ${chalk.bold.cyan('-a')} star-normal.svg ${chalk.bold.cyan('-b')} star-active.svg`);
    console.log();
  });

program.parse(process.argv);

const schema = require('./schema.json');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const commanderConfig = program.opts();

const keyMapCommandArg = {
  normal: '--normal [normal]',
  active: '--active [active]',
  space: '--space [space]',
  width: '--width [width]',
  height: '--height [height]',
  output: '--output [output]',
  mode: '--mode [mode]',
  computeSpace: '-M, --no-compute-space'
};

const logError = (errors, type) => {
  errors.forEach((er) => {
    let location;
    if (!type) {
      location = `in 5stars ${keyMapCommandArg[er.dataPath.replace('.', '')]}`;
    }
    console.error(
      chalk.red(
        `TypeError："${chalk.redBright.bold(er.dataPath.replace('.', ''))}" ${er.message} in ${chalk.dim(
          type || location
        )}`
      )
    );
  });
};

let defaultConfig = {};
let userConfig = {};
if (commanderConfig.config) {
  const userConfigPath = relativeToCurrentDirectory(commanderConfig.config);
  userConfig = require(userConfigPath);
  const userConfigValid = validate(userConfig);
  if (!userConfigValid) {
    logError(validate.errors, userConfigPath);
    process.exit(1);
  }
} else if (!(commanderConfig.normal && commanderConfig.active)) {
  const defaultConfigPath = relativeToCurrentDirectory('./config.json');
  defaultConfig = require(defaultConfigPath);
  const defaultConfigValid = validate(defaultConfig);
  if (!defaultConfigValid) {
    logError(validate.errors, defaultConfigPath);
    process.exit(1);
  }
}

const commandLineConfig = {};
Object.keys(commanderConfig).forEach((key) => {
  if (commanderConfig[key] && ['version', 'config'].indexOf(key) < 0) {
    commandLineConfig[key] = commanderConfig[key];
  }
});
const commandLineConfigValid = validate(commandLineConfig);
if (!commandLineConfigValid) {
  logError(validate.errors);
  process.exit(1);
}

const config = Object.assign({}, defaults, commandLineConfig, defaultConfig, userConfig);

if (!config.normal || !config.active) {
  throw new Error(
    chalk.bold.redBright(
      `${chalk.yellow([config.normal ? '' : 'normal', config.active ? '' : 'active'].join('、'))} missing.`
    )
  );
}

console.log(chalk.greenBright(`${chalk.bold.whiteBright.bgRed(' 5stars ')} start generating ...`));
bluebird
  .all([readSvgFile(config.normal), readSvgFile(config.active)])
  .spread((starSvgDataA, starSvgDataB) => {
    const domA = new JSDOM(starSvgDataA);
    const domB = new JSDOM(starSvgDataB);
    const symbolElementA = domA.window.document.querySelector('svg');
    const symbolElementB = domB.window.document.querySelector('svg');
    const preserveAspectRatioA = symbolElementA.getAttribute('preserveAspectRatio');
    const preserveAspectRatioB = symbolElementB.getAttribute('preserveAspectRatio');
    const viewBoxA = symbolElementA.getAttribute('viewBox');
    const viewBoxB = symbolElementB.getAttribute('viewBox');
    const objectToviewBoxA = getWidthAndHeightFromViewbox(viewBoxA);
    const objectToviewBoxB = getWidthAndHeightFromViewbox(viewBoxB);
    const widthA = symbolElementA.getAttribute('width');
    const widthB = symbolElementB.getAttribute('width');
    const heightA = symbolElementA.getAttribute('height');
    const heightB = symbolElementB.getAttribute('height');

    if (
      widthA !== widthB ||
      heightA !== heightB ||
      JSON.stringify(objectToviewBoxA) !== JSON.stringify(objectToviewBoxB)
    ) {
      throw new Error(
        chalk.bold.redBright(`${chalk.yellow(config.normal)} and ${chalk.bold.yellow(config.active)} are inconsistent.`)
      );
    }

    if (config.width === 'auto' || config.height === 'auto') {
      config.width = widthA || objectToviewBoxA.width;
      config.height = heightA || objectToviewBoxA.height;

      if (!config.width) {
        throw new Error(chalk.bold.redBright(`${chalk.yellow('width')} is required to specify.`));
      }
      if (!config.height) {
        throw new Error(chalk.bold.redBright(`${chalk.yellow('height')} is required to specify.`));
      }
    }
    config.width = parseFloat(config.width);
    config.height = parseFloat(config.height);
    config.minx = objectToviewBoxA.minx || 0;
    config.miny = objectToviewBoxA.miny || 0;

    const newSymbolElementHtmlStringA = generateNewSymbol(domA.window.document, 'star-a', preserveAspectRatioA);
    const newSymbolElementHtmlStringB = generateNewSymbol(domB.window.document, 'star-b', preserveAspectRatioB);
    return [newSymbolElementHtmlStringA, newSymbolElementHtmlStringB];
  })
  .spread((starA, starB) => {
    debug('start to output: %s', config.output);
    console.log(
      chalk.greenBright(`${chalk.bold.whiteBright('        ')} start to output ${chalk.bold.cyan(config.output)}`)
    );
    const output = template({
      viewBox: computeViewBox(),
      height: config.height,
      width: computeSvgWidth(),
      normalSymbol: starA,
      activeSymbol: starB,
      normal: createUse('star-a'),
      active: createUse('star-b'),
      isClickMode: config.mode === 'click',
      helper: `
        var mapToSvgRealWidthPercent = function (percent) {
          var realWidth = ${computeSvgWidth(config.computeSpace)};
          var totalWidth = ${computeSvgWidth()};
          if(realWidth === totalWidth){
            return percent;
          }
          var width = ${config.width};
          var space = ${config.space};
          var realWidthValue = realWidth * percent;
          var index = Math.ceil( realWidthValue / width);
          var valueWidth = realWidthValue + space * (index - 1);
          return valueWidth / totalWidth;
        }
      `,
      clickLogic:
        config.mode === 'click'
          ? `
        var customStarCallback;
        if(window && window._5stars_click_cb_ && typeof window._5stars_click_cb_ === 'function'){
          customStarCallback = window._5stars_click_cb_;
        }
        var clickStarCallback = function(event){
          var target = event.target;
          var percent = target.getAttribute('data-percent');
          var n = target.getAttribute('data-n');
          if(percent){
            rect.style.width = target.getAttribute('data-percent') * 100 + '%';
            if(customStarCallback && customStarCallback(parseInt(n, 10))){
              svg.removeEventListener('click', clickStarCallback, false);
            }
          }
        }
        svg.addEventListener('click', clickStarCallback, false);
      `
          : `
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
      if(MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
          rect.style.width = mapToSvgRealWidthPercent(svg.dataset.width) * 100 + '%';
        });
        observer.observe(svg, {
          attributes: true,
          attributeOldValue: true,
        });
      }
      `
    });
    fs.writeFileSync(config.output, output);
    debug('complete outputting %s: %s', config.output, output);
    console.log(chalk.greenBright(`${chalk.whiteBright('        ')} done!`));
  })
  .catch((error) => console.error(error.stack));
