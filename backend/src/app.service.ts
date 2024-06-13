import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getConnected(): string {
    return 'KupiPodariDay connected';
  }
}
