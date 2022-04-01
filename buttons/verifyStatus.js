/**
 * This is the Button that returns the Users current verification Status.
 */

module.exports = {
    name:"verifyStatus",
    run: async (bot, interaction, parameters) =>{
        if(!interaction.guild) return interaction.reply({content:"this can only be run in a guild.", ephemeral: true});
        const queryStringSelect = 'SELECT steam_id, faceit_id from veriflyUserDatabase WHERE discord_id = $1';
        discordUserCheck(bot, interaction).then(()=> {
            bot.dbClient.query(queryStringSelect, [interaction.user.id], (err,res) => {
                if(err){
                    console.log(err);
                    return interaction.reply({content:"an internal error has occured, please notify the admins", ephemeral: true});
                }
                let steam = "not verified";
                let faceit = "not verified";
                if(res.rows[0].steam_id) steam = `linked to ${res.rows[0].steam_id}`
                if(res.rows[0].faceit_id) faceit = `linked to ${res.rows[0].faceit_id}`
                return interaction.reply({content:`Current Account verification status: \nSteam: ${steam} \nFaceit: ${faceit}`, ephemeral: true})
            });
        });
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