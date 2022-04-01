/**
 * This is used to set up the message containing the verify Buttons.
 * Usage (in Discord): verifly.verifyButtons
 */

const {MessageActionRow, MessageButton, MessageEmbed} = require("discord.js");

module.exports = {
    name: "verifyButtons",
    category: "setup",
    devOnly: true,
    run: async ({client, message, args}) => {
        message.channel.send({
            embeds: [
                new MessageEmbed().setTitle("Verify").setDescription("Verify your Steam or Faceit Account or check your current Verification Status").setColor("BLUE")
            ],
            components: [
                new MessageActionRow().addComponents([
                    new MessageButton().setStyle("PRIMARY").setLabel("Status").setCustomId("verifyStatus"),
                    new MessageButton().setStyle("PRIMARY").setLabel("Steam").setCustomId("verifySteam"),
                    new MessageButton().setStyle("PRIMARY").setLabel("Faceit").setCustomId("verifyFaceit")
                ])
            ]
        });
    }
};