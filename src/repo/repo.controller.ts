import { Controller, Get, Param } from '@nestjs/common';
import { RepoService } from './repo.service';

@Controller('repo')
export class RepoController {
  constructor(private repoService: RepoService) {}

  @Get(':id/graph')
  getGraph(@Param('id') id: string) {
    return this.repoService.getMockGraph(id);
  }

  @Get(':id/files')
  getFiles(@Param('id') id: string) {
    return this.repoService.getMockFiles();
  }

  @Get(':id/commits')
  getCommits(@Param('id') id: string) {
    return this.repoService.getMockCommits();
  }

  @Get(':id/contributors')
  getContributors(@Param('id') id: string) {
    return this.repoService.getMockContributors();
  }
  @Get(':id/issues')
  getIssues() {
    return [
      { id: 101, title: 'Fix login bug', state: 'open' },
      { id: 102, title: 'Refactor utils', state: 'closed' },
    ];
  }

  @Get(':id/prs')
  getPRs() {
    return [{ id: 201, title: 'Add authentication', merged: true }];
  }
}
