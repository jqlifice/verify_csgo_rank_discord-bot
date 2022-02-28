/**
 * This is an example of button response behavior.
 */

module.exports = {
    name:"pingButton",
    run: async (bot, interaction, parameters) =>{
        if(!interaction.guild) return interaction.reply({content:"this can only be run in a guild.", ephemeral: true});
        return interaction.reply({content:"pong", ephemeral: true});
    }
}