/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getNextMessage(): Promise<string> {
    return `Hello from nest api!`;
  }
}
