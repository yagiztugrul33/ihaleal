const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const webRoot = path.resolve(projectRoot, '..');
const webSrc = path.join(webRoot, 'src');

const config = getDefaultConfig(projectRoot);
config.projectRoot = webRoot;

// Web src/lib motorlarını (valuation/borsa/calculators/location) bundle'a dahil et.
config.watchFolders = [...(config.watchFolders ?? []), webRoot, webSrc];

// Web kökündeki node_modules'a da düş — gerekirse paylaşılan paketleri çöz.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(webRoot, 'node_modules'),
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const sourceExts = config.resolver.sourceExts ?? ['ts', 'tsx', 'js', 'jsx', 'json'];
  const tryResolveSourceFile = (basePath) => {
    const platformFirst = platform
      ? sourceExts.map((ext) => `${basePath}.${platform}.${ext}`)
      : [];
    const generic = sourceExts.map((ext) => `${basePath}.${ext}`);
    const candidates = [...platformFirst, ...generic, basePath];
    const found = candidates.find((candidate) => fs.existsSync(candidate));
    return found ? { type: 'sourceFile', filePath: found } : null;
  };

  if (moduleName.startsWith('@/lib/')) {
    const target = path.join(webSrc, 'lib', moduleName.slice('@/lib/'.length));
    const resolved = tryResolveSourceFile(target);
    if (resolved) return resolved;
  }
  if (moduleName.startsWith('@/types/')) {
    const target = path.join(webSrc, 'types', moduleName.slice('@/types/'.length));
    const resolved = tryResolveSourceFile(target);
    if (resolved) return resolved;
  }
  if (moduleName.startsWith('@/assets/')) {
    const target = path.join(projectRoot, 'assets', moduleName.slice('@/assets/'.length));
    return context.resolveRequest(context, target, platform);
  }
  if (moduleName.startsWith('@/')) {
    const target = path.join(projectRoot, 'src', moduleName.slice(2));
    return context.resolveRequest(context, target, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
