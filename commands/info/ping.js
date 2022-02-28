/**
 * This is an example command to help understand the basics of a text based command.
 * This is depracced, but I still decided to include it as there might be use cases where you would use this over a slashcommand. I just cant think of one now.
 * Usage (in discord): prefix[index.js]commandname (in this example verifly.ping)
 */

module.exports = {
    name: "ping", //this must match the file name, its also the name used to interact with the command
    category: "info",
    permissions: [],
    devOnly: false, //only people listed in owners[index.js] can run this command if set to true
    run: async ({client, message, args}) => {
        message.reply("pong");
    }
}