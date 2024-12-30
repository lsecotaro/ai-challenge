import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { OpenAIMessageDto } from './dto/OpenAIMessageDto';
import { IAActions } from '../../interfaces/IaActions';
import * as process from 'process';
import { VehicleServiceType } from '../../commons/service-type.enum';

@Injectable()
export class OpenAIService implements IAActions {
  private readonly SYSTEM = 'system';
  private readonly USER = 'user';

  private openai: OpenAI;
  private openaiModel: string;
  private systemPrompt: string;
  private userPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openaiModel = process.env.OPENAI_MODEL;
    this.systemPrompt = process.env.PROMPT_SYSTEM_CLEAN_ENRICH;
    this.userPrompt = process.env.PROMPT_USER_CLEAN;
  }

  async cleanData(data: string): Promise<string> {
    const messages = this.buildPrompts(data);
    const response = await this.openai.chat.completions.create({
      model: this.openaiModel,
      temperature: 0.2,
      messages,
    });
    return response.choices[0]?.message?.content || '';
  }

  enrichData(input: string): Promise<string> {
    return Promise.resolve('');
  }

  private buildPrompts(data: string): Array<OpenAIMessageDto> {
    const servicesTypes = this.concatEnumValues(VehicleServiceType);
    const messages: Array<OpenAIMessageDto> = [
      {
        role: this.SYSTEM,
        content: this.systemPrompt,
      },
      {
        role: this.USER,
        content: this.userPrompt
          .replace('{1}', data)
          .replace('{2}', servicesTypes),
      },
    ];
    return messages;
  }
  private concatEnumValues(enumObject: any): string {
    return Object.values(enumObject).join(', ');
  }
}
