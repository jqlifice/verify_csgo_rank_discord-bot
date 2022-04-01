/**unverify.js
 * This is the logic behind the /unverify command. It accepts 2 Parameters: [mandatory] account-type or all, [mandatory] targeted User
 */
const {callback} = require("pg/lib/native/query");
//the object used for the choices of the first option
const options = [
    {name: "steam", value: "steam", description: "revoke steam"},
    {name: "faceit", value: "faceit", description: "revoke faceit"},
    {name: "all", value: "all", description: "revoke all"}
];
let promiseHolder = null; //for whatever reason interaction.followUp() parameter "ephemeral" only works if the promise of the function is not ignored, this is otherwise useless, still you should not delete it, as this will break the bot

module.exports = {
    name: "unverify", //name of the command, used in discord
    description: "used to revoke verification of steam and/or faceit account(s) of a user", //description shown by discord as soon as you start typing out the command
    options: [
        {
            name: "account", description: "select the account you want to verify", type:"STRING", choices: options, required: true
        },
        {
            name: "account-name", description: "tag the user who's authentication you want to revoke", type:"USER", required: true
        }
    ],
    run: async (bot, interaction) =>{
        let dbQuery;
        let revoke = [];
        if(bot.owners.indexOf(interaction.user.id) >= 0){
            interaction.deferReply({ephemeral: true});
            sleep(2000).then(()=>{
                switch(interaction.options._hoistedOptions[0].value){
                    case "steam":
                        dbQuery = `UPDATE veriflyUserDatabase SET steam_id = null WHERE discord_id = $1`;
                        revoke = bot.CSGORankGroupID;
                        revoke.push(bot.env.CSGO_RANK_Seperator_ID);
                        break;
                    case "faceit":
                        dbQuery = `UPDATE veriflyUserDatabase SET faceit_id = null WHERE discord_id = $1`;
                        revoke = bot.FaceitRankGroupID;
                        revoke.push(bot.env.CSGO_RANK_Seperator_ID);
                        break;
                    case "all":
                        dbQuery = `UPDATE veriflyUserDatabase SET steam_id = null, faceit_id = null WHERE discord_id = $1`;
                        bot.CSGORankGroupID.forEach((v) =>{
                            revoke.push(v);
                        });
                        bot.FaceitRankGroupID.forEach((v) =>{
                            revoke.push(v);
                        });
                        revoke.push(bot.env.CSGO_RANK_Seperator_ID);
                        revoke.push(bot.env.Faceit_RANK_Seperator_ID);
                        break;
                }
                interaction.options._hoistedOptions[1].member.roles.remove(revoke).then(()=>{
                    promiseHolder = interaction.followUp({content: "discord groups revoked", ephemeral: true});
                    bot.dbClient.query(dbQuery, [interaction.options._hoistedOptions[1].member.user.id], (err, res) =>{
                       if(err){
                           console.log(err);
                           promiseHolder = interaction.followUp({content: "internal error (DB)", ephemeral: true});
                       }else{
                           promiseHolder = interaction.followUp({content: "DB Updated", ephemeral: true});
                       }
                    });
                });
            });
        }else{
            interaction.reply({content: "you do not have permissions to run this command", ephemeral: true});
        }

    }
}


let sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};