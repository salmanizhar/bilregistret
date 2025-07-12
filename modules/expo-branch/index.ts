// Reexport the native module. On web, it will be resolved to ExpoBranchModule.web.ts
// and on native platforms to ExpoBranchModule.ts
export { default } from './src/ExpoBranchModule';
export { default as ExpoBranchView } from './src/ExpoBranchView';
export * from  './src/ExpoBranch.types';
