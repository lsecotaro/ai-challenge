import { OpenAIMessageDto } from '../integrations/open-ia/dto/OpenAIMessageDto';

export interface AiActions {
  cleanData(input: string): Promise<string>;
  enrichData(input: string): Promise<string>;
}
