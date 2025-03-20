import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { PrismaModule } from './prisma/prisma.module';
import { session } from 'telegraf';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BotModule,
    TelegrafModule.forRoot({
      token: process.env.TOKEN!,
      middlewares: [session()],
    }),
    PrismaModule,
  ],
  providers: [],
})
export class AppModule {}
