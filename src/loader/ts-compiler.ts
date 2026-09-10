import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const defaultCompilerOptions: ts.CompilerOptions = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  declaration: false,
  sourceMap: false,
  removeComments: false,
};

export function transpileModule(code: string, filename: string): string {
  const result = ts.transpileModule(code, {
    compilerOptions: defaultCompilerOptions,
    fileName: filename,
  });
  return result.outputText;
}

export function transpileFile(filePath: string): string {
  const code = fs.readFileSync(filePath, 'utf-8');
  return transpileModule(code, path.basename(filePath));
}

export function rewriteImports(
  code: string,
  options: {
    packageName?: string;
    packagePath?: string;
  } = {}
): string {
  const { packageName = 'manodx', packagePath = '/__manodx' } = options;
  
  let result = code;
  
  result = result.replace(
    new RegExp(`from\\s+['"]${packageName}['"]`, 'g'),
    `from '${packagePath}/framework.js'`
  );
  
  result = result.replace(
    new RegExp(`from\\s+['"]${packageName}/config/([^'"]+)['"]`, 'g'),
    `from '${packagePath}/config/$1'`
  );
  
  result = result.replace(
    /from\s+['"](\.[^'"]+)\.ts['"]/g,
    "from '$1.js'"
  );
  
  result = result.replace(
    /import\s+['"][^'"]+\.css['"];?\n?/g,
    ''
  );
  
  return result;
}

export function transpileForBrowser(
  code: string,
  filename: string,
  options: {
    packageName?: string;
    packagePath?: string;
  } = {}
): string {
  const transpiled = transpileModule(code, filename);
  return rewriteImports(transpiled, options);
}
