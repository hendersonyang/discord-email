require("dotenv").config()

const fs = require("fs")
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(process.env.discord_token);
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});
client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

function callback(headers) {
    if (headers === "SEEN") return;
    function seeEmail(email) {
        let embed = new MessageEmbed()
            .setColor('#3b96d9')
            .setTitle('New Email')
            .setTimestamp(headers.date[0])
        if (!headers.to.length) {
            embed.addField("Sent To", headers.to)
        } else {
            embed.addField("Sent To", headers.to.join(", "))
        }
        if (!headers.from.length) {
            embed.addField("Sender", headers.from)
        } else {
            embed.addField("Sender", headers.from.join(", "))
        }
        embed.addFields(
            { name: 'Subject', value: headers.subject[0] },
            { name: 'Message', value: "```" + email + "```" }
        )
        client.channels.cache.get(process.env.channelId).send({ embeds: [embed] })
    }
    require("./email.js").getEmail(seeEmail)
}
require("./email.js").getHeader(callback)

rest.put(Routes.applicationGuildCommands(process.env.botId, process.env.guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.discord_token)