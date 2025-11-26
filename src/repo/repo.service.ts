import { Injectable } from '@nestjs/common';

@Injectable()
export class RepoService {
  // ---------- DAY 2: EXTENDED MOCK GRAPH ----------
  getMockGraph(repoId: string) {
    return {
      repoId,

      nodes: [
        // --- FILES ---
        { id: 'file::src/index.js', type: 'File', label: 'src/index.js' },
        { id: 'file::src/app.js', type: 'File', label: 'src/app.js' },
        { id: 'file::src/utils.js', type: 'File', label: 'src/utils.js' },

        // --- COMMITS ---
        {
          id: 'commit::a1b2c3',
          type: 'Commit',
          label: 'a1b2c3',
          message: 'initial commit',
        },
        {
          id: 'commit::d4e5f6',
          type: 'Commit',
          label: 'd4e5f6',
          message: 'refactor utility functions',
        },

        // --- CONTRIBUTORS ---
        { id: 'contributor::david', type: 'Contributor', label: 'david' },
        { id: 'contributor::lasha', type: 'Contributor', label: 'lasha' },

        // --- ISSUES ---
        { id: 'issue::101', type: 'Issue', label: 'Fix login bug' },
        { id: 'issue::102', type: 'Issue', label: 'Refactor utils' },

        // --- PULL REQUESTS ---
        { id: 'pr::201', type: 'PR', label: 'Add authentication' },
      ],

      edges: [
        // ------- COMMIT -> FILE relations -------
        { from: 'commit::a1b2c3', to: 'file::src/index.js', type: 'MODIFIED' },
        { from: 'commit::a1b2c3', to: 'file::src/app.js', type: 'MODIFIED' },

        { from: 'commit::d4e5f6', to: 'file::src/utils.js', type: 'MODIFIED' },
        { from: 'commit::d4e5f6', to: 'file::src/app.js', type: 'MODIFIED' },

        // ------- CONTRIBUTOR -> COMMIT -------
        {
          from: 'contributor::david',
          to: 'commit::a1b2c3',
          type: 'COMMITTED_BY',
        },
        {
          from: 'contributor::lasha',
          to: 'commit::d4e5f6',
          type: 'COMMITTED_BY',
        },

        // ------- ISSUE RELATIONSHIPS -------
        { from: 'issue::101', to: 'file::src/index.js', type: 'AFFECTS' },
        { from: 'issue::102', to: 'file::src/utils.js', type: 'AFFECTS' },

        // ------- PR RELATIONSHIPS -------
        { from: 'pr::201', to: 'file::src/app.js', type: 'MODIFIES' },
      ],
    };
  }

  // ---------- SUPPORTING ENDPOINTS ----------

  getMockFiles() {
    return [
      { filePath: 'src/index.js', size: 2048 },
      { filePath: 'src/app.js', size: 1024 },
      { filePath: 'src/utils.js', size: 3072 },
    ];
  }

  getMockCommits() {
    return [
      { sha: 'a1b2c3', message: 'initial commit', timestamp: '2025-01-01' },
      { sha: 'd4e5f6', message: 'refactor utils', timestamp: '2025-01-05' },
    ];
  }

  getMockContributors() {
    return [
      { login: 'david', contributions: 28 },
      { login: 'lasha', contributions: 12 },
    ];
  }
}
