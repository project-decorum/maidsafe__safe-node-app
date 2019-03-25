// Type definitions for @maidsafe/safe-node-app 0.8.1
// Project: https://github.com/maidsafe/safe_app_nodejs
// Definitions by: Benno Zeeman <https://github.com/b-zee>

/// <reference types="node" />

// TODO: Update JSdoc to match

declare module '@maidsafe/safe-node-app/src/api/emulations/nfs' {
  import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';
  import { CONSTANTS } from '@maidsafe/safe-node-app';

  /**
   * A NFS-style NfsFile
   *
   * _Note_: As this application layer, the network does not check any of the
   * metadata provided.
   */
  class NfsFile {
    constructor(ref: any);

    /**
     * XOR address of file's underlying {@link ImmutableData} data map
     */
    dataMapName: Buffer;

    /**
     * Get metadata passed during file insertion of update
     */
    userMetadata: Buffer;

    /**
     * Get UTC date of file context creation
     */
    created: Date;

    /**
     * Get UTC date of file context modification
     */
    modified: Date;

    /**
     * Get file size
     * 
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const asyncFn = async () => {
     *   try {
     *     const nfs = await mData.emulateAs('NFS');
     *     const fileContext = await nfs.create('<buffer or string>');
     *     const fileSize = await fileContext.size();
     *   } catch (err) {
     *     throw err;
     *   }
     * };
     */
    size(): Promise<number>;

    /**
     * Read the file.
     * CONSTANTS.NFS_FILE_START and CONSTANTS.NFS_FILE_END may be used
     * to read the entire content of the file. These constants are
     * exposed by the safe-app-nodejs package.
     * 
     * @throws {ERR_FILE_NOT_FOUND}
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const position = safe.CONSTANTS.NFS_FILE_START;
     * const len = safe.CONSTANTS.NFS_FILE_END;
     * const openMode = safe.CONSTANTS.NFS_FILE_MODE_READ;
     * const asyncFn = async () => {
     *   try {
     *     const nfs = await mData.emulateAs('NFS');
     *     let fileContext = await nfs.create('<buffer or string>');
     *     fileContext = await nfs.open(fileContext, openMode);
     *     const data = await fileContext.read(position, len);
     *   } catch (err) {
     *     throw err;
     *   }
     * };
     */
    read(position: number | CONSTANTS.MD_ENTRIES_EMPTY, len: number | CONSTANTS.NFS_FILE_END): Promise<[Buffer, number]>;

    /**
     * Write file. Does not commit file to network.
     * 
     * @throws {ERR_FILE_NOT_FOUND}
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const asyncFn = async () => {
     *     try {
     *         const nfs = await mData.emulateAs('NFS');
     *         const fileContext = await nfs.open();
     *         await fileContext.write('<buffer or string>');
     *     } catch (err) {
     *         throw err;
     *     }
     * };
     */
    write(content: Buffer | string): Promise<void>;

    /**
     * Close file and commit to network.
     * 
     * @throws {ERR_FILE_NOT_FOUND}
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const content = '<html><body><h1>WebSite</h1></body></html>';
     * const asyncFn = async () => {
     *     try {
     *         const nfs = await mData.emulateAs('NFS');
     *         const fileContext = await nfs.open();
     *         await fileContext.write('<buffer or string>');
     *         await fileContext.close();
     *     } catch (err) {
     *         throw err;
     *     }
     * };
     */
    close(): Promise<void>;

    /**
     * Which version was this? Equals the underlying MutableData's entry version.
     */
    version: number;
  }

  /**
   * NFS emulation on top of a {@link MutableData}
   */
  class NFS {
    /**
     * Instantiate the NFS emulation layer rapping a MutableData instance
     */
    constructor(mData: MutableData);

    /**
     * Helper function to create and save file to the network
     * 
     * @returns a newly created file
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const content = '<html><body><h1>WebSite</h1></body></html>';
     * const asyncFn = async () => {
     *     try {
     *       const nfs = await mData.emulateAs('NFS');
     *       const fileContext = await nfs.create(content);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    create(content: string | Buffer): Promise<NfsFile>;

    /**
     * Find the file of the given filename (aka keyName in the MutableData)
     * 
     * @param fileName - the path/file name
     * @returns the file found for that path
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const content = '<html><body><h1>WebSite</h1></body></html>';
     * const asyncFn = async () => {
     *     const fileName = 'index.html';
     *     try {
     *       const nfs = await mData.emulateAs('NFS');
     *       const fileContext = await nfs.create(content);
     *       await nfs.insert(fileName, fileContext);
     *       const fileContext = await nfs.fetch(fileName);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    fetch(fileName: string): Promise<NfsFile>;

    /**
     * Insert the given file into the underlying {@link MutableData}, directly commit
     * to the network.
     *
     * _Note_: As this application layer, the network does not check any
     * of the metadata provided.
     * 
     * @param fileName The path to store the file under
     * @param file The file to serialise and store
     * @param userMetadata
     * @returns The same file
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const content = '<html><body><h1>WebSite</h1></body></html>';
     * const userMetadata = 'text/html';
     * const asyncFn = async () => {
     *     try {
     *       const nfs = await mData.emulateAs('NFS');
     *       let fileContext = await nfs.create(content);
     *       const fileName = 'index.html';
     *       fileContext = await nfs.insert(fileName, fileContext, userMetadata);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    insert(fileName: string | Buffer, file: NfsFile, userMetadata?: string | Buffer): Promise<NfsFile>;

    /**
     * Replace a path with a new file. Directly commit to the network.
     *
     * CONSTANTS.GET_NEXT_VERSION: Applies update to next file version.
     *
     * _Note_: As this application layer, the network does not check any
     * of the metadata provided.
     * 
     * @param fileName the path to store the file under
     * @param file - the file to serialise and store
     * @param version the version successor number
     * @param userMetadata optional parameter for updating user metadata
     * @returns the same file
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const content = '<html><body><h1>Updated WebSite</h1></body></html>';
     * const userMetadata = 'text/html';
     * const asyncFn = async () => {
     *     try {
     *       const version = safe.CONSTANTS.GET_NEXT_VERSION;
     *       const nfs = await mData.emulateAs('NFS');
     *       const fileContext = await nfs.create(content);
     *       const fileName = 'index.html';
     *       fileContext = await nfs.update(fileName, fileContext, version + 1, userMetadata);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    update(fileName: string | Buffer, file: NfsFile, version: number | CONSTANTS.GET_NEXT_VERSION, userMetadata: string | Buffer): Promise<NfsFile>;

    /**
     * Delete a file from path. Directly commit to the network.
     * 
     * @param fileName
     * @param version the version successor number
     * @returns version of deleted file
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const content = '<html><body><h1>Updated WebSite</h1></body></html>';
     * const fileName = 'index.html';
     * const asyncFn = async () => {
     *     try {
     *       const version = await mData.getVersion();
     *       const nfs = await mData.emulateAs('NFS');
     *       const fileContext = await nfs.create(content);
     *       fileContext = await nfs.insert(fileName, fileContext);
     *       const version = await nfs.delete(fileName, version + 1);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    delete(fileName: string | Buffer, version: number): Promise<number>;

    /**
     * Open a file for reading or writing.
     *
     * Open modes (these constants are exported by the safe-app-nodejs package):
     *
     * CONSTANTS.NFS_FILE_MODE_OVERWRITE: Replaces the entire content of the file when writing data.
     *
     * CONSTANTS.NFS_FILE_MODE_APPEND: Appends to existing data in the file.
     *
     * CONSTANTS.NFS_FILE_MODE_READ: Open file to read.
     *
     * @param file If no {@link File} is passed, then a new instance is created in {@link CONSTANTS.NFS_FILE_MODE_OVERWRITE}
     * @param openMode defaults to CONSTANTS.NFS_FILE_MODE_OVERWRITE
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const asyncFn = async () => {
     *     try {
     *       const nfs = await mData.emulateAs('NFS');
     *       const fileContext = await nfs.open();
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    open(file: NfsFile | undefined | null, openMode?: number | CONSTANTS.NFS_FILE_MODE_OVERWRITE | CONSTANTS.NFS_FILE_MODE_APPEND | CONSTANTS.NFS_FILE_MODE_READ): Promise<NfsFile>;
  }
}

// TODO: FIX RDFLIB RETURN TYPES
declare module '@maidsafe/safe-node-app/src/api/emulations/rdf' {
  import { MutableData, NameAndTag } from '@maidsafe/safe-node-app/src/api/mutable';
  import { CONSTANTS } from '@maidsafe/safe-node-app';

  /**
   * RDF Emulation on top of a MutableData
   */
  class RDF {
    public mData: MutableData;

