
export interface AiActions {
  cleanData(input: string): Promise<string>;
  enrichData(input: string): Promise<string>;
}
