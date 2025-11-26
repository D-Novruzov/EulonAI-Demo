import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Neo4jModule } from './neo4j/neo4j.module';
import { ConfigModule } from '@nestjs/config';
import { Neo4jService } from './neo4j/neo4j.service';
import { RepoModule } from './repo/repo.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), Neo4jModule, RepoModule],
  controllers: [AppController],
  providers: [AppService, Neo4jService],
})
export class AppModule {}
