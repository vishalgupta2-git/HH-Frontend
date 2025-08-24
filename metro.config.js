const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for GLB and other 3D model files
config.resolver.assetExts.push('glb', 'gltf', 'obj', 'fbx', 'dae');

// Configure asset handling for 3D models
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
