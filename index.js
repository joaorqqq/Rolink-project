require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType 
} = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers // Necessário para detectar novos membros
    ] 
});

client.once('ready', async () => {
    console.log('✅ RoLink Online!');
    const setupCommand = new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Cria cargos e canais do RoLink')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    try {
        await client.application.commands.create(setupCommand);
        console.log('✅ Comando /setup registrado!');
    } catch (error) {
        console.error('❌ Erro ao registrar comando:', error);
    }
});

// EVENTO: Quando alguém entra no servidor
client.on('guildMemberAdd', async (member) => {
    try {
        const roleU = member.guild.roles.cache.find(r => r.name === 'Unverified');
        if (roleU) {
            await member.roles.add(roleU);
            console.log(`👤 ${member.user.tag} recebeu o cargo Unverified.`);
        }
    } catch (error) {
        console.error('❌ Erro ao dar cargo inicial:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setup') {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            // Criar Cargos (Verifica se já existem para não duplicar)
            let roleV = guild.roles.cache.find(r => r.name === 'Verified');
            if (!roleV) roleV = await guild.roles.create({ name: 'Verified', color: '#2ecc71' });

            let roleU = guild.roles.cache.find(r => r.name === 'Unverified');
            if (!roleU) roleU = await guild.roles.create({ name: 'Unverified', color: '#95a5a6' });

            // Criar Canal de Log
            let channel = guild.channels.cache.find(c => c.name === 'rolink-logs');
            if (!channel) {
                channel = await guild.channels.create({
                    name: 'rolink-logs',
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                    ]
                });
            }

            await interaction.editReply({
                content: `✅ **Sistema Ativo!**\nNovos membros receberão: <@&${roleU.id}>\nLogs em: <#${channel.id}>`
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Erro no setup. Verifique se o meu cargo está acima dos outros!' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
