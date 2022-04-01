/**
 * This is the Button that starts the Steam Verification Process for the clicking user.
 */

const {MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
module.exports = {
    name:"verifySteam",
    run: async (bot, interaction, parameters) =>{
        if(!interaction.guild) return interaction.reply({content:"this can only be run in a guild.", ephemeral: true});
        const queryStringSelect = 'SELECT steam_id, discord_id from veriflyUserDatabase WHERE discord_id = $1';
        const queryStringInsert = 'INSERT INTO veriflyUserDatabase(discord_id) VALUES($1)';
        discordUserCheck(bot, interaction).then(()=> {
            bot.dbClient.query(queryStringSelect, [interaction.user.id], (err, res) => {
                if (err) {
                    console.log(err);
                    return interaction.reply({
                        content: "an internal error has occured, please notify the admins",
                        ephemeral: true
                    });
                } else {
                    if (res.rows[0].discord_id === undefined) {
                        bot.dbClient.query(queryStringInsert, [interaction.user.id], (err2, res2) => {
                            if (err2) {
                                console.log(err2);
                                return interaction.reply({
                                    content: "an internal error has occured, please notify the admins",
                                    ephemeral: true
                                });
                            }
                        })
                    } else if (res.rows[0].steam_id !== undefined && res.rows[0].steam_id !== null) {
                        return interaction.reply({
                            content: `Your Discord Account is linked to your Steam account ${res.rows[0].steam_id}`,
                            ephemeral: true
                        });
                    }
                    if (res.rows[0].steam_id === null) {
                        return interaction.reply({
                            content: "verify your steam account by using ```/verify steam [id/link]```",
                            ephemeral: true
                        });
                    }
                }
            });
        }).catch((err) => {
            console.log(err);
            interaction.reply(err);
        })
    }
}

function discordUserCheck(bot, interaction){
    const queryCheckDiscord = 'SELECT exists(SELECT 1 FROM veriflyUserDatabase WHERE discord_id = $1)';
    const queryInsertDiscord = 'INSERT INTO veriflyUserDatabase(discord_id) VALUES($1)';
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            reject('timeout');
        }, 10000);
        bot.dbClient.query(queryCheckDiscord, [interaction.user.id], (err, res) => {
            if(err){
                console.log(err);
                reject("DB error");
            }else{
                resolve();
            }
            if(!res.rows[0].exists){
                bot.dbClient.query(queryInsertDiscord, [interaction.user.id], (err, res) => {
                    if(err){
                        console.log(err);
                        reject("DB error");
                    } else{
                        resolve();
                    }
                });
            }
        });
    });
}