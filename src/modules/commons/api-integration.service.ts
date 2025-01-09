import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ApiIntegrationService {
  private readonly logger: Logger = new Logger(ApiIntegrationService.name);
  constructor() {}

  async retryableApiCall(
    apiFunction: () => Promise<any>,
    retries = 3,
  ): Promise<any> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await apiFunction();
      } catch (error) {
        if (error.response?.status === 429) {
          this.logger.log('API rate limit exceeded. Retrying in 1 second...');
          const retryAfter = error.response.headers['retry-after'] || 1;
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000),
          );
        } else {
          throw error;
        }
      }
      attempt++;
    }
    throw new Error('Exceeded retry attempts for API');
  }
}
