/**
 * This is used to setup the message containing the ping button.
 * This is part of the button demonstration.
 * Usage (in Discord): verifly.pingButton
 */

const {MessageActionRow, MessageButton, MessageEmbed} = require("discord.js");

module.exports = {
    name: "pingButton",
    category: "setup",
    devOnly: true,
    run: async ({client, message, args}) => {
        message.channel.send({
            embeds: [
                new MessageEmbed().setTitle("Ping").setDescription("Ping bot").setColor("BLUE")
            ],
            components: [
                new MessageActionRow().addComponents([
                    new MessageButton().setStyle("PRIMARY").setLabel("Ping").setCustomId("pingButton")
                ])
            ]
        });
    }
};