const {Telegraf} = require('telegraf');
const path = require('path');

const userBotToken = '6258800857:AAHFcQkY2mR9sZiUZZwy1vp08Qnbm--rXxA';
const managerBotToken = '6088926260:AAHmy5PKZqasTRuK4R0y3PdazDnJSCfjh6M';

// Создаем экземпляры ботов
const userBot = new Telegraf(userBotToken);
const managerBot = new Telegraf(managerBotToken);

// Сохраняем информацию о том, какой пользователь с каким менеджером связан
const confirmAsk = new Map();

// Обработчик команды /start в боте для пользователей
userBot.start(async (ctx) => { // Отправляем сообщение с кнопкой "Подключиться"
    const imagePath = path.join(__dirname, 'img', 'API.png');
    // Path to the image file

    // Send the image
    await ctx.replyWithPhoto({source: imagePath});
    await ctx.reply('Нажмите на кнопку "Подключиться", чтобы подключиться к API', {
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


userBot.action('connect', async (ctx) => {
    const imagePath = path.join(__dirname, 'img', 'oplata.jpg');
    // Path to the image file

    // Send the image
    await ctx.replyWithPhoto({source: imagePath});
    await ctx.replyWithHTML('Пожалуйста переведите 100USDT на этот кошелек:');
    await ctx.replyWithHTML('<b>547857485jfdf84urjeujduejjmejdmje84</b>', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Оплачено',
                        callback_data: 'payed'
                    }
                ],
            ]
        }
    });
});

userBot.action('payed', (ctx) => {
    ctx.replyWithHTML('<i>пришлите скрин подтверждения</i>');
})

userBot.on('photo', async (ctx) => { // Save information that the user wants to connect to the manager
    confirmAsk.set(ctx.from.id, null);
    ctx.reply('Ожидание подтверждения');

    // Forward the photo message to the manager bot
    await ctx.forwardMessage(647847147, ctx.message.message_id);
    userBot.telegram.sendMessage(647847147, `Новый запрос на верефикацию от ${
        ctx.from.first_name
    }`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Подтвердить',
                        callback_data: `approve-${
                            ctx.from.id
                        }`
                    }
                ],
            ]
        }
    });
});


/* // Обработчик кнопки "Подключиться" в боте для пользователей
userBot.action('connect', (ctx) => { // Сохраняем информацию о том, что пользователь хочет подключиться к менеджеру
    confirmAsk.set(ctx.from.id, null);
    ctx.reply('Ожидайте подтверждения от менеджера');
    // Отправляем сообщение менеджеру для подтверждения запроса
    managerBot.telegram.sendMessage(647847147, `Новый запрос на подключение от пользователя ${
        ctx.from.first_name
    }`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Connect',
                        callback_data: `approve-${ctx.from.id}`
                    }
                ],
            ]
        }
    });
}); */

// Обработчик кнопки "Подтвердить" в боте для менеджеров
userBot.action(/^approve-(\d+)$/, async (ctx) => { // Извлекаем id пользователя, которого нужно подключить
    const userId = parseInt(ctx.match[1], 10);
    // Связываем пользователя с текущим менеджером
    confirmAsk.set(userId, ctx.from.id);
    // Отправляем пользователю сообщение о подключении
    await userBot.telegram.sendMessage(userId, 'Оплата подтверждена');

    await userBot.telegram.sendMessage(userId, 'Мануал No1: https://telegra.ph/Podklyuchenie-do-TradeCoinAi-04-22', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Далее',
                        callback_data: 'next1'
                    }
                ],
            ]
        }
    });

});

userBot.action('next1', async (ctx) => {
    await ctx.reply('Пришлите API ключ');
});

/* userBot.on('text', async (ctx) => {
    await userBot.telegram.sendMessage(647847147, `API Ключ 1 от ${
        ctx.from.first_name
    }`);
    await ctx.forwardMessage(647847147, ctx.message.message_id);
    await ctx.reply('Мануал No2: https://telegra.ph/Podklyuchenie-do-TradeCoinAi-04-22', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Далее',
                        callback_data: 'next2'
                    }
                ],
            ]
        }});
}); */


userBot.action('next2', async (ctx) => {
    await ctx.reply('Пришлите API ключ для чтения');
});

/* userBot.on('text', async (ctx) => {
    await userBot.telegram.sendMessage(647847147, `API Ключ 2 от ${
        ctx.from.first_name
    }`);
    await ctx.forwardMessage(647847147, ctx.message.message_id);

    const imagePath = path.join(__dirname, 'img', 'done.png'); // Path to the image file

    // Send the image
    await ctx.replyWithPhoto({
        source: imagePath
    });
    await ctx.reply('Готово! Ожидайте подключения');
}); */


const userStates = {};

// Handler for all types of messages
userBot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const messageText = ctx.message.text;

    // Check the user's state
    if (! userStates[userId]) { // Handle the first type of message
        await userBot.telegram.sendMessage(647847147, `API Ключ 1 от ${
            ctx.from.first_name
        }`);
        await ctx.forwardMessage(647847147, ctx.message.message_id);
        await ctx.reply('Мануал No2: https://telegra.ph/Podklyuchenie-do-TradeCoinAi-04-22', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Далее',
                            callback_data: 'next2'
                        }
                    ],
                ]
            }
        });

        // Set the user's state to indicate the first type of message is handled
        userStates[userId] = 'firstTypeHandled';
    } else if (userStates[userId] === 'firstTypeHandled') { // Handle the second type of message
        await userBot.telegram.sendMessage(647847147, `API Ключ 2 от ${
            ctx.from.first_name
        }`);
        await ctx.forwardMessage(647847147, ctx.message.message_id);
        const imagePath = path.join(__dirname, 'img', 'done.png');
        // Path to the image file

        // Send the image
        await ctx.replyWithPhoto({source: imagePath});
        await ctx.reply('Готово! Ожидайте подключения');

        // Set the user's state to indicate the second type of message is handled
        userStates[userId] = 'secondTypeHandled';
    }
});

userBot.launch();
managerBot.launch();
