const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const webRoot = path.resolve(projectRoot, '..');
const webSrc = path.join(webRoot, 'src');

const config = getDefaultConfig(projectRoot);

// Web src/lib motorlarını (valuation/borsa/calculators/location) bundle'a dahil et.
config.watchFolders = [...(config.watchFolders ?? []), webSrc];

// Web kökündeki node_modules'a da düş — gerekirse paylaşılan paketleri çöz.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(webRoot, 'node_modules'),
];

module.exports = config;
