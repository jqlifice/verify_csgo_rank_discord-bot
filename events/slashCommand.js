/**
 * slashCommand.js is used to handle the different slash commands
 */

module.exports = {
    name: "slashCommand",
    run: async(bot, interaction) => {
        let { client } = bot;
        let slashcmd = client.slashcommands.get(interaction.commandName);
        if(!slashcmd) return interaction.reply("invalid slash command");
        if(slashcmd.perms && !interaction.member.permissions.has(slashcmd.perms)) return interaction.reply("you do not have permission for this command");
        slashcmd.run(bot, interaction);
    }
}