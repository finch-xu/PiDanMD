export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  modified?: number;
  title?: string;
  children?: FileNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
}
