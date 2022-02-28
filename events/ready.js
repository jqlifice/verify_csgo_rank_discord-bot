/**
 * Ready.js is run upon bot ready up. It will execute the anonymous functions specified as the run-parameter of the export.
 * It is used to log and set the bots discord status.
 */

module.exports = {
    name: "ready",
    run: async(bot) => {
        console.log(`[index.js] Ready up! Bot logged in as ${bot.client.user.tag} on ${bot.client.guilds.cache.size} server(s)`);
        bot.client.user.setActivity({name: "you <3", type:"LISTENING"})
    }
}