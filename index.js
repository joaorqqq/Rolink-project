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
    // Registra o comando /setup para criar o Webhook
    const setup = new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Cria o Webhook e configura o canal de logs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    
    try {
        await client.application.commands.create(setup);
        console.log('✅ Comando /setup pronto para uso no Discord.');
    } catch (error) {
        console.log('❌ Erro ao registrar comando:', error.message);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setup') {
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;

            // Cria o Webhook automaticamente no canal onde você usou o comando
            const webhook = await channel.createWebhook({
                name: 'RoLink-System',
                avatar: client.user.displayAvatarURL(),
            });

            // ESTE É O MOMENTO: O link aparece aqui no seu Termux!
            console.log('\n-----------------------------------------');
            console.log('🚀 COPIE O LINK ABAIXO PARA O SEU HTML (index.html):');
            console.log(webhook.url);
            console.log('-----------------------------------------\n');

            await interaction.editReply({ content: `✅ Webhook criado com sucesso! Verifique o console do seu Termux para pegar o link.` });
        } catch (error) {
            console.log('❌ Erro no Setup:', error.message);
            await interaction.editReply({ content: `❌ Erro: Verifique se o bot tem permissão de "Gerenciar Webhooks".` });
        }
    }
});

// Lógica para o bot ler a mensagem do Webhook e dar o cargo
client.on('messageCreate', async (message) => {
    // Se a mensagem começar com /verify (vinda do seu site via Webhook)
    if (message.content.startsWith('/verify')) {
        const userId = message.content.split(' ')[1];
        
        if (!userId || userId === 'null') return;

        try {
            const member = await message.guild.members.fetch(userId);
            const roleV = message.guild.roles.cache.find(r => r.name === 'Verified');
            
            if (member && roleV) {
                await member.roles.add(roleV);
                message.channel.send(`🎊 **${member.user.tag}** verificado automaticamente! (ID: ${userId})`);
            }
        } catch (e) {
            console.log(`❌ Erro: Não achei o usuário ${userId} no servidor.`);
        }
    }
});

client.login(process.env.TOKEN);
