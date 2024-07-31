/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common';
import { commonConfig } from '@ts-journey/common';

@Injectable()
export class AppService {
  async getNextMessage(): Promise<string> {
    return `Hello from "${commonConfig.PROJECT_NAME}"`;
  }
}
