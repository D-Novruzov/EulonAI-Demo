import { Controller, Post, Get, Body, HttpException, HttpStatus, Req, Delete, Param, Query } from '@nestjs/common';
import type { Request } from 'express';
import { GitHubService } from './github.service';

class SetTokenDto {
  token: string;
}

@Controller('github')
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  /**
   * Get session ID from request
   */
  private getSessionId(req: Request): string {
    if (!req.session || !req.sessionID) {
      throw new HttpException(
        'Session not initialized. Please ensure session middleware is configured.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return req.sessionID;
  }

  /**
   * Endpoint to set GitHub token for the current session
   * POST /github/token
   * Body: { "token": "your_github_token_here" }
   */
  @Post('token')
  setToken(@Body() setTokenDto: SetTokenDto, @Req() req: Request) {
    if (!setTokenDto.token || setTokenDto.token.trim() === '') {
      throw new HttpException(
        'Token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const sessionId = this.getSessionId(req);
      // Touch session to ensure it's saved
      if (req.session) {
        req.session.githubTokenSet = true;
      }
      this.githubService.setToken(sessionId, setTokenDto.token);
      return {
        success: true,
        message: 'GitHub token has been set successfully for your session',
        sessionId: sessionId,
      };
    } catch (error: any) {
      throw new HttpException(
        `Failed to set token: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint to test GitHub connection for the current session
   * GET /github/test
   * Returns user info if token is valid
   */
  @Get('test')
  async testConnection(@Req() req: Request) {
    const sessionId = this.getSessionId(req);
    
    if (!this.githubService.hasToken(sessionId)) {
      throw new HttpException(
        'No token set for this session. Please set a token first using POST /github/token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.githubService.testConnection(sessionId);
    
    if (!result.success) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to connect to GitHub',
          error: result.error,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      success: true,
      message: 'Successfully connected to GitHub!',
      user: result.user,
      sessionId: sessionId,
    };
  }

  /**
   * Endpoint to clear GitHub token for the current session
   * DELETE /github/token
   */
  @Delete('token')
  clearToken(@Req() req: Request) {
    const sessionId = this.getSessionId(req);
    this.githubService.clearToken(sessionId);
    return {
      success: true,
      message: 'GitHub token has been cleared for your session',
    };
  }

  /**
   * Endpoint to list all repositories for the authenticated user
   * GET /github/repos
   */
  @Get('repos')
  async getRepositories(@Req() req: Request) {
    const sessionId = this.getSessionId(req);
    
    if (!this.githubService.hasToken(sessionId)) {
      throw new HttpException(
        'No token set for this session. Please set a token first using POST /github/token',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const repos = await this.githubService.getRepositories(sessionId);
      return {
        success: true,
        count: repos.length,
        repositories: repos,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch repositories',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint to get files from a repository
   * GET /github/repos/:owner/:repo/files?path=
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   * @param path - Optional path to fetch files from (query parameter, defaults to root)
   */
  @Get('repos/:owner/:repo/files')
  async getRepositoryFiles(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('path') path: string,
    @Req() req: Request,
  ) {
    const sessionId = this.getSessionId(req);
    
    if (!this.githubService.hasToken(sessionId)) {
      throw new HttpException(
        'No token set for this session. Please set a token first using POST /github/token',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const files = await this.githubService.getRepositoryFiles(
        sessionId,
        owner,
        repo,
        path || '',
      );
      return {
        success: true,
        repository: `${owner}/${repo}`,
        path: path || '/',
        count: files.length,
        files: files,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch repository files',
          error: error.message,
        },
        error.message?.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint to get commits from a repository
   * GET /github/repos/:owner/:repo/commits?limit=30
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   * @param limit - Optional limit for number of commits (query parameter, defaults to 30, max 100)
   */
  @Get('repos/:owner/:repo/commits')
  async getRepositoryCommits(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('limit') limit: string,
    @Req() req: Request,
  ) {
    const sessionId = this.getSessionId(req);
    
    if (!this.githubService.hasToken(sessionId)) {
      throw new HttpException(
        'No token set for this session. Please set a token first using POST /github/token',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const limitNum = limit ? parseInt(limit, 10) : 30;
      if (isNaN(limitNum) || limitNum < 1) {
        throw new HttpException(
          'Limit must be a positive number',
          HttpStatus.BAD_REQUEST,
        );
      }

      const commits = await this.githubService.getRepositoryCommits(
        sessionId,
        owner,
        repo,
        limitNum,
      );
      return {
        success: true,
        repository: `${owner}/${repo}`,
        count: commits.length,
        commits: commits,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch repository commits',
          error: error.message,
        },
        error.message?.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

