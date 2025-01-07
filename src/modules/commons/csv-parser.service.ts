import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class CsvParserService {
  async parseCsv(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from(buffer);
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }
}