    public graphStore: any;

    public id: any;

    public vocabs: any;

    /**
     * Instantiate the RDF emulation layer wrapping a MutableData instance
     * 
     * @param mData the MutableData to wrap around
     */
    constructor(mData: MutableData);

    /**
     * @param id 
     */
    setId(id: any): void;

    /**
     * @param ids list of id's to fetch e.g. ['safe://mywebid.mypubname', ...]
     */
    nowOrWhenFetched(ids?: string[]): Promise<any>;

    /**
     * @param uri 
     */
    namespace(uri: any): any;

    /**
     * @param value Literal value
     * @param languageOrDatatype Either i18n language tag or XSD URI data type
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const asyncFn = async () => {
     *   try {
     *     const rdf = await mData.emulateAs('RDF');
     *     const discoveryDate = new Date("18 Feb 1930");
     *     const dateTimeDataType = "http://www.w3.org/2001/XMLSchema#dateTime";
     *     let literalNode = rdf.literal(discoveryDate.toISOString(), dateTimeDataType);
     *     console.log( JSON.stringify(literalNode) );
     *
     *     // Alternatively
     *     literalNode = rdf.literal("Aardvark", "en-US");
     *     console.log( JSON.stringify(literalNode) );
     *   } catch (err) {
     *     throw err;
     *   }
     * };
     */
    literal(value: string | number, languageOrDatatype?: string): any;

    /**
     * @param nodes 
     */
    collection(nodes: any): any;

    bnode(): any;

    /**
     * @param uri 
     */
    sym(uri: any): any;

    /**
     * @param subject 
     * @param predicate 
     * @param object 
     */
    any(subject: any, predicate: any, object: any, provenance: any): any;

    /**
     * @param subject 
     * @param predicate 
     * @param object 
     */
    each(subject: any, predicate: any, object: any, provenance: any): any;

    /**
     * @param subject 
     * @param predicate 
     * @param object 
     */
    statementsMatching(subject: any, predicate: any, object: any, provenance: any): any;

    /**
     * @param subject 
     * @param predicate 
     * @param object 
     */
    removeMany(subject: any, predicate: any, object: any, provenance: any): any;

    /**
     * @param data 
     * @param mimeType 
     * @param id 
     */
    parse(data: any, mimeType: any, id: any, provenance: any): any;

    /**
     * @param subject
     * @param predicate
     * @param object
     */
    add(subject: any, predicate: any, object: any, provenance: any): any;

    /**
     * @param mimeType 
     */
    serialise(mimeType: any): Promise<unknown>;

    /**
     * Commit the RDF document to the underlying MutableData on the network
     * 
     * @param toEncrypt 
     */
    commit(toEncrypt?: boolean): Promise<NameAndTag>;

    /**
     * Append the triples to the RDF document into the underlying MutableData on the network
     */
    append(): Promise<NameAndTag>;
  }
}



declare module '@maidsafe/safe-node-app/src/api/emulations/web_id' {
  import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';
  import { RDF } from '@maidsafe/safe-node-app/src/api/emulations/rdf';

  /**
   * WebID Emulation on top of a MutableData using RDF emulation
   */
  class WebID {
    public mData: MutableData;

    public rdf: RDF;

    public vocabs: any;

    /**
     * Instantiate the WebID emulation layer wrapping a MutableData instance,
     * while making use of the RDF emulation to manipulate the MD entries
     * 
     * @param mData the MutableData to wrap around
     */
    constructor(mData: MutableData);

    /**
     * Initialises WebID interface by emulating underlying {@link MutableData}
     * as RDF and sets common namespace prefixes on instance
     */
    init(): void;
    
    /**
     * Fetches committed WebId data from underlying MutableData and loads in graph store
     * 
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const asyncFn = async () => {
     *   try {
     *       const webid = await mData.emulateAs('WebId');
     *       await webid.fetchContent();
     *   } catch(err) {
     *       throw err;
     *   }
     * };
     */
    fetchContent(): Promise<any>;

    /**
     * Creates WebId as RDF data and commits to underlying MutableData
     * 
     * @param profile
     * @param nick profile.nick
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const profile = {
     *     nick: "safedev",
     *     name: "SAFENetwork Developer",
     *     uri: "safe://id.safedev"
     * };
     * const asyncFn = async () => {
     *   try {
     *       const webid = await mData.emulateAs('WebId');
     *       await webid.create(profile, profile.nick);
     *   } catch(err) {
     *       throw err;
     *   }
     * };
     */
    create(profile: any, displayName?: string): Promise<any>;

    /**
     * Updates WebId as RDF data and commits to underlying MutableData
     * 
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const profile = {
     *     nick: "safedev",
     *     name: "SAFENetwork Developer",
     *     uri: "safe://id.safedev"
     * };
     * const asyncFn = async () => {
     *   try {
     *       const webid = await mData.emulateAs('WebId');
     *       await webid.create(profile, profile.nick);
     *       let updatedProfile = Object.assign({}, profile, { name: "Alexander Fleming" });
     *       await webid.update(profile);
     *   } catch(err) {
     *       throw err;
     *   }
     * };
     */
    update(profile: any): Promise<any>;

    /**
     * Serialises WebId RDF data
     * 
     * @returns RDF document according to mime type
     * @example
     * // Assumes {@link MutableData} interface has been obtained
     * const mimeType = "text/turtle";
     * const profile = {
     *     nick: "safedev",
     *     name: "SAFENetwork Developer",
     *     uri: "safe://id.safedev"
     * };
     * const asyncFn = async () => {
     *   try {
     *       const webid = await mData.emulateAs('WebId');
     *       await webid.create(profile, profile.nick);
     *       const serialised = await webid.serialise(mimeType);
     *   } catch(err) {
     *       throw err;
     *   }
     * };
     */
    serialise(mimeType: string): Promise<string>;
  }
}


declare module '@maidsafe/safe-node-app/src/api/cipher_opt' {
  import { PubEncKey } from '@maidsafe/safe-node-app/src/api/crypto';

  /**
   * Holds the reference to a Cipher Options, either PlainText, Symmetric or Asymmetric
   */
  export class CipherOpt { }

  /**
   * Provides encryption methods for committing {@link ImmutableData}
   */
  export class CipherOptInterface {
    /**
     * Create a plaintext cipher
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const cipherOpt = await app.cipherOpt.newPlainText();
     *     const immdWriter = await app.immutableData.create();
     *     await idWriter.write('<public file buffer data>');
     *     const idAddress = await idWriter.close(cipherOpt);
     * };
     */
    newPlainText(): Promise<CipherOpt>;

    /**
     * Create a new symmetric cipher
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const cipherOpt = await app.cipherOpt.newSymmetric();
     *     const immdWriter = await app.immutableData.create();
     *     await idWriter.write('Data for my eyes only.');
     *     const idAddress = await idWriter.close(cipherOpt);
     * };
     */
    newSymmetric(): Promise<CipherOpt>;

    /**
     * Create a new Asymmetric Cipher for the given public encryption key
     * @param pubEncKey
     * @throws {MISSING_PUB_ENC_KEY}
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     // For this example you're encrypting data with our own public encryption key,
     *     // which only you will be able to deciper, however,
     *     // the use case is for encrypting with the intended recipient's public encryption key.
     *     const pubEncKey = await app.crypto.getAppPubEncKey();
     *     const cipherOpt = await app.cipherOpt.newAsymmetric(pubEncKey);
     *     const immdWriter = await app.immutableData.create();
     *     const data = 'Data only decipherable by the holder of the private encryption key
     *     which is paired to the public encryption key supplied to asymmetric cipher.';
     *     await idWriter.write(data);
     *     const idAddress = await idWriter.close(cipherOpt);
     * };
     */
    newAsymmetric(pubEncKey: PubEncKey): Promise<CipherOpt>;
  }
}

declare module '@maidsafe/safe-node-app/src/web_fetch' {
  import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';

