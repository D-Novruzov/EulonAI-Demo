import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GitHubService {
  // Store tokens and clients per session ID
  private tokenStore: Map<string, string> = new Map();
  private clientStore: Map<string, Octokit> = new Map();

  /**
   * Set the GitHub token for a specific session and initialize Octokit client
   */
  setToken(sessionId: string, token: string): void {
    this.tokenStore.set(sessionId, token);
    this.clientStore.set(sessionId, new Octokit({
      auth: token,
    }));
  }

  /**
   * Get the Octokit client instance for a specific session
   * Throws error if token is not set for this session
   */
  getClient(sessionId: string): Octokit {
    const client = this.clientStore.get(sessionId);
    if (!client) {
      throw new Error('GitHub token not set for this session. Please set token first.');
    }
    return client;
  }

  /**
   * Check if token is set for a specific session
   */
  hasToken(sessionId: string): boolean {
    return this.tokenStore.has(sessionId);
  }

  /**
   * Remove token and client for a specific session (logout)
   */
  clearToken(sessionId: string): void {
    this.tokenStore.delete(sessionId);
    this.clientStore.delete(sessionId);
  }

  /**
   * Test the GitHub connection by fetching authenticated user info for a specific session
   */
  async testConnection(sessionId: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const client = this.clientStore.get(sessionId);
      if (!client) {
        return {
          success: false,
          error: 'No token set for this session. Please set a token first.',
        };
      }

      const { data } = await client.rest.users.getAuthenticated();
      return {
        success: true,
        user: {
          login: data.login,
          id: data.id,
          name: data.name,
          email: data.email,
          publicRepos: data.public_repos,
          followers: data.followers,
          following: data.following,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to connect to GitHub',
      };
    }
  }

  /**
   * Get all repositories for the authenticated user
   */
  async getRepositories(sessionId: string): Promise<any[]> {
    const client = this.getClient(sessionId);
    const { data } = await client.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });
    
    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      private: repo.private,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at,
    }));
  }

  /**
   * Get files from a repository
   * @param sessionId - Session ID
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param path - Optional path to fetch files from (default: root)
   */
  async getRepositoryFiles(
    sessionId: string,
    owner: string,
    repo: string,
    path: string = '',
  ): Promise<any[]> {
    const client = this.getClient(sessionId);
    
    try {
      const { data } = await client.rest.repos.getContent({
        owner,
        repo,
        path: path || '',
      });

      // If it's a single file, return it as an array
      if (Array.isArray(data)) {
        return data.map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
          url: item.html_url,
          downloadUrl: item.download_url,
        }));
      } else {
        // Single file
        return [
          {
            name: data.name,
            path: data.path,
            type: data.type,
            size: data.size,
            sha: data.sha,
            url: data.html_url,
            downloadUrl: data.download_url,
          },
        ];
      }
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Repository or path not found: ${owner}/${repo}${path ? '/' + path : ''}`);
      }
      throw error;
    }
  }

  /**
   * Get commits from a repository
   * @param sessionId - Session ID
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param limit - Maximum number of commits to return (default: 30)
   */
  async getRepositoryCommits(
    sessionId: string,
    owner: string,
    repo: string,
    limit: number = 30,
  ): Promise<any[]> {
    const client = this.getClient(sessionId);
    
    try {
      const { data } = await client.rest.repos.listCommits({
        owner,
        repo,
        per_page: Math.min(limit, 100), // GitHub API max is 100
      });

      return data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author?.name,
          email: commit.commit.author?.email,
          login: commit.author?.login,
          avatar: commit.author?.avatar_url,
        },
        date: commit.commit.author?.date,
        url: commit.html_url,
        stats: commit.stats ? {
          additions: commit.stats.additions,
          deletions: commit.stats.deletions,
          total: commit.stats.total,
        } : null,
      }));
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Repository not found: ${owner}/${repo}`);
      }
      throw error;
    }
  }
}

