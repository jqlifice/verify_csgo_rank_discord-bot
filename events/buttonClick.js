/**
 * buttonClick.js is used to handle the different buttons
 */

module.exports = {
    name: "buttonClick",
    run: async(bot, interaction) => {
        let { client } = bot;
        let [name, ...params] = interaction.customId.split("-");
        let button = client.buttons.get(name);

        if(!button) return;

        button.run(bot, interaction, params);
    }
}