/**
 * buttonClickjs is the loader file for all events stored in the /buttons/ folder.
 * When called, it exports all commands in /buttons/, making them available for the bot.
 */

const {getFiles} = require ("../util/functions");
const fs = require("fs");

module.exports = (bot, reload) => {
    const {client} = bot;

    let slashcommands = getFiles(`./buttons/`, ".js");

    slashcommands.forEach((f) => {
        if(reload) delete require.cache[require.resolve(`../buttons/${f}`)]
        const button = require(`../buttons/${f}`);
        client.buttons.set(button.name, button);
    });
    console.log(`[buttons.js] Loaded ${client.slashcommands.size} buttons`);
};