  /**
   * holds additional options for the `webFetch` function.
   */
  interface WebFetchOptions {
    /**
     * range of bytes to be retrieved.
     * The `start` attribute is expected to be the start offset, while the `end`
     * attribute of the `range` object the end position (both inclusive) to be
     * retrieved, e.g. with `range: { start: 2, end: 3 }` the 3rd and 4th bytes
     * of data will be retrieved. If `end` is not specified, the bytes retrived
     * will be from the `start` offset untill the end of the file. The ranges
     * values are also used to populate the `Content-Range` and `Content-Length`
     * headers in the response.
     */
    range: { start: number, end: number };
  }

  /**
   * holds information about a network resource fetched from a `safe://`-URL
   */
  interface NetworkResource {
    /**
     * the network resource object
     */
    content: MutableData;
    
    /**
     * the type of the resource fetched, e.g. 'NFS'
     */
    resourceType: string;
    
    /**
     * the parsed path from the provided URL
     */
    parsedPath: any;

    /**
     * Undocumented property. (@b-zee)
     */
    mimeType: string;
  }
}

declare module '@maidsafe/safe-node-app/src/app' {
  import { AuthInterface } from '@maidsafe/safe-node-app/src/api/auth';
  import { CryptoInterface } from '@maidsafe/safe-node-app/src/api/crypto';
  import { CipherOptInterface } from '@maidsafe/safe-node-app/src/api/cipher_opt';
  import { ImmutableDataInterface } from '@maidsafe/safe-node-app/src/api/immutable';
  import { MutableDataInterface } from '@maidsafe/safe-node-app/src/api/mutable';
  import { WebInterface } from '@maidsafe/safe-node-app/src/api/web';
  import { WebFetchOptions, NetworkResource } from '@maidsafe/safe-node-app/src/web_fetch';
  import { AppInfo, InitOptions } from '@maidsafe/safe-node-app';

  /**
   * Holds the information about the account.
   */
  interface AccountInfo {
    /**
     * number of mutations performed with this account
     */
    mutations_done: number;

    /**
     * number of remaining mutations allowed for this account
     */
    mutations_available: number;
  }

  /**
   * Holds one sessions with the network and is the primary interface to interact
   * with the network. As such it also provides all API-Providers connected through
   * this session.
   */
  class SAFEApp {
    /**
     * get the AuthInterface instance connected to this session
     */
    auth: AuthInterface;

    /**
     * get the Crypto instance connected to this session
     */
    crypto: CryptoInterface;

    /**
     * get the CipherOptInterface instance connected to this session
     */
    cipherOpt: CipherOptInterface;

    /**
     * get the ImmutableDataInterface instance connected to this session
     */
    immutableData: ImmutableDataInterface;

    /**
     * get the MutableDataInterface instance connected to this session
     */
    mutableData: MutableDataInterface;

    /**
     * Manage Web RDF Data.
     */
    web: WebInterface;

    /**
     * Helper to lookup a given `safe://`-url in accordance with the convention
     * and find the requested object.
     *
     * @param url the url you want to fetch
     * @param options additional options
     * @returns the object with body of content and headers
     */
    webFetch(url: string, options?: WebFetchOptions): Promise<{ body: string, headers: any }>;

    /**
    * Experimental function to lookup a given `safe://`-URL in accordance with the
    * public name resolution and find the requested network resource.
    *
    * @param url the url you want to fetch
    * @returns the network resource found from the passed URL
    */
    fetch(url: string): Promise<NetworkResource>;

    /**
     * Returns true if current network connection state is INIT.
     * This is state means the library has been initialised but there is no
     * connection made with the network yet.
     */
    isNetStateInit(): boolean;

    /**
     * Returns true if current network connection state is CONNECTED.
     */
    isNetStateConnected(): boolean;

    /**
     * Returns true if current network connection state is DISCONNECTED.
     */
    isNetStateDisconnected(): boolean;

    /**
     * The current appInfo
     */
    appInfo: AppInfo;

    /**
     * Generate the log path for the provided filename. If the filename provided
     * is null, it then returns the path of where the safe_core log file is
     * located.
     *
     * @param logFilename optional log filename to generate the path
     */
    logPath(logFilename?: string): Promise<String>;

    /**
     * Returns account information, e.g. number of mutations done and available.
     */
    getAccountInfo(): Promise<AccountInfo>;

    /**
     * Create a SAFEApp and try to login it through the `authUri`
     *
     * @param appInfo the AppInfo
     * @param authUri URI containing the authentication info
     * @param networkStateCallBack optional callback function to receive network state updates
     * @param initialisation options
     * @returns authenticated and connected SAFEApp
     */
    static fromAuthUri(appInfo: AppInfo, authUri: string, networkStateCallBack?: () => any, initialisation?: InitOptions): Promise<SAFEApp>;

    /**
     * Returns the name of the app's own container.
     */
    getOwnContainerName(): Promise<string>;

    /**
     * Reconnect to the metwork
     * Must be invoked when the client decides to connect back after the connection was lost.
     */
    reconnect(): void;

    /**
     * Resets the object cache kept by the underlyging library.
     */
    clearanyCache(): void;

    /**
     * @returns true if the underlyging library was compiled against mock-routing.
     */
    appIsMock(): boolean;
  }
}

declare module '@maidsafe/safe-node-app/src/api/immutable' {
  import { CipherOpt } from '@maidsafe/safe-node-app/src/api/cipher_opt';
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

  /**
   * {@link ImmutableDataInterface} reader
   */
  class Reader {
    /**
     * Holds the connection to read an existing ImmutableData
     */
    constructor();

    /**
     * Read the given amount of bytes from the network
     * 
     * @param options [options.offset=0] start position. [options.end=size] end position or end of data.
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const readOptions =
     *     {
     *         offset: 0, // starts reading from this byte position
     *         end: null // ends reading at this byte position
     *     };
     *     try {
     *         const iDataReader = await app.immutableData.fetch(iDataAddress)
     *         const data = await iDataReader.read(readOptions)
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    read(options?: { offset: number, end: number }): Promise<Buffer>;

    /**
     * The size of the immutable data on the network
     * @returns length in bytes
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     try {
     *         const size = await iDataReader.size()
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    size(): Promise<number>;

    /**
     * Get the XOR-URL of the {@link ImmutableDataInterface}.
     *
     * @param mimeType (experimental) the MIME type to encode in the XOR-URL as
     * the codec of the content
     * @returns The XOR-URL of the ImmutableData.
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     try {
     *         const cipherOpt = await app.cipherOpt.newPlainText();
     *         const iDataWriter = await app.immutableData.create()
     *         const data = `Most proteins are glycosylated.
     *         Mass spectrometry methods are used for mapping glycoprotein.`;
     *         await iDataWriter.write(data);
     *         const iDataAddress = await iDataWriter.close(cipherOpt);
     *         const idReader = await app.immutableData.fetch(iDataAddress);
     *         const mimeType = 'text/plain';
     *         const xorUrl = idReader.getXorUrl(mimeType);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    getXorUrl(mimeType: string): string;
  }

  /**
   * Holds an Immutable Data Writer
   */
  class Writer {
    /**
     * Append the given data to {@link ImmutableDataInterface}. This does not commit data to network.
     *
     * @param data The string or buffer to write
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     try {
     *         const iDataWriter = await app.immutableData.create()
     *         const data = `Most proteins are glycosylated.
     *         Mass spectrometry methods are used for mapping glycoprotein.`;
     *         await iDataWriter.write(data);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    write(data: string | Buffer): Promise<void>;

    /**
     * Close and commit the {@link ImmutableDataInterface} to the network.
     *
     * @param cipherOpt The cipher method with which to encrypt data
     * @param getXorUrl (experimental) if the XOR-URL shall also be returned along with the xor address
     * @param mimeType (experimental) the MIME type to encode in the XOR-URL as the codec of the content
     * @returns  The XOR address to the data once written to the network, or an object that contains both the XOR address and XOR URL.
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     try {
     *         const cipherOpt = await app.cipherOpt.newPlainText();
     *         const iDataWriter = await app.immutableData.create()
     *         const data = `Most proteins are glycosylated.
     *         Mass spectrometry methods are used for mapping glycoprotein.`;
     *         await iDataWriter.write(data);
     *         const iDataAddress = await iDataWriter.close(cipherOpt);
     *
     *         // Alternatively:
     *         // const getXorUrl = true;
     *         // const mimeType = 'text/plain';
     *         // const iDataMeta = await iDataWriter.close(cipherOpt, getXorUrl, mimeType);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    close(cipherOpt: CipherOpt, getXorUrl?: boolean, mimeType?: string): Promise<Buffer | { name: Buffer, xorUrl: String }>;
  }

  /**
   * Interact with Immutable Data of the Network through this Interface.
   *
   * Access it through your {SAFEApp} instance under `app.immutableData`
   */
  class ImmutableDataInterface {
    /**
     * Interact with Immutable Data of the Network through this Interface.
     *
     * Access it through your {SAFEApp} instance under `app.immutableData`
     */
    constructor(app: SAFEApp);

