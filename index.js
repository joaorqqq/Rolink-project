require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ] 
});

client.once('ready', async () => {
    console.log('✅ RoLink Online!');
    const setup = new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configura o sistema de verificação')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    await client.application.commands.create(setup);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setup') {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;

        // 1. Cria ou acha o canal de logs
        let logChannel = guild.channels.cache.find(c => c.name === 'rolink-logs');
        if (!logChannel) {
            logChannel = await guild.channels.create({
                name: 'rolink-logs',
                type: ChannelType.GuildText,
                permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }]
            });
        }

        // 2. O BOT CRIA O WEBHOOK SOZINHO AQUI:
        const webhooks = await logChannel.fetchWebhooks();
        let myWebhook = webhooks.find(wh => wh.name === 'RoLink-System');
        
        if (!myWebhook) {
            myWebhook = await logChannel.createWebhook({
                name: 'RoLink-System',
                avatar: client.user.displayAvatarURL(),
            });
        }

        console.log(`\n🔗 LINK DO WEBHOOK PARA O SITE:\n${myWebhook.url}\n`);

        await interaction.editReply({ content: `✅ Canal e Webhook configurados! O link do Webhook apareceu no seu Termux.` });
    }
});

// Lógica de dar o cargo quando o webhook avisar
client.on('messageCreate', async (message) => {
    if (message.content.includes('NOVA VERIFICAÇÃO')) {
        const roleV = message.guild.roles.cache.find(r => r.name === 'Verified');
        const members = await message.guild.members.fetch();
        const member = members.first(); // Aqui pegamos o membro que precisa do cargo

        if (member && roleV) {
            await member.roles.add(roleV);
            message.channel.send(`🎊 **${member.user.tag}** verificado pelo Webhook!`);
        }
    }
});

client.login(process.env.TOKEN);
