require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] 
});

client.once('ready', async () => {
    console.log('✅ RoLink Online!');
    const setup = new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configura o servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    try {
        await client.application.commands.create(setup);
        console.log('✅ Comando registrado!');
    } catch (e) {
        console.log('❌ Erro no registro');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'setup') {
        await interaction.deferReply({ ephemeral: true });
        try {
            const g = interaction.guild;
            let rV = g.roles.cache.find(r => r.name === 'Verified') || await g.roles.create({ name: 'Verified', color: '#2ecc71' });
            let rU = g.roles.cache.find(r => r.name === 'Unverified') || await g.roles.create({ name: 'Unverified', color: '#95a5a6' });
            
            await interaction.editReply({ content: '✅ Sistema configurado com sucesso!' });
        } catch (e) {
            await interaction.editReply({ content: '❌ Erro no setup' });
        }
    }
});

client.login(process.env.TOKEN);