    /**
     * Create a new {@link ImmutableDataInterface} writer
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     try {
     *         const iDataWriter = await app.immutableData.create()
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    create(): Promise<Writer>;

    /**
     * Look up an existing {@link ImmutableDataInterface} for the given address
     * 
     * @param address XOR address
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     try {
     *         const iDataReader = await app.immutableData.fetch(iDataAddress);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    fetch(address: Buffer): Promise<Reader>;
  }
}

declare module '@maidsafe/safe-node-app/src/api/mutable' {
  import { CONSTANTS } from '@maidsafe/safe-node-app';
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
  import { PubSignKey } from '@maidsafe/safe-node-app/src/api/crypto';
  import { NFS } from '@maidsafe/safe-node-app/src/api/emulations/nfs';
  import { RDF } from '@maidsafe/safe-node-app/src/api/emulations/rdf';
  import { WebID } from '@maidsafe/safe-node-app/src/api/emulations/web_id';

  /**
   * Holds the permissions of a MutableData object
   */
  class Permissions {

    /**
     * Total number of permission entries
     *
     * @returns number of entries
     */
    len(): Promise<number>;

    /**
     * Lookup the permissions of a specifc key
     *
     * @param signKey The key to lookup for. Defaults to USER_ANYONE.
     * @returns the permission set for that key
     */
    getPermissionSet(signKey?: PubSignKey | CONSTANTS.USER_ANYONE): Promise<any>;

    /**
     * Insert a new permission set mapped to a specifc key. Directly commits to
     * the network. Requires 'ManagePermissions'-Permission for the app.
     *
     * @param signKey The key to map to. (Defaults to USER_ANYONE.)
     * @param permissionSet The permission set to insert.
     * @returns once finished
     */
    insertPermissionSet(signKey: PubSignKey | CONSTANTS.USER_ANYONE, permissionSet: any): Promise<void>;

    /**
     * Return the list of all associated permission sets.
     *
     * @returns the list of permission sets
     */
    listPermissionSets(): Promise<Array<any>>;

  }

  /**
   * Holds a mutations to be done to the entries within one
   * transaction on the network.
   *
   * You need this whenever you want to change the content of
   * the entries.
   */
  class EntryMutationTransaction {
    /**
     * Store a new `Insert`-Action in the transaction to store a new entry.
     *
     * @param keyName the key you want to insert
     * @param value the value you want to insert
     * @returns resolves once the storing is done
     */
    insert(keyName: string | Buffer, value: string | Buffer): Promise<void>;

    /**
     * Store a new `Delete`-Action in the transaction to delete an existing entry.
     *
     * @param keyName the key you want to delete
     * @param version the version successor, to confirm you are actually asking for the right version
     * @returns resolves once the storing is done
     */
    delete(keyName: string | Buffer, version: number): Promise<void>;

    /**
     * Store a `Update`-Action in the transaction to update an existing entry.
     *
     * @param keyName the key for the entry you want to update
     * @param value the value to upate to
     * @param version the version successor, to confirm you are actually asking for the right version
     * @returns resolves once the storing is done
     */
    update(keyName: string | Buffer, value: string | Buffer, version: number): Promise<void>;

  }

  /**
   * Represent the Entries of a MutableData network object
   */
  class Entries {
    /**
     * Get the total number of entries in the MutableData
     *
     * @returns number of entries
     */
    len(): Promise<number>;

    /**
     * Look up the value of a specific key
     *
     * @param keyName the key to lookup
     * @returns the entry's value and the current version
     */
    get(keyName: string): Promise<ValueVersion>;

    /**
     * Get a list with the entries contained in this MutableData
     *
     * @returns the entries list
     */
    listEntries(): Promise<Array<{ key: Buffer, value: ValueVersion }>>;

    /**
     * Insert a new entry. Once you call `MutableData.put` with this entry, it
     * will fail if the entry already exists or the current app doesn't have the
     * permissions to edit that mutable data.
     *
     * @param keyName the key you want store the data under
     * @param value the data you want to store
     * @returns resolves once storing is done
     */
    insert(keyName: string | Buffer, value: string | Buffer): Promise<void>;

    /**
     * Create a new mutation transaction for the entries
     *
     * @return  the mutation transaction object
     */
    mutate(): Promise<EntryMutationTransaction>;

  }

  /**
   * Holds the information of a value of a MutableData
   */
  interface ValueVersion {
    /**
     * the buffer with the value
     */
    buf: Buffer;

    /**
     * the version
     */
    version: number;
  }

  interface NameAndTag {
    /**
     * the XoR-name/address on the network
     */
    name: Buffer;

    /**
     * the type tag
     */
    typeTag: number;

    /**
     * If the experimental APIs are enabled the XOR-URL is also returned in the object.
     */
    xorUrl: string;
  }

  /**
   * Holds the reference to a MutableData
   */
  class MutableData {
    /**
     * Easily set up a newly (not yet created) MutableData with the app having
     * full-access permissions (and no other). The name and description parameters
     * are metadata for the MutableData which can be used to identify what this
     * MutablaData contains. The metadata is particularly used by the
     * Authenticator when another application has requested mutation permissions
     * on this MutableData, so the user can make a better decision to either
     * allow or deny such a request based on this information.
     *
     * @param data a key-value payload it should create the data with
     * @param name a descriptive name for the MutableData
     * @param  description a detailed description for the MutableData content
     * @returns self
     */
    quickSetup(data: any, name?: string | Buffer, description?: string | Buffer): Promise<MutableData>;

    /**
     * Set the metadata information in the MutableData. Note this can be used only
     * if the MutableData was already committed to the network, .i.e either with
     * `put`, with `quickSetup`, or if it is an already existing MutableData just
     * fetched from the network. The metadata is particularly used by the
     * Authenticator when another application has requested mutation permissions
     * on this MutableData, displaying this information to the user, so the user
     * can make a better decision to either allow or deny such a request based on
     * it.
     *
     * @param name a descriptive name for the MutableData
     * @param description a detailed description for the MutableData content
     * @returns resolves once finished
     */
    setMetadata(name: string | Buffer, description: string | Buffer): Promise<void>;

    /**
     * Encrypt the entry key provided as parameter with the encryption key contained
     * in a Private MutableData. If the MutableData is Public, the same (and
     * unencrypted) value is returned.
     *
     * @param key the key you want to encrypt
     * @returns the encrypted entry key
     */
    encryptKey(key: string | Buffer): Promise<Buffer>;

    /**
     * Encrypt the entry value provided as parameter with the encryption key
     * contained in a Private MutableData. If the MutableData is Public, the same
     * (and unencrypted) value is returned.
     *
     * @param value the data you want to encrypt
     * @returns the encrypted entry value
     */
    encryptValue(value: string | Buffer): Promise<Buffer>;

    /**
     * Decrypt the entry key/value provided as parameter with the encryption key
     * contained in a Private MutableData.
     *
     * @param value the data you want to decrypt
     * @returns the decrypted value
     */
    decrypt(value: string | Buffer): Promise<Buffer>;

    /**
     * Look up the name and tag of the MutableData as required to look it up on
     * the network.
     *
     * @returns the XoR-name and type tag
     */
    getNameAndTag(): Promise<NameAndTag>;

    /**
     * Look up the mutable data object version on the network
     *
     * @returns current version
     */
    getVersion(): Promise<number>;

