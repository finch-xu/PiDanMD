import { invoke } from '@tauri-apps/api/core';

export interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  modified?: number;
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
  return invoke('list_directory', { path });
}

export async function readFile(path: string): Promise<string> {
  return invoke('read_file', { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke('write_file', { path, content });
}

export async function listSystemFonts(): Promise<string[]> {
  return invoke('list_system_fonts');
}

export async function createDirectory(path: string): Promise<void> {
  return invoke('create_directory', { path });
}

export async function getDefaultStorageDir(): Promise<string> {
  return invoke('get_default_storage_dir');
}
