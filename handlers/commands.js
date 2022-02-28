/**
 * Commands.js is the loader file for all events stored in the /commands/ folder.
 * When called, it exports all commands in /commands/, making them available for the bot.
 * These commands are the "classic way of handling commands in discord, using a prefix[index.js -> bot].
 */

const {getFiles} = require ("../util/functions");
const fs = require("fs");

module.exports = (bot, reload) => {
    const {client} = bot;

    fs.readdirSync("./commands/").forEach((category) =>{
        let slashcommands = getFiles(`./commands/${category}`, ".js");
        slashcommands.forEach((f) => {
            if(reload) delete require.cache[require.resolve(`../commands/${category}/${f}`)]
            const command = require(`../commands/${category}/${f}`);
            client.commands.set(command.name, command);
        });
    });
    console.log(`[commands.js] Loaded ${client.commands.size} commands`);
};