const { Telegraf, Markup, session } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Session middleware for conversation state
bot.use(session());

// Enhanced start command with interactive keyboard
bot.command('start', async (ctx) => {
    const welcomeMessage = `🚀 *Welcome to FunnelGram* 🚀

The world's first native Telegram funnel builder!

✨ *Features:*
• Create marketing funnels in 60 seconds
• Lead capture forms & upsell pages
• Real-time analytics
• 100% inside Telegram

Use /create to build your first funnel!`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎯 Create Funnel', 'create_funnel')],
        [Markup.button.callback('📊 My Funnels', 'view_funnels'), Markup.button.callback('📈 Analytics', 'view_analytics')],
        [Markup.button.url('📚 Tutorial', 'https://example.com/tutorial')]
    ]);

    await ctx.replyWithMarkdown(welcomeMessage, keyboard);
});

// Create funnel command with conversation flow
bot.command('create', async (ctx) => {
    ctx.session = { creatingFunnel: true, step: 'name' };
    await ctx.reply('🌟 *Let\'s create your funnel!*\n\nWhat would you like to name your funnel?', {
        parse_mode: 'Markdown',
        ...Markup.removeKeyboard()
    });
});

// Handle funnel creation conversation
bot.on('text', async (ctx) => {
    if (ctx.session && ctx.session.creatingFunnel) {
        switch (ctx.session.step) {
            case 'name':
                ctx.session.funnelName = ctx.message.text;
                ctx.session.step = 'description';

                await ctx.reply('📝 *Great!* Now describe what this funnel does:', {
                    parse_mode: 'Markdown',
                    ...Markup.keyboard([['🚫 Skip']]).resize()
                });
                break;

            case 'description':
                ctx.session.funnelDescription = ctx.message.text === '🚫 Skip' ? '' : ctx.message.text;
                await createFunnelInDatabase(ctx);
                break;
        }
    }
});

async function createFunnelInDatabase(ctx) {
    try {
        const { data: funnel, error } = await supabase
            .from('funnels')
            .insert([{
                name: ctx.session.funnelName,
                description: ctx.session.funnelDescription,
                telegram_user_id: ctx.from.id.toString(),
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;

        // Create default steps
        const steps = [
            {
                funnel_id: funnel.id,
                step_order: 1,
                type: 'landing',
                title: 'Welcome to ' + ctx.session.funnelName,
                content: 'This is your landing page. Edit it to match your offer!',
                button_text: 'Get Started'
            },
            {
                funnel_id: funnel.id,
                step_order: 2,
                type: 'lead_capture',
                title: 'Join Our Community',
                content: 'Enter your email to get exclusive access:',
                button_text: 'Submit'
            },
            {
                funnel_id: funnel.id,
                step_order: 3,
                type: 'thank_you',
                title: 'Thank You!',
                content: 'Check your email for next steps.',
                button_text: 'Close'
            }
        ];

        const { error: stepsError } = await supabase
            .from('funnel_steps')
            .insert(steps);

        if (stepsError) throw stepsError;

        const webAppUrl = `${process.env.WEB_APP_BASE_URL}/funnel.html?funnel_id=${funnel.id}&step=1&user_id=${ctx.from.id}`;

        const successMessage = `✅ *Funnel Created Successfully!*

*Name:* ${ctx.session.funnelName}
${ctx.session.funnelDescription ? `*Description:* ${ctx.session.funnelDescription}\n` : ''}

Share this funnel using the button below:`;

        const keyboard = Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Open Your Funnel', webAppUrl)],
            [Markup.button.callback('⚡ Share Funnel', `share_${funnel.id}`)],
            [Markup.button.callback('📝 Edit Funnel', `edit_${funnel.id}`)]
        ]);

        await ctx.replyWithMarkdown(successMessage, keyboard);

        // Reset session
        ctx.session = {};

    } catch (error) {
        console.error('Error creating funnel:', error);
        await ctx.reply('❌ Sorry, there was an error creating your funnel. Please try again.');
    }
}

// View funnels command
bot.command('funnels', async (ctx) => {
    try {
        const { data: funnels, error } = await supabase
            .from('funnels')
            .select('*')
            .eq('telegram_user_id', ctx.from.id.toString())
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!funnels || funnels.length === 0) {
            return await ctx.reply('You haven\'t created any funnels yet. Use /create to get started!');
        }

        let message = `📂 *Your Funnels* (${funnels.length})\n\n`;
        const keyboard = [];

        funnels.forEach((funnel, index) => {
            message += `*${index + 1}. ${funnel.name}*\n`;
            message += `🆔: ${funnel.id.slice(0, 8)}... | 📊 Active\n\n`;

            const webAppUrl = `${process.env.WEB_APP_BASE_URL}/funnel.html?funnel_id=${funnel.id}&step=1`;
            keyboard.push([Markup.button.webApp(`📱 ${funnel.name}`, webAppUrl)]);
        });

        keyboard.push([Markup.button.callback('🆕 Create New', 'create_funnel')]);

        await ctx.replyWithMarkdown(message, Markup.inlineKeyboard(keyboard));

    } catch (error) {
        console.error('Error fetching funnels:', error);
        await ctx.reply('❌ Error loading your funnels.');
    }
});

// Handle button callbacks
bot.action(/share_(.+)/, async (ctx) => {
    const funnelId = ctx.match[1];
    const webAppUrl = `${process.env.WEB_APP_BASE_URL}/funnel.html?funnel_id=${funnelId}&step=1`;

    await ctx.reply(`🔗 *Share your funnel:*\n\n${webAppUrl}\n\nCopy this link and share it anywhere!`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.url('📤 Share on Telegram', `https://t.me/share/url?url=${encodeURIComponent(webAppUrl)}&text=Check out this awesome funnel!`)],
            [Markup.button.callback('⬅️ Back', 'view_funnels')]
        ])
    });

    await ctx.answerCbQuery();
});

bot.action('create_funnel', async (ctx) => {
    await ctx.reply('🌟 *Let\'s create your funnel!*\n\nWhat would you like to name your funnel?', {
        parse_mode: 'Markdown'
    });
    ctx.session = { creatingFunnel: true, step: 'name' };
    await ctx.answerCbQuery();
});

bot.action('view_funnels', async (ctx) => {
    await ctx.reply('Use /funnels to view all your created funnels!');
    await ctx.answerCbQuery();
});

// Web App data handler
bot.on('web_app_data', async (ctx) => {
    const data = JSON.parse(ctx.webAppData.data);

    try {
        // Track funnel progress
        const { error } = await supabase
            .from('funnel_analytics')
            .insert([{
                funnel_id: data.funnel_id,
                step_id: data.step_id,
                telegram_user_id: data.user_id,
                event_type: data.event_type,
                event_data: data.event_data
            }]);

        if (error) throw error;

        // If it's a form submission, save the lead
        if (data.event_type === 'lead_captured' && data.form_data) {
            const { error: leadError } = await supabase
                .from('leads')
                .insert([{
                    funnel_id: data.funnel_id,
                    telegram_user_id: data.user_id,
                    email: data.form_data.email,
                    name: data.form_data.name,
                    submitted_data: data.form_data
                }]);

            if (leadError) throw leadError;

            // Send confirmation to user
            await ctx.reply('🎉 *Thank you for submitting!* We\'ll be in touch soon.', {
                parse_mode: 'Markdown'
            });
        }

    } catch (error) {
        console.error('Error processing web app data:', error);
    }
});

// Error handling
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
    ctx.reply('❌ An error occurred. Please try again.');
});

// Start bot
bot.launch().then(() => {
    console.log('🚀 FunnelGram bot is running!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));