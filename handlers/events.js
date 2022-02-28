/**
 * Events.js is the loader file for all events stored in the /events/ folder.
 * When called, it exports all events loaded, making them available for the bot.
 * Event handlers specified in the initEvents() function, are processed by the file with the same name as the handler from /events/
 *     ex: on.client("ready" [...] the function with in /events/ready.js is called
 * This is required to load slashcommands, regular commands, etc. which is done in the initEvents() function
 */


const {getFiles} = require("../util/functions.js");

module.exports = (bot, reload) => {
    const {client} = bot

    //fetch all events from the /events/ folder
    let events = getFiles("./events/", ".js");

    if(events.length === 0){
        console.log("[event.js] no events to load")
    }

    //load each event, clear it first if reloading instead of loading for the first time
    events.forEach((f, i) => {
        if(reload) delete require.cache[require.resolve(`../events/${f}`)]
        const event = require(`../events/${f}`);
        client.events.set(event.name, event)
        if(!reload) console.log(`[event.js] [${i+1}] ${f} loaded as ${event.name}`)
    })

    if(!reload) initEvents(bot);
}

function triggerEventHandler(bot, event, ...args){
    const {client} = bot;
    try{
        if(client.events.has(event))
            client.events.get(event).run(bot, ...args)
        else
            throw new Error(`Event ${event} does not exist`)
    }catch(e){
        console.error(e);
    }
}

//Initialize event Triggers -client.on("trigger"-, they are used for commands, buttons, upon ready up and much more
function initEvents(bot){
    const {client} = bot

    client.on("ready", () => {
        triggerEventHandler(bot, "ready")
    })
    client.on("messageCreate", (message)=>{
        triggerEventHandler(bot, "messageCreate", message)
    })
    client.on("interactionCreate", (interaction)=>{
       if(interaction.isCommand() && interaction.inGuild()) triggerEventHandler(bot, "slashCommand", interaction);
       if(interaction.isButton()) triggerEventHandler(bot, "buttonClick", interaction);
    })
}