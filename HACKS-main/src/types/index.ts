export interface Repository {
  name: string;
  url: string;
  description?: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
}

export interface ViewState {
  currentPath: string[];
  currentRepo: string | null;
  currentFile: GitHubFile | null;
}