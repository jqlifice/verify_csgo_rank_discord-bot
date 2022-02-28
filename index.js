/**
 * Index.js is the file used to load the bot. Calling it with Node establishes a connection to the Database and Discord.
 * It further creates a bot-object containing all relevant information, which then is passed into the outsourced files/functions of the bot.
 * It then loads those outsourced files into DiscordJS collections, making them available within the bot.
 *
 * Outsourcing commands and handlers, allows the bot to be fully modular, removing functions by simply renaming files from xyz.js to xyz.(basically anything else)
 * It also allows for easy import of already working commands into other bots simply by copying the features .js file into the other bots commands folder
 * An example is given in /commands/info/ping.js
 */

const DiscordJS = require('discord.js');
const fs = require('fs');
const pg = require('pg');

//read .env
require("dotenv").config();
let localizations = JSON.parse(fs.readFileSync('./localizations/'+process.env.Language+'.json'));

//init client passed intents are read-permissions required by the bot
const client = new DiscordJS.Client({
    intents: [DiscordJS.Intents.FLAGS.GUILDS, DiscordJS.Intents.FLAGS.GUILD_MESSAGES, DiscordJS.Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

//connect to PSQL DB
const dbClient = new pg.Client({
    host: process.env.DB_Host,
    port: process.env.DB_Port,
    user: process.env.DB_User,
    password: process.env.DB_Password
});
//TODO: fix DB or connect to MongoDB
//dbClient.connect();

//TODO: fetch owners/admins of bot from DB and place them in object
let owners = [process.env.DEV];

//create Bot element
let bot = {
    client, //discord client
    prefix: "verifly.",
    owners: owners,
    env: process.env, //information from the env file
    localizations, //localization strings for commands
    dbClient //dbClient
};

client.commands = new DiscordJS.Collection();
client.events = new DiscordJS.Collection();
client.slashcommands = new DiscordJS.Collection();
client.buttons = new DiscordJS.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events.js")(bot, reload);
client.loadCommands = (bot, reload) => require("./handlers/commands.js")(bot, reload);
client.loadSlashCommands = (bot, reload) => require("./handlers/slashcommands.js")(bot, reload);
client.loadButtons = (bot, reload) => require("./handlers/buttonClick")(bot, reload);

client.loadEvents(bot, false);
client.loadCommands(bot, false);
client.loadSlashCommands(bot, false);
client.loadButtons(bot, false);

module.exports = bot;

//bot goes live
client.login(process.env.TOKEN);