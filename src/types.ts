/**
 * Application settings
 */
export interface Settings {
  /**
   * The input/schema directory
   * Directory must exist
   */
  schemaDirectory: string;
  /**
   * The output/type directory
   * Will also attempt to create this directory
   */
  typeOutputDirectory: string;
  /**
   * Should interface properties be defaulted to optional or required
   */
  defaultToRequired: boolean;
  /**
   * What schema file name suffix will be removed when creating the interface file name
   * Defaults to `Schema`
   * This ensures that an interface and Schema with the file name are not confused
   */
  schemaFileSuffix: string;
  /**
   * If `true` the console will include more information
   */
  debug: boolean;
  /**
   * File Header content for generated files
   */
  fileHeader: string;
  /**
   * If true will sort properties on interface by name
   * Defaults to `true`
   */
  sortPropertiesByName: boolean;
  /**
   * If true will not output to subDirectories in output/interface directory. It will flatten the structure.
   */
  flattenTree: boolean;
  /**
   * If true will only read the files in the root directory of the input/schema directory. Will not parse through sub-directories.
   */
  rootDirectoryOnly: boolean;
  /**
   * If true will write all exports *'s to root index.ts in output/interface directory.
   */
  indexAllToRoot: boolean;
  /**
   * Comment every interface and property even with just a duplicate of the interface and property name
   * Defaults to `false`
   */
  commentEverything: boolean;
}

export interface ConvertedType {
  name: string;
  content: string;
  customTypes: string[];
  location?: string;
}

export interface BaseTypeContent {
  /**
   * Interface, property, or type name (from label or key name)
   */
  name?: string;

  /**
   * will add this to the jsDoc output
   */
  description?: string;

  /**
   * If this is an object property is it required, optional or forbidden
   */
  presence?: 'optional' | 'required' | 'forbidden';
}

/**
 * Holds multiple TypeContents that will be joined together
 */
export interface TypeContentRoot extends BaseTypeContent {
  __isRoot: true;
  /**
   * How to join the children types together
   */
  joinOperation: 'list' | 'union' | 'intersection' | 'object';

  /**
   * Children types
   */
  children: TypeContent[];
}

/**
 * A single type
 */
export interface TypeContentChild extends BaseTypeContent {
  __isRoot: false;

  /**
   * Other non-basic schemas referenced in this type
   */
  customTypes?: string[];

  /**
   * The typescript result ex: string, 'literalString', 42, SomeTypeName
   */
  content: string;
}

export function makeTypeContentChild({
  content,
  customTypes,
  presence,
  name,
  description
}: Omit<TypeContentChild, '__isRoot'>): TypeContentChild {
  return {
    __isRoot: false,
    content,
    customTypes,
    presence,
    name,
    description
  };
}

export function makeTypeContentRoot({
  joinOperation,
  name,
  children,
  presence,
  description
}: Omit<TypeContentRoot, '__isRoot'>): TypeContentRoot {
  return {
    __isRoot: true,
    joinOperation,
    name,
    children,
    presence,
    description
  };
}

/**
 * Holds information for conversion to ts
 */
export type TypeContent = TypeContentRoot | TypeContentChild;

/**
 * Basic info on a joi schema
 */
export interface BasicJoiType {
  /**
   * number, string literals, Joi.label, etc
   */
  type: string;
  /**
   * Other schemas referenced in this schema
   */
  customTypes?: string[];
  /**
   * The typescript result
   */
  content: string;
}

export interface Property extends BasicJoiType {
  /**
   * The object key this schema was stored under
   */
  name: string;
}

export interface GenerateTypeFile {
  /**
   * External Types required by File
   */
  externalTypes: ConvertedType[];
  /**
   * Internal Types provided by File
   */
  internalTypes: ConvertedType[];
  /**
   * Contents of file exported.
   */
  fileContent: string;
  /**
   * File Name of file exported.
   */
  typeFileName: string;

  /**
   * File Location of where file is exported.
   */
  typeFileLocation: string;
}

export interface GenerateTypesDir {
  /**
   * Types generated in Directory/SubDirectory
   */
  types: GenerateTypeFile[];
  /**
   * FileNames of files exported.
   */
  typeFileNames: string[];
}
