/**
 * loadSlash.js is used to load the Slash commands the bot is going to use. This has to be done before the bot goes live.
 * To do so, simply run "node loadSlash.js" in the root directory of the bot. After the program successfully terminated you can load the bot.
 * IMPORTANT: THIS FILE HAS TO BE EXECUTED EVERY TIME YOU ADD A NEW COMMAND.
 */

const Discord = require("discord.js");
require("dotenv").config();

const client = new Discord.Client({
    intents: ["GUILDS"]
});

let bot = {
    client,
};

client.slashcommands = new Discord.Collection();
client.loadSlashCommands = (bot, reload) => require("./handlers/slashcommands")(bot, reload);
client.loadSlashCommands(bot, false);

client.on("ready", async () =>{
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if(!guild)
        return console.error("GUILD_ID specified in .env was not found. Either the bot is not joined that guild, the ID is incorrect or something else went wrong.");

    await guild.commands.set([...client.slashcommands.values()]);
    console.log(`Loaded ${client.slashcommands.size} commands`);
    process.exit(0);
})

client.login(process.env.TOKEN);