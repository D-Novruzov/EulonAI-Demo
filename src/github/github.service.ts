import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GitHubService {
  private currentToken: string | null = null;
  private octokit: Octokit | null = null;

  /**
   * Set the GitHub token and initialize Octokit client
   */
  setToken(token: string): void {
    this.currentToken = token;
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Get the current Octokit client instance
   * Throws error if token is not set
   */
  getClient(): Octokit {
    if (!this.octokit) {
      throw new Error('GitHub token not set. Please set token first.');
    }
    return this.octokit;
  }

  /**
   * Check if token is set
   */
  hasToken(): boolean {
    return this.currentToken !== null;
  }

  /**
   * Test the GitHub connection by fetching authenticated user info
   */
  async testConnection(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      if (!this.octokit) {
        return {
          success: false,
          error: 'No token set. Please set a token first.',
        };
      }

      const { data } = await this.octokit.rest.users.getAuthenticated();
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
}

