/**
 * slashcommands.js is the loader file for all events stored in the /slashcommands/ folder.
 * When called, it exports all commands in /slashcommands/, making them available for the bot.
 */

const {getFiles} = require ("../util/functions");
const fs = require("fs");

module.exports = (bot, reload) => {
    const {client} = bot;

    let slashcommands = getFiles(`./slashcommands/`, ".js");

    slashcommands.forEach((f) => {
        if(reload) delete require.cache[require.resolve(`../slashcommands/${f}`)]
        const slashcommand = require(`../slashcommands/${f}`);
        client.slashcommands.set(slashcommand.name, slashcommand);
    });
    console.log(`[slashcommands.js] Loaded ${client.slashcommands.size} slashcommands`);
};