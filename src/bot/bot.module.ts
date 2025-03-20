import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { CreateScenes } from './scenes/create';

@Module({
  providers: [BotUpdate, CreateScenes],
})
export class BotModule {}
