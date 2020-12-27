import { AnySchema } from 'joi';
import Path from 'path';
import fs from 'fs';

import { Describe, parseSchema, getAllCustomTypes, typeContentToTs } from './parse';
import { Settings, ConvertedType } from './types';
import { convertFilesInDirectory } from './convertFilesInDirectory';
import { writeTypeFile } from './writeTypeFile';

export { Settings };

export const defaultSettings = (settings: Partial<Settings>): Settings => {
  const appSettings = { ...settings } as Settings;

  if (appSettings.defaultToRequired === undefined) {
    appSettings.defaultToRequired = false;
  }
  if (!appSettings.schemaFileSuffix) {
    appSettings.schemaFileSuffix = 'Schema';
  }
  if (appSettings.debug === undefined) {
    appSettings.debug = false;
  }
  if (!appSettings.fileHeader) {
    appSettings.fileHeader = `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */`;
  }
  if (appSettings.sortPropertiesByName === undefined) {
    appSettings.sortPropertiesByName = true;
  }
  if (appSettings.commentEverything === undefined) {
    appSettings.commentEverything = false;
  }
  return appSettings;
};

export const convertSchema = (settings: Settings, joi: AnySchema, exportedName?: string): ConvertedType | undefined => {
  const details = joi.describe() as Describe;
  const name = details?.flags?.label || exportedName;
  console.log(`index.ts:45~~~~~~~~~~~~~~~~~~~${JSON.stringify(details, null, 4)}~~~~~~~~~~~~~~~~~~~`);
  if (!name) {
    throw new Error(`At least one "object" does not have a .label(). Details: ${JSON.stringify(details)}`);
  }

  // Set the label from the exportedName if missing
  if (!details.flags) {
    details.flags = { label: name };
  } else if (!details.flags.label) {
    // Unable to build any test cases for this line but will keep it if joi.describe() changes
    /* istanbul ignore next */
    details.flags.label = name;
  }

  const parsedSchema = parseSchema(details, settings, false);
  if (parsedSchema) {
    const customTypes = getAllCustomTypes(parsedSchema);
    const content = typeContentToTs(settings.commentEverything, parsedSchema, true);
    return {
      name,
      customTypes,
      content
    };
  }

  // The only type that could return this is alternatives
  // see parseAlternatives for why this is ignored
  /* istanbul ignore next */
  return undefined;
};

export const getTypeFileNameFromSchema = (schemaFileName: string, settings: Settings): string => {
  return schemaFileName.endsWith(`${settings.schemaFileSuffix}.ts`)
    ? schemaFileName.substring(0, schemaFileName.length - `${settings.schemaFileSuffix}.ts`.length)
    : schemaFileName.replace('.ts', '');
};

/**
 * Write index.ts file
 * @param settings Settings Object
 * @param fileNamesToExport list of file names that will be added to the index.ts file
 */
export const writeIndexFile = (settings: Settings, fileNamesToExport: string[]): void => {
  const exportLines = fileNamesToExport.map(fileName => `export * from './${fileName.replace(/\\/g, '/')}';`);
  const fileContent = `${settings.fileHeader}\n\n${exportLines.join('\n').concat('\n')}`;
  fs.writeFileSync(Path.join(settings.typeOutputDirectory, 'index.ts'), fileContent);
};

/**
 * Create types from schemas from a directory
 * @param settings Settings
 */
export const convertFromDirectory = async (settings: Partial<Settings>): Promise<boolean> => {
  const appSettings = defaultSettings(settings);
  const filesInDirectory = await convertFilesInDirectory(appSettings, Path.resolve(appSettings.typeOutputDirectory));

  if (!filesInDirectory.types || filesInDirectory.types.length === 0) {
    throw new Error('No schemas found, cannot generate interfaces');
  }

  for (const exportType of filesInDirectory.types) {
    writeTypeFile(appSettings, exportType.typeFileName, filesInDirectory.types);
  }

  if (appSettings.indexAllToRoot || appSettings.flattenTree) {
    // Write index.ts
    writeIndexFile(appSettings, filesInDirectory.typeFileNames);
  }

  return true;
};
