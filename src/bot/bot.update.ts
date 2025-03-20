import { Action, Ctx, Start, Update } from 'nestjs-telegraf';
import { PrismaService } from 'src/prisma/prisma.service';
import { Context, Markup, Scenes } from 'telegraf';

@Update()
export class BotUpdate {
  constructor(private prisma: PrismaService) {}

  @Start()
  async start(ctx: Context) {
    await this.clear(ctx);

    ctx.reply(
      `Hello ${ctx.from?.first_name}`,
      Markup.inlineKeyboard([
        [Markup.button.callback('➕ Create Product', 'create')],
        [Markup.button.callback('📜 Show Products', 'show')],
      ]),
    );
  }

  @Action('create')
  async Create(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.scene.enter('create_product');
  }

  mainmenu(ctx: Context) {
    ctx.reply(
      `Main menu`,
      Markup.inlineKeyboard([
        [Markup.button.callback('➕ Create Product', 'create')],
        [Markup.button.callback('📜 Show Products', 'show')],
      ]),
    );
  }

  async clear(ctx: Context) {
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
  }

  @Action('show')
  async Show(@Ctx() ctx: Context) {
    let data = await this.prisma.product.findMany();
    if (!data.length) {
      ctx.reply('Empty products');
    }

    data.forEach(async (prd) => {
      let product = `Product id: ${prd.id}\nProduct Name: ${prd.name}\nProduct price: ${prd.price}\nProduct count: ${prd['count']}`;
      await ctx.reply(
        product,
        Markup.inlineKeyboard([
          [Markup.button.callback('❌ Delete Product', 'delete')],
        ]),
      );
    });
    this.mainmenu(ctx);
  }

  @Action('delete')
  async Delete(@Ctx() ctx: Scenes.SceneContext) {
    let prds: any = ctx.text?.split('\n');
    let id = prds[0].split(' ').at(-1);

    await this.prisma.product.delete({ where: { id: +id } });
    ctx.reply('Product deleted!');
    this.mainmenu(ctx);
  }
}
