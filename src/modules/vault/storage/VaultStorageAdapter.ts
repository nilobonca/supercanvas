import { VaultNode, VaultDocument } from '../interfaces/vault';

export interface IVaultStorageProvider {
  readonly type: 'fsa' | 'idb' | 'electron';
  readonly isConnected: boolean;
  readonly vaultName: string;

  init(): Promise<boolean>;
  listNodes(subPath?: string): Promise<VaultNode[]>;
  readDocument(filePath: string): Promise<string>;
  saveDocument(filePath: string, content: string): Promise<void>;
  createDocument(filePath: string, initialContent?: string): Promise<VaultDocument>;
  createFolder(folderPath: string): Promise<void>;
  deleteNode(nodePath: string, isFolder: boolean): Promise<void>;
  renameNode(oldPath: string, newPath: string, isFolder?: boolean): Promise<void>;
  saveFile(filePath: string, file: File | Blob): Promise<void>;
  getFileBlob(filePath: string): Promise<Blob>;
  getFileUrl(filePath: string): Promise<string>;
}
