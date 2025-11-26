import { Injectable } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
//FOR FUTURE USE
@Injectable()
export class Neo4jService {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME!,
        process.env.NEO4J_PASSWORD!,
      ),
    );
  }

  getSession() {
    return this.driver.session({ database: process.env.NEO4J_DATABASE });
  }
}
