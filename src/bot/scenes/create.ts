import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { PrismaService } from 'src/prisma/prisma.service';
import { Markup, Scenes } from 'telegraf';

interface Product {
  name: string;
  price: number;
  count: number;
}

let prd: Partial<Product> = {};

@Wizard('create_product')
export class CreateScenes {
  constructor(private prisma: PrismaService) {}

  @WizardStep(1)
  async getName(@Ctx() ctx: Scenes.WizardContext) {
    await ctx.reply('Product name ?');
    ctx.wizard.next();
  }

  @WizardStep(2)
  async getPrice(@Ctx() ctx: Scenes.WizardContext) {
    await ctx.reply('Product price ?');
    prd.name = ctx.text;
    ctx.wizard.next();
  }

  @WizardStep(3)
  async getCount(@Ctx() ctx: Scenes.WizardContext) {
    let priceInput = ctx.text;

    if (isNaN(Number(priceInput))) {
      await ctx.reply('❌ Price must be is number.');
      return;
    }

    prd.price = Number(priceInput);

    await ctx.reply('Product count ?');
    ctx.wizard.next();
  }

  @WizardStep(4)
  async leave(@Ctx() ctx: Scenes.WizardContext) {
    let countInput = ctx.text;

    if (isNaN(Number(countInput))) {
      await ctx.reply('❌ Count must be is number.');
      return;
    }

    prd.count = Number(countInput);

    await this.prisma.product.create({ data: prd as Product });

    let messageId = ctx.message?.message_id;
    if (messageId) {
      for (let i = messageId; i > messageId - 50; i--) {
        try {
          await ctx.deleteMessage(i);
        } catch (error) {
          if (error.message.includes('message to delete not found')) {
            break;
          }
        }
      }
    }

    await ctx.reply('Product saved.');
    ctx.scene.leave();
    ctx.reply(
      `Main menu`,
      Markup.inlineKeyboard([
        [Markup.button.callback('➕ Create Product', 'create')],
        [Markup.button.callback('📜 Show Products', 'show')],
      ]),
    );
  }
}

interface prd {
  name: string;
  price: number;
  count: number;
}
