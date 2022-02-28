/**
 * messageCreate.js dictates the bots behavior on any message beeing sent by a user, this will be used for the level system.
 * This also is used for the legacy (prefix)commands.
 */
//TODO: levelsystem

const Discord = require("discord.js");

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        const {client, prefix, owners} = bot;
        //this code is used to decide what kind of message was sent and how to further process it
        if (!message.guild) return;
        if (message.author.bot) return;
        if (message.content.startsWith(prefix)) await legacyCommand(bot, message);
    }
}

//this is the support for legacy commands, stripping the prefix, checking for permissions, and passing the command to the command handler.
async function legacyCommand(bot, message){
    const {client, prefix, owners} = bot;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmdstr = args.shift();


    let command = client.commands.get(cmdstr);
    console.log(cmdstr);
    console.log(command);
    if(!command) return;

    let member = message.member

    if(command.devOnly && !owners.includes(member.id)) {
        return message.reply("this command is only available with permissions");
    }

    try{
        await command.run({...bot, message, args})
    }catch(e) {
        let errMsg = e.toString();
        if (errMsg.startsWith("?")) {
            errMsg = errMsg.slice(1);
            await message.reply(errMsg);
        } else {
            console.log(e);
        }
    }
}