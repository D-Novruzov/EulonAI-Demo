import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { GitHubService } from './github.service';

class SetTokenDto {
  token: string;
}

@Controller('github')
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  /**
   * Endpoint to set GitHub token
   * POST /github/token
   * Body: { "token": "your_github_token_here" }
   */
  @Post('token')
  setToken(@Body() setTokenDto: SetTokenDto) {
    if (!setTokenDto.token || setTokenDto.token.trim() === '') {
      throw new HttpException(
        'Token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.githubService.setToken(setTokenDto.token);
      return {
        success: true,
        message: 'GitHub token has been set successfully',
      };
    } catch (error: any) {
      throw new HttpException(
        `Failed to set token: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint to test GitHub connection
   * GET /github/test
   * Returns user info if token is valid
   */
  @Get('test')
  async testConnection() {
    if (!this.githubService.hasToken()) {
      throw new HttpException(
        'No token set. Please set a token first using POST /github/token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.githubService.testConnection();
    
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
    };
  }
}