    /**
     * Look up the value of a specific key
     *
     * @returns the entry value and its current version
     */
    get(key: any): Promise<ValueVersion>;

    /**
     * Commit this MutableData to the network.
     *
     * @param permissions the permissions to create the mutable data with
     * @param  entries data entries to create the mutable data with
     */
    put(permissions: Permissions | CONSTANTS.MD_PERMISSION_EMPTY, entries: Entries | CONSTANTS.MD_ENTRIES_EMPTY): Promise<void>;

    /**
     * Get a Handle to the entries associated with this MutableData
     * @returns the entries representation object
     */
    getEntries(): Promise<Entries>;

    /**
     * Get a list with the keys contained in this MutableData
     * @returns the keys list
     */
    getKeys(): Promise<Array<Buffer>>;

    /**
     * Get the list of values contained in this MutableData
     * @returns the list of values
     */
    getValues(): Promise<Array<ValueVersion>>;

    /**
     * Get a Handle to the permissions associated with this mutableData
     * @returns the permissions representation object
     */
    getPermissions(): Promise<Permissions>;

    /**
     * Get a Handle to the permissions associated with this MutableData for a
     * specifc key
     *
     * @param signKey the key to look up. Defaults to USER_ANYONE.
     * @returns the permissions set associated to the key
     */
    getUserPermissions(signKey: PubSignKey | CONSTANTS.USER_ANYONE): Promise<Permissions>;

    /**
     * Delete the permissions of a specifc key. Directly commits to the network.
     * Requires 'ManagePermissions'-Permission for the app.
     *
     * @param signKey The key to lookup for. Defaults to USER_ANYONE.
     * @param version the version successor, to confirm you are actually asking for the right one
     * @returns once finished
     */
    delUserPermissions(signKey: PubSignKey | CONSTANTS.USER_ANYONE, version: number): Promise<void>;

    /**
     * Set the permissions of a specifc key. Directly commits to the network.
     * Requires 'ManagePermissions'-Permission for the app.
     *
     * @param signKey the key to lookup for. Defaults to USER_ANYONE.
     * @param permissionSet the permission set to set to
     * @param version the version successor, to confirm you are actually asking for the right one
     * @returns resolves once finished
     */
    setUserPermissions(signKey: PubSignKey | CONSTANTS.USER_ANYONE, permissionSet: any, version: number): Promise<void>;

    /**
     * Commit the transaction to the network
     *
     * @param mutations the Mutations you want to apply
     * @return resolves once finished
     */
    applyEntriesMutation(mutations: EntryMutationTransaction): Promise<void>;

    /**
     * Serialise the current MutableData
     *
     * @returns the serialilsed version of the MutableData
     */
    serialise(): Promise<string>;

    /**
     * Get serialised size of current MutableData
     *
     * @returns the serialilsed size of the MutableData
     */
    getSerialisedSize(): Promise<number>;

    /**
     * Wrap this MutableData into a known abstraction.
     *
     * @param eml name of the emulation
     */
    emulateAs(eml: 'NFS'): NFS;

    /**
     * Wrap this MutableData into a known abstraction.
     *
     * @param eml name of the emulation
     */
    emulateAs(eml: 'RDF'): RDF;

    /**
     * Wrap this MutableData into a known abstraction.
     *
     * @param eml name of the emulation
     */
    emulateAs(eml: 'WebID'): WebID;
  }

  /**
   * Provide the MutableData API for the session.
   *
   * Access via `mutableData` on your app Instance.
   */
  class MutableDataInterface {
    constructor(app: SAFEApp);

    /**
     * Create a new mutuable data at a random address with private access.
     *
     * @param typeTag the typeTag to use
     */
    newRandomPrivate(typeTag: number): Promise<MutableData>;

    /**
     * Create a new mutuable data at a random address with public access.
     *
     * @param typeTag the typeTag to use
     */
    newRandomPublic(typeTag: number): Promise<MutableData>;

    /**
     * Initiate a mutuable data at the given address with private access.
     *
     * @param typeTag the typeTag to use
     */
    newPrivate(name: Buffer | string, typeTag: number, secKey: Buffer | string, nonce: Buffer | string): Promise<MutableData>;

    /**
     * Initiate a mutuable data at the given address with public access.
     *
     * @param typeTag the typeTag to use
     */
    newPublic(name: Buffer | string, typeTag: number): Promise<MutableData>;

    /**
     * Create a new Permissions object.
     */
    newPermissions(): Promise<Permissions>;

    /**
     * Create a new EntryMutationTransaction object.
     */
    newMutation(): Promise<EntryMutationTransaction>;

    /**
     * Create a new Entries object.
     */
    newEntries(): Promise<Entries>;

    /**
     * Create a new Mutuable Data object from its serial
     * 
     * @param serial
     */
    fromSerial(serial: any): Promise<MutableData>;
  }
}

declare module '@maidsafe/safe-node-app/src/api/web' {
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
  import { RDF } from '@maidsafe/safe-node-app/src/api/emulations/rdf';
  import { NameAndTag } from '@maidsafe/safe-node-app/src/api/mutable';

  class WebInterface {
    public app: SAFEApp;

    /**
    * @private
    * @param app
    */
    constructor(app: SAFEApp);

    /**
     * Retrieve vocab for RDF/SAFE Implementation of DNS (publicNames/subDomains/services)
     * 
     * @param rdf RDF object to utilise for namespace func
     * @return object containing keys with RDF namespace values.
     * @example
     * const rdf = mData.emulateAs('RDF');
     * const vocabs = app.web.getVocabs(rdf);
     */
    getVocabs(rdf: RDF): any;

    /**
     * Add entry to _publicNames container, linking to a specific RDF/MD
     * object for subName discovery/service resolution
     * @param  publicName public name string, valid URL
     * @param  subNamesRdfLocation MutableData name/typeTag object
     * @throws {INVALID_RDF_LOCATION|INVALID_URL}
     * @return resolves upon commit of data to _publicNames
     * @example
     * const asyncFn = async () => {
     *     try {
     *         const networkResource = await app.fetch('safe://hyfktce85xaif4kdamgnd16uho3w5z7peeb5zeho836uoi48tgkgbc55bco:30303');
     *         const nameAndTag = await networkResource.content.getNameAndTag();
     *         const publicName = 'safedev';
     *         const subNamesRdfLocation = nameAndTag;
     *         await app.web.addPublicNameToDirectory(publicName, subNamesRdfLocation);
     *     } catch(err) {
     *         throw err;
     *     }
     * };
     */
    addPublicNameToDirectory(publicName: string, subNamesRdfLocation: NameAndTag): Promise<void>;

    /**
     * Links a service/resource to a publicName, with a provided subName
     * @param subName
     * @param publicName
     * @param serviceLocation
     * @throws {INVALID_SUBNAME|INVALID_PUBNAME|INVALID_RDF_LOCATION|ERR_DATA_GIVEN_ALREADY_EXISTS}
     * @return Resolves to an object with xorname and
     * typeTag of the publicName RDF location
     */
    linkServiceToSubname(subName: string, publicName: string, serviceLocation: NameAndTag): Promise<NameAndTag>;

    /**
     * Return an Array of publicNames
     * 
     * @return Returns array of PublicNames
     */
    getPublicNames(): Promise<any[]>;

    /**
     * Adds a WebID to the '_public' container, using
     * 
     * @param webIdUri name/typetag object from SAFE MD.
     * @param displayName optional displayName which will be used when listing webIds.
     * @throws {INVALID_URL|MISSING_RDF_ID}
     */
    addWebIdToDirectory(webIdUri: any, displayName?: any): Promise<any>;

    /**
     * Retrieve all webIds. Currently as array of JSON objects...
     *
     * @return Resolves to array of webIds objects.
     */
    getWebIds(): Promise<any[]>;
  }
}

declare module '@maidsafe/safe-node-app/src/api/auth' {
  import { InitOptions } from '@maidsafe/safe-node-app';
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
  import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';

  /**
   * The AuthInterface contains all authentication related functionality with the
   * network. Like creating an authenticated or unauthenticated connection or
   * create messages for the IPC authentitcation protocol.
   *
   * Access your instance through your {SAFEApp} instance under `.auth`.
   */
  class AuthInterface {
    constructor(app: SAFEApp, initialisation: InitOptions);

