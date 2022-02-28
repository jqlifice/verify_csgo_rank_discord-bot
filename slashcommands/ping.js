//This is an example command to help understand the basics of a discord slashcommand without the implementation of complex structures.

const numbers = [
    {name: "1", value: 1},
    {name: "420", value: 2}
];

module.exports = {
    name: "ping", //name of the command, used in discord: /ping
    description: "replies with pong", //description shown by discord as soon as you start typing out the command
    /**
     * options are the parameters passed to the bot after the /command in discord.
     * each object placed in the array acts as one option - name is shown as name, description displayed to the user while typing the option.
     * type limits the options to a user, text, number, etc. preventing users form entering data youre not expecting.
     * Choices further allows you to limit the options a user can enter. It expects an Array of objects.
     * The require attribute defines weather this option is optional or mandatory.
     */
    options: [
        {
            name: "number", description: "add a number", type:"NUMBER", choices: numbers, require: false
        }
    ],
    run: async (client, interaction) =>{
        let number = interaction.options.getNumber("number") || 0;

        /**
         * a reply to a command can provide either a string or an object, that object provides content(string), which will be the message content and further allows for parameters.
         * in this example ephemeral is used, this makes the reply private, therefor not displaying the usage of the command and the bots reply to other users.
         * Discord expects you to respond to a command within 3 seconds, if your code does not always finish within 3 seconds you can use
         *     interaction.deferReply();
         * this will cause discord to display "${applicationname} is thinking ..." and grants you up to 15 minutes of response time.
         * if you want to edit a reply within that timeframe use interaction.editReply()
         * if you want to respond to the same command again (within the timeframe) use interaction.followup()
         * if you want to remove a response to a command use interaction.deleteReply()
         */
        if(number == 0) interaction.reply({content: "pong", ephemeral: true});
        if(number == 1) interaction.reply("p1ng");
        if(number == 420) interaction.reply("funny number");
    }
}