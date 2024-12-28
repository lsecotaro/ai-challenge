import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import {OpenAIMessageDto} from "./dto/OpenAIMessageDto";
import {IAActions} from "../../interfaces/IaActions";
import * as process from "process";

@Injectable()
export class OpenAIService implements IAActions {
    private readonly SYSTEM  = "system";
    private readonly USER = "user";

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
        this.userPrompt = process.env.PROMPT_USER_CLEAN_ENRICH;
    }

    cleanData(input: string): Promise<string> {
        return Promise.resolve("");
    }

    enrichData(input: string): Promise<string> {
        return Promise.resolve("");
    }

    async test(data: string): Promise<string> {
        const messages = this.buildPrompts(data);

        const response = await this.openai.chat.completions.create({
            model: this.openaiModel,
            messages,
        });
        return response.choices[0]?.message?.content || '';
    }

    private buildPrompts(data: string) {
        const messages: Array<OpenAIMessageDto> = [
            {
                role: this.SYSTEM,
                content: this.systemPrompt
            },
            {
                role: this.USER,
                content: "Here is some data: " + data + ". " + this.userPrompt
            }
        ];
        return messages;
    }
}