    /**
     * Whether or not this is a registered/authenticated session.
     *
     * @returns true if this is an authenticated session
     */
    registered: boolean;

    /**
     * Generate an authentication URI for the app with the given permissions and optional parameters.
     *
     * @param permissions mapping the container-names to a list of permissions you want to request
     * @param opts optional parameters: own_container: whether or not to request our own container to be created for us, too
     * @returns `{id: <id>, uri: 'safe-auth://' }`
     */
    genAuthUri(permissions: any, opts?: { own_container: boolean }): { id: string, uri: string };

    /**
     * Generate a `'safe-auth'`-URI to request permissions on arbitrary owned MutableData's.
     *
     * @param permissions mapping the MutableData's XoR names to a list of permissions you want to request
     * @returns `safe-auth://`-URI
     */
    genShareMDataUri(permissions: any): string;

    /**
     * Generate an unregistered connection URI for the app.
     * @returns `{id: <id>, uri: 'safe-auth://' }`
     */
    genConnUri(): { id: any, uri: string };

    /**
     * Open the given Authentication URI to the authenticator
     */
    openUri(uri: string): string;

    /**
     * Generate a `'safe-auth'`-URI to request further container permissions
     *
     * @param containers mapping container name to list of permissions
     */
    genContainerAuthUri(containers: any): string;

    /**
     * Refresh the access persmissions from the network. Useful when you just connected or received a response from the authenticator in the IPC protocol.
     */
    refreshContainersPermissions(): Promise<void>;

    /**
     * Get the names of all containers found and the app's granted permissions for each of them.
     */
    getContainersPermissions(): Promise<Array<any>>;

    /**
     * Read granted containers permissions from an auth URI without the need to connect to the network.
     *
     * @param uri the IPC response string given
     */
    readGrantedPermissions(uri: string): Promise<Array<any>>;

    /**
     * Get the MutableData for the app's own container generated by Authenticator. When run in tests, this falls back to the randomly generated version
     */
    getOwnContainer(): Promise<MutableData>;

    /**
     * Whether or not this session has specifc access permission for a given container.
     *
     * @param name name of the container, e.g. `'_public'`
     * @param permissions permissions to check for ('Read' by default)
     */
    canAccessContainer(name: string, permissions?: string | string[]): Promise<boolean>;

    /**
     * Lookup and return the information necessary to access a container.
     *
     * @param name name of the container, e.g. `'_public'`
     * @returns the MutableData behind it
     */
    getContainer(name: string): Promise<MutableData>;

    /**
     * Create a new authenticated or unregistered session using the provided IPC response.
     *
     * @param uri the IPC response string given
     * @returns the given app instance with a newly setup and authenticated session.
     */
    loginFromUri(uri: string): Promise<SAFEApp>;

    /**
     * *ONLY AVAILALBE IF RUN in NODE_ENV='test' OR WITH 'forceUseMock' option*
     *
     * Generate a _locally_ registered App with the given permissions, or a local unregistered App if permissions is `null`.
     *
     * @returns the locally registered/unregistered App instance
     */
    loginForTest(access: any, opts?: { own_container: boolean }): Promise<SAFEApp>;

    /**
     * *ONLY AVAILALBE IF RUN in NODE_ENV='test' OR WITH 'forceUseMock' option*
     *
     * Simulates a network disconnection event. This can be used to test any logic
     * to be executed by an application when a network diconnection notification
     * is received.
     */
    simulateNetworkDisconnect(): void;
  }
}

declare module '@maidsafe/safe-node-app/src/api/crypto' {
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

  /**
   * Holds the public part of an encryption key pair
   */
  class PubEncKey {

    /**
     * Generate raw buffer of public encryption key
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *   try {
     *     const encKeyPair = await app.crypto.generateEncKeyPair();
     *     const pubEncKey = encKeyPair.pubEncKey;
     *     const rawPubEncKey = await pubEncKey.getRaw();
     *   } catch (err) {
     *     throw err;
     *   }
     * };
     */
    getRaw(): Promise<Buffer>;

    /**
     * Encrypt the input using recipient's public key. Only recipient will be
     * able to decrypt data. Read more about [sealed boxes]{@link https://libsodium.gitbook.io/doc/public-key_cryptography/sealed_boxes}.
     * @returns Encrypted data
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const stringOrBuffer = 'plain string to be encrypted';
     *     try {
     *       const rawPubEncKey = Buffer.from(<recipient's public encryption key>);
     *       const pubEncKey = await app.crypto.pubEncKeyFromRaw(rawPubEncKey.buffer);
     *       const encryptedData = await pubEncKey.encryptSealed(data);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    encryptSealed(data: string | Buffer): Promise<Buffer>;

    /**
     * Decrypt the given cipher text using the sender's public encryption key
     * and the recipient's secret encryption key. Read more about [authenticated encryption]{@link https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption}.
     *
     * @arg cipher Encrypted data
     * @arg secretEncKey Recipient's secret encryption key
     * @returns Decrypted data
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const cipher = 'plain text to be encrypted';
     *     try {
     *       const encKeyPair = await app.crypto.generateEncKeyPair();
     *       const rawPubEncKey = Buffer.from(<sender's public encryption key>);
     *       const pubEncKey = await app.crypto.pubEncKeyFromRaw(rawPubEncKey.buffer);
     *       const secretEncKey = encKeyPair.secEncKey;
     *       const decryptedData = await pubEncKey.decrypt(cipher, secretEncKey)
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    decrypt(cipher: Buffer, secretEncKey: SecEncKey): Promise<Buffer>;

    /**
     * Encrypt the input using recipient's public encryption key and sender's
     * secret encryption key, such that each party can generate a shared secret
     * key to verify the integrity of ciphers and to also decrypt them. Read
     * more about [authenticated encryption]{@link https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption}.
     *
     * @param data
     * @param secretEncKey Sender's secret encryption key
     * @throws {MISSING_SEC_ENC_KEY}
     * @returns Encrypted data
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const data = 'plain text to be encrypted';
     *     try {
     *       const encKeyPair = await app.crypto.generateEncKeyPair();
     *       const rawPubEncKey = Buffer.from(<recipient's public encryption key>);
     *       const pubEncKey = await app.crypto.pubEncKeyFromRaw(rawPubEncKey.buffer);
     *       const secretEncKey = encKeyPair.secEncKey;
     *       const encryptedBuffer = await pubEncKey.encrypt(data, secretEncKey)
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    encrypt(data: Buffer, secretEncKey: SecEncKey): Promise<Buffer>;
  }

  /**
   * Holds the secret part of an encryption key
   */
  class SecEncKey {

    /**
     * Generate raw buffer of secret encryption key
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *   try {
     *     const encKeyPair = await app.crypto.generateEncKeyPair();
     *     const secEncKey = encKeyPair.secEncKey;
     *     const rawSecEncKey = await secEncKey.getRaw();
     *   } catch (err) {
     *     throw err;
     *   }
     * };
     */
    getRaw(): Promise<Buffer>;

    /**
     * Decrypt the given encrypted data using the sender's public encryption key
     * and the recipient's secret encryption key. Read more about [authenticated encryption]{@link https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption}.
     *
     * An example use case for this method is if you have received messages from multiple
     * senders, you may fetch your secret key once, then iterate over the messages
     * passing each associated public encryption key to decrypt each message.
     *
     * @arg cipher Encrypted data
     * @arg publicEncKey Sender's public encryption key
     * @throws {MISSING_PUB_ENC_KEY}
     * @returns Decrypted data
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const cipher = 'plain text to be encrypted';
     *     try {
     *       const encKeyPair = await app.crypto.generateEncKeyPair();
     *       const rawPubEncKey = Buffer.from(<sender's public encryption key>);
     *       const pubEncKey = await app.crypto.pubEncKeyFromRaw(rawPubEncKey.buffer);
     *       const secretEncKey = encKeyPair.secEncKey;
     *       const decryptedData = await pubEncKey.decrypt(cipher, secretEncKey)
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    decrypt(cipher: Buffer, publicEncKey: PubEncKey): Promise<Buffer>;

    /**
     * Encrypt the input using recipient's public encryption key and sender's
     * secret encryption key, such that each party can generate a shared secret
     * key to verify the integrity of ciphers and to also decrypt them. Read
     * more about [authenticated encryption]{@link https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption}.
     *
     * @param data
     * @param recipientPubKey Recipient's public encryption key
     * @returns Encrypted data
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const data = 'plain text to be encrypted';
     *     try {
     *       const encKeyPair = await app.crypto.generateEncKeyPair();
     *       const rawPubEncKey = Buffer.from(<recipient's public encryption key>);
     *       const recipientPubKey = await app.crypto.pubEncKeyFromRaw(rawPubEncKey.buffer);
     *       const secEncKey = encKeyPair.secEncKey;
     *       const encryptedBuffer = await secEncKey.encrypt(data, recipientPubKey)
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    encrypt(data: Buffer, recipientPubKey: PubEncKey): Promise<Buffer>;
  }

  /**
   * Asymmetric encryption keypair
   */
  class EncKeyPair {

