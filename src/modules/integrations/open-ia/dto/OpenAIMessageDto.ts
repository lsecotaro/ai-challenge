
export class OpenAIMessageDto {
    role: 'user' | 'assistant' | 'system';
    content: string;
}