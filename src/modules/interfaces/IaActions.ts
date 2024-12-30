import { OpenAIMessageDto } from '../integrations/open-ia/dto/OpenAIMessageDto';

export interface IAActions {
  cleanData(input: string): Promise<string>;
  enrichData(input: string): Promise<string>;
}