    /**
     * Get the public encryption key instance of this keypair
     */
    pubEncKey: PubEncKey;

    /**
     * Get the secret encryption key instance of this keypair
     */
    secEncKey: SecEncKey;

    /**
     * Decrypt the input using this generated encryption key pair. Only
     * recipient will be able to decrypt data. Read more about [sealed boxes]{@link https://libsodium.gitbook.io/doc/public-key_cryptography/sealed_boxes}.
     * 
     * @param cipher Encrypted data
     * @returns Decrypted data
     * @example
     * // Assumes {@link initialiseApp|SAFEApp} interface has been obtained
     * const asyncFn = async () => {
     *     const cipher = <Encrypted data as sealed box>;
     *     try {
     *        const encKeyPair = await app.crypto.generateEncKeyPair();
     *       const decryptedData = await encKeyPair.decryptSealed(cipher);
     *     } catch(err) {
     *       throw err;
     *     }
     * };
     */
    decryptSealed(cipher: string | Buffer): Promise<Buffer>;
  }

  /**
   * Holds the public part of a sign key pair
   */
  class PubSignKey {

    /**
     * generate raw string copy of public sign key
     */
    getRaw(): Promise<Buffer>;

    /**
     * Verify the given signed data (buffer or string) using the public sign key
     *
     * @param data to verify signature
     */
    verify(data: Buffer): Promise<Buffer>;
  }

  /**
   * Holds the secret part of a sign key
   */
  class SecSignKey {
    /**
     * Holds the secret part of a sign key
     */
    constructor();

    /**
     * generate raw string copy of secret sign key
     */
    getRaw(): Promise<Buffer>;

    /**
     * Sign the given data (buffer or string) using the secret sign key
     *
     * @param data to sign
     * @returns signed data
     */
    sign(data: Buffer): Promise<Buffer>;
  }

  /**
   * Holds a sign key pair
   */
  class SignKeyPair {

    /**
     * get the public sign key instance of this key pair
     */
    pubSignKey: PubSignKey;

    /**
     * get the secrect sign key instance of this key pair
     */
    secSignKey: SecSignKey;
  }

  /**
   * Encryption functionality for the app
   *
   * Access it through your {SAFEApp} instance under `app.crypto`
   */
  class CryptoInterface {
    /**
     * Encryption functionality for the app
     *
     * Access it through your {SAFEApp} instance under `app.crypto`
     */
    constructor(app: SAFEApp);

    /**
     * Hash the given input with SHA3 Hash
     */
    sha3Hash(data: any): Promise<Buffer>;

    /**
     * Get the public signing key of this session
     */
    getAppPubSignKey(): Promise<PubSignKey>;

    /**
     * Get the public encryption key of this session
     */
    getAppPubEncKey(): Promise<PubEncKey>;

    /**
     * Generate a new Asymmetric Encryption Key Pair
     */
    generateEncKeyPair(): Promise<EncKeyPair>;

    /**
     * Generate a new Sign Key Pair (public & private keys).
     */
    generateSignKeyPair(): Promise<SignKeyPair>;

    /**
     * Generate a new Asymmetric Encryption Key Pair from raw secret and public keys
     */
    generateEncKeyPairFromRaw(): Promise<EncKeyPair>;

    /**
     * Generate a new Sign Key Pair from raw secret and public keys
     */
    generateSignKeyPairFromRaw(): Promise<SignKeyPair>;

    /**
     * Interprete the Public Sign Key from a given raw string
     * @param raw public sign key raw bytes as string
     */
    pubSignKeyFromRaw(raw: string): Promise<PubSignKey>;

    /**
     * Interprete the Secret Sign Key from a given raw string
     *
     * @param raw secret sign key raw bytes as string
     */
    secSignKeyFromRaw(raw: string): Promise<SecSignKey>;

    /**
     * Interprete the public encryption Key from a given raw string
     *
     * @param raw public encryption key raw bytes as string
     */
    pubEncKeyFromRaw(raw: string): Promise<PubEncKey>;

    /**
     * Interprete the secret encryption Key from a given raw string
     *
     * @param raw secret encryption key raw bytes as string
     */
    secEncKeyFromRaw(raw: string): Promise<SecEncKey>;

    /**
     * Generate a nonce that can be used when creating private MutableData
     *
     * @returns the nonce generated
     */
    generateNonce(): Promise<Buffer>;
  }

}

declare module '@maidsafe/safe-node-app' {
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

  /**
   * Holds the information about this app, needed for authentication.
   */
  interface AppInfo {
    /**
     * unique identifier for the app (e.g. 'net.maidsafe.examples.mail-app')
     */
    id: string;

    /**
     * human readable name of the app (e.g. "Mail App")
     */
    name: string;

    /**
     * human readable name of the vendor (e.g. "MaidSafe Ltd.")
     */
    vendor: string;

    /**
     * an optional scope of this instance
     */
    scope?: string;

    /**
     * an optional customised execution path to use when registering the URI with the system.
     */
    customExecPath?: string;
  }

  /**
   * holds the additional intialisation options for the App.
   */
  interface InitOptions {

    /**
     * to register auth scheme with the OS. Defaults to true
     */
    registerScheme?: boolean;

    /**
     * to additionally register custom protocol schemes
     */
    joinSchemes?: string[];

    /**
     * to enable or disable back end logging. Defaults to true
     */
    log?: boolean;

    /**
     * path to the folder where the native libs can be found. Defaults to current folder path.
     */
    libPath?: string;

    /**
     * set additional search path for the config files. E.g. `log.toml` and
     * `crust.config` files will be also searched not only in the same folder
     * where the native library is, but also in this additional search path.
     */
    configPath?: string;

    /**
     * to force the use of mock routing regardless the NODE_ENV environment
     * variable value. Defaults to false
     */
    forceUseMock?: boolean;

    /**
     * to enable the experimental APIs regardless if the--enable - experimental
     * - apis flag was passed as argument to the application.Defaults to false.
     */
    enableExperimentalApis?: boolean;
  }


  /**
   * The entry point to create a new SAFEApp
   *
   * @param appInfo
   * @param callback function to receive network state updates
   * @param options initialisation options
   * @returns promise to a SAFEApp instance
   */
  export function initialiseApp(appInfo: AppInfo, networkStateCallBack?: () => any, options?: InitOptions): Promise<SAFEApp>;

  /**
   * If you have received a response URI (which you are allowed to store
   * securely), you can directly get an authenticated or non-authenticated
   * connection by using this helper function. Just provide said URI as the
   * second value.
   *
   * @param appInfo the app info
   * @param authUri the URI coming back from the Authenticator
   * @param optional callback function to receive network state updates
   * @param options initialisation options
   * @returns promise to a SAFEApp instance
   */
  export function fromAuthUri(appInfo: AppInfo, authUri: string, networkStateCallBack?: () => any, options?: InitOptions): Promise<SAFEApp>;

  /**
   * Constants available for the applications to be used in a few cases
   * as values of input parameters.
   */
  export enum CONSTANTS {
    /**
     * NFS File open in overwrite mode. When used as the `openMode` parameter
     * for `nfs.open(<fileName>, <openMode>)` the entire content of the file
     * will be replaced when writing data to it.
     */
    NFS_FILE_MODE_OVERWRITE = 1,

    /**
     * NFS File open in append mode. When used as the `openMode` param for
     * `nfs.open(<fileName>, <openMode>)` any new content written to the file
     * will be appended to the end without modifying existing data.
     */
    NFS_FILE_MODE_APPEND = 2,

