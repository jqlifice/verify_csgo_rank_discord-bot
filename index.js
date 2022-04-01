/**Index.js
 * is the file used to load the bot. Calling it with Node establishes a connection to the Database and Discord.
 * It further creates a bot-object containing all relevant information, which then is passed into the outsourced files/functions of the bot.
 * It then loads those outsourced files into DiscordJS collections, making them available within the bot.
 *
 * The index is wrapped into an async block to allow awaiting logins
 */
(async function(){
const DiscordJS = require('discord.js');
const fs = require('fs');
const pg = require('pg');
const https = require('https');
const xml2js = require('xml2js').parseString;

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
    password: process.env.DB_Password,
    database: process.env.DB_Database
});
dbClient.connect();

const steam = require('steam-user');
let steamClient = new steam();

const csgo = require('globaloffensive');
let csgoGC = new csgo(steamClient);

steamClient.logOn({
    accountName: process.env.Steam_User,
    password: process.env.Steam_Password
});

await new Promise( (resolve) => steamClient.on('loggedOn', () => {
    console.log(`[index.js] logged into Steam account ${steamClient._logOnDetails.account_name}`);
    resolve();
}));

await steamClient.requestFreeLicense([730]);
steamClient.gamesPlayed([730], true);

await new Promise( (resolve) => csgoGC.on('connectedToGC', () => {
    console.log(`[index.js] connected to CSGO GC`);
    resolve();
}));


let owners = [];
const ownersQuery = `SELECT discord_id from veriflyUserDatabase WHERE status = 'admin'`;
dbClient.query(ownersQuery, (err, res) =>{
    if(err){
        return console.log(err);
    }else{
        owners=res;
    }
});
let configOwners = process.env.admins.split(',');
configOwners.forEach((v) => {
    owners.push(v);
});


let CSGORankGroupID = process.env.CSGO_RANK_DC_ID.split(',');
let FaceitRankGroupID = process.env.Faceit_RANK_DC_ID.split(',');

//create Bot element
let bot = {
    client, //discord client
    prefix: "verifly.",
    owners: owners, //list of discord ids allowed using protected command /unverify
    env: process.env, //information from the env file
    localizations, //localization strings for commands
    dbClient, //dbClient
    steamClient, //steamClient used to verify users
    csgoGC, //csgo Game coordinator
    SteamAPI: process.env.Steam_API_Key,
    CSGORankGroupID, //roleIDs of the csgo roles
    FaceitRankGroupID, //roleIDs of the faceit roles
    https,
    xml2js,
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
await client.login(process.env.TOKEN);

})();