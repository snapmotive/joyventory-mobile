const { getDefaultConfig } = require('expo/metro-config'); const path = require('path'); const projectRoot = __dirname; const nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')]; const config = getDefaultConfig(__dirname); config.watchFolders = [projectRoot, ...nodeModulesPaths]; config.resolver.nodeModulesPaths = nodeModulesPaths; config.resolver.disableHierarchicalLookup = true; config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json']; module.exports = config;