    /**
     * NFS File open in read-only mode. When used as the `openMode` param for
     * `nfs.open(<fileName>, <openMode>)` only the read operation is allowed.
     */
    NFS_FILE_MODE_READ = 4,

    /**
     * Read the file from the beginning. When used as the `position` param for
     * the NFS `file.read(<position>, <length>)` function, the file will be read
     * from the beginning.
     */
    NFS_FILE_START = 0,

    /**
     * Read until the end of a file. When used as the `length` param for the NFS
     * `file.read(<position>, <length>)` function, the file will be read from
     * the position provided until the end of its content. E.g. if
     * `NFS_FILE_START` and `NFS_FILE_END` are passed in as the `position` and
     * `length` parameters respectively, then the whole content of the file will
     * be read.
     */
    NFS_FILE_END = 0,

    /**
     * Any user. When used as the `signkey` param in any of the MutableData
     * functions to manipulate user permissions, like `getUserPermissions`,
     * `setUserPermissions`, `delUserPermissions`, etc., this will associate the
     * permissions operation to any user rather than to a particular sign key.
     * E.g. if this constant is used as the `signkey` param of the
     * `setUserPermissions(<signKey>, <permissionSet>, <version>)` function, the
     * permissions in the `permissionSet` provided will be granted to anyone
     * rather to a specific user's/aplication's sign key.
     */
    USER_ANYONE = 0,

    /**
     * MutableData's entry key where its metadata is stored. The MutableData's
     * metadata can be set either when invoking the `quickSetup` function or by
     * invking the `setMetadata` function. The metadata is stored as an encoded
     * entry in the MutableData which key is `MD_METADATA_KEY`, thus this
     * constant can be used to realise which of the entries is not application's
     * data but the MutableData's metadata instead. The metadata is particularly
     * used by the Authenticator when another application has requested mutation
     * permissions on a MutableData, displaying this information to the user,
     * so the user can make a better decision to either allow or deny such a
     * request based on it.
     */
    MD_METADATA_KEY = '_metadata',

    /**
     * Represents an empty set of MutableData's entries. This can be used when
     * invoking the `put` function of the MutableData API to signal that it
     * should be committed to the network with an empty set of entries.
     */
    MD_ENTRIES_EMPTY = 0,

    /**
     * Represents an empty set of MutableData's permissions. This can be used
     * when invoking the `put` function of the MutableData API to signal that it
     * should be committed to the network with an empty set of permissions.
     */
    MD_PERMISSION_EMPTY = 0,

    /**
     * Gets next correct file version.
     * This constant may be used in place of the version argument when invoking
     * `update` function of the NFS API to automatically obtain correct file version.
     */
    GET_NEXT_VERSION = 0,
  }

  export const VERSION: string;
}

declare module '@maidsafe/safe-node-app/src/consts' {
  const TAG_TYPE_DNS = 15001;
  const TAG_TYPE_WWW = 15002;

  const NET_STATE_INIT = -100;
  const NET_STATE_DISCONNECTED = -1;
  const NET_STATE_CONNECTED = 0;

  const LIB_LOCATION_MOCK = 'mock';
  const LIB_LOCATION_PROD = 'prod';

  const INDEX_HTML = 'index.html';

  const CID_VERSION = 1;
  const CID_BASE_ENCODING = 'base32z';
  const CID_HASH_FN = 'sha3-256';
  const CID_DEFAULT_CODEC = 'raw';
  const CID_MIME_CODEC_PREFIX = 'mime/';
}

declare module '@maidsafe/safe-node-app/src/error_const' {
  interface CodeError extends Error {
    code: number;
    msg: string;
  }

  /**
   * Thrown natively when failing to encrypt/decrypt a MD entry
   */
  export const ERR_SERIALISING_DESERIALISING: CodeError;

  /**
   * Thrown natively when data not found on network.
   */
  export const ERR_NO_SUCH_DATA: CodeError;

  /**
   * Thrown natively when data already exists at the target address on network.
   */
  export const ERR_DATA_GIVEN_ALREADY_EXISTS: CodeError;

  /**
   * Thrown natively when entry on found in MutableData.
   */
  export const ERR_NO_SUCH_ENTRY: CodeError;

  /**
   * Thrown natively when NFS-style file not found.
   */
  export const ERR_FILE_NOT_FOUND: CodeError;

  /**
   * Thrown natively when attempting to fetch partial byte range of NFS-style
   * file that is not within the total byte range. For example, this error is
   * thrown if a file is 10 bytes long, however a byte range of 20 is requested.
   */
  export const INVALID_BYTE_RANGE: CodeError;

  /**
   * Thrown when a native library fails to load and which library.
   */
  export const FAILED_TO_LOAD_LIB: CodeError;

  /**
   * Informs that app is not yet connected to network.
   */
  export const SETUP_INCOMPLETE: CodeError;

  /**
   * Informs when app info provided during initialisation is invalid.
   */
  export const MALFORMED_APP_INFO: CodeError;

  /**
   * Argument should be an array object.
   */
  export const MISSING_PERMS_ARRAY: CodeError;

  /**
   * Informs of a specific object in a share MData permissions array that is malformed.
   */
  export const INVALID_SHARE_MD_PERMISSION: CodeError;

  /**
   * Thrown when share MD permissions is not an array.
   */
  export const INVALID_PERMS_ARRAY: CodeError;

  /**
   * Please provide URL
   */
  export const MISSING_URL: CodeError;

  /**
   * Please provide URL in string format.
   */
  export const INVALID_URL: CodeError;

  /**
   * Thrown when attempting to connect without authorisation URI.
   */
  export const MISSING_AUTH_URI: CodeError;

  /**
   * Thrown when attempting extract granted access permissions from a URI which
   * doesn't contain such information.
   */
  export const NON_AUTH_GRANTED_URI: CodeError;

  /**
   * Thrown when invalid permission is requested on container.
   */
  export const INVALID_PERM: CodeError;

  /**
   * Thrown when attempting to get a container without specifying name with a
   * string.
   */
  export const MISSING_CONTAINER_STRING: CodeError;

  /**
   * Thrown when functions unique to testing environment are attempted  to be
   * used.
   */
  export const NON_DEV: CodeError;

  /**
   * Thrown when public encryption key is not provided as necessary function
   * argument.
   */
  export const MISSING_PUB_ENC_KEY: CodeError;

  /**
   * Thrown when secret encryption key is not provided as necessary function
   * argument.
   */
  export const MISSING_SEC_ENC_KEY: CodeError;

  /**
   * Logger initialisation failed.
   */
  export const LOGGER_INIT_ERROR: CodeError;

  /**
   * Informs you when config search path has failed to set, with specific
   * reason.
   */
  export const CONFIG_PATH_ERROR: CodeError;

  /**
   * Custom name used to create public or private MutableData must be 32 bytes
   * in length.
   */
  export const XOR_NAME: CodeError;

  /**
   * Any string or buffer provided to private MutableData that is not 24 bytes
   * in length will throw error.
   */
  export const NONCE: CodeError;

  /**
   * Tag argument when creating private or public MutableData must be a number.
   */
  export const TYPE_TAG_NAN: CodeError;

  /**
   * Secret encryption key of improper length is provided to custom private
   * MutableData
   */
  export const INVALID_SEC_KEY: CodeError;

  /**
   * Thrown when functions that are experimental APIs were not enabled but
   * attempted to be used
   */
  export const EXPERIMENTAL_API_DISABLED: CodeError;

  /**
   * the service/subname was not found
   */
  export const ERR_SERVICE_NOT_FOUND: CodeError;

  /**
   * the content was not found at the address provided
   */
  export const ERR_CONTENT_NOT_FOUND: CodeError;

  /**
   * RDF Location provided is not and object with name/typeTag
   */
  export const INVALID_RDF_LOCATION: CodeError;

  /**
   * public name provided is not valid
   */
  export const INVALID_PUBNAME: CodeError;

  /**
   * RDF Location provided is not and object with name/typeTag
   */
  export const INVALID_SUBNAME: CodeError;

  /**
   * RDF object does not have an ID.
   */
  export const MISSING_RDF_ID: CodeError;
}
