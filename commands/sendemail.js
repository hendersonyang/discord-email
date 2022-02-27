const { SMTPClient } = require('emailjs');
const { SlashCommandBuilder } = require('@discordjs/builders');

const client = new SMTPClient({
    user: process.env.smtp_username,
    password: process.env.smtp_password,
    host: process.env.smtp_server,
    port: process.env.smtp_port,
    tls: true
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendemail')
        .setDescription('Send emails!')
        .addStringOption(option =>
            option.setName('from')
                .setDescription('Email to send from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('to')
                .setDescription('Email to send to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('subject')
                .setDescription('Email Subject')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Email Body')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Sending...');
        client.send({
            from: `${interaction.user.tag} <${interaction.options.getString('from')}>`,
            to: `<${interaction.options.getString('to')}>`,
            subject: `${interaction.options.getString('subject')}`,
            text: `${interaction.options.getString('message')}`
        }, async function (err, message) {
            if (!err) {
                await interaction.editReply(`Sent, message id: ${message.header['message-id'].slice(1, -1)}`);
            } else {
                await interaction.editReply(`${err}`);
            }
        });
    },
};