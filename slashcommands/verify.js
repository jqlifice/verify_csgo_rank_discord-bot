/**verify.js
 * This is the logic behind the /verify command. It accepts 2 Parameters: [mandatory] account-type or update, [optional] link to the acocunt or accountID, will throw an error if null while steam or faceit is specified
 */
const {callback} = require("pg/lib/native/query");
//the object used for the choices of the first option
const accounts = [
    {name: "steam", value: "steam", description: "steam"},
    {name: "face-it", value: "face-it", description: "faceit"},
    {name: "update", value: "update", description: "Update your ranks. You need to be online in steam and in game(CSGO) to use this."}
];

let holdPromise; //for whatever reason interaction.followUp() parameter "ephemeral" only works if the promise of the function is not ignored, this is otherwise useless, still you should not delete it, as this will break the bot


module.exports = {
    name: "verify", //name of the command, used in discord
    description: "used to verify steam or Faceit accounts", //description shown by discord as soon as you start typing out the command
    options: [
        {
            name: "account", description: "select the account you want to verify", type:"STRING", choices: accounts, required: true
        },
        {
            name: "account-name", description: "enter the link to the account you want to verify or its ID", type:"STRING", required: false
        }
    ],
    run: async (bot, interaction) =>{
        let accSwitch = interaction.options._hoistedOptions[0].value || 0;
        let acc;
        try { //fetches the account link/id from the command
            if (accSwitch !== "update") acc = interaction.options._hoistedOptions[1].value;
        }catch(e){
            return interaction.reply({content:"ERROR: No account provided.", ephemeral: true})
        }
        const queryCheckSteam = 'SELECT steam_id from veriflyUserDatabase WHERE discord_id = $1';
        const queryCheckFaceit = 'SELECT exists(SELECT * from veriflyUserDatabase WHERE discord_id = $1) as exists, steam_id, faceit_id from veriflyUserDatabase WHERE discord_id = $1';
        const queryCheckUpdate = 'SELECT exists(SELECT steam_id from veriflyUserDatabase WHERE discord_id = $1) as existsSteam, steam_id, faceit_id from veriflyUserDatabase WHERE discord_id = $1';

        //defers the Reply to make sure the command does not time out while running queries, before a first response can be sent
        interaction.deferReply({ephemeral: true});

        discordUserCheck(bot.dbClient, interaction.user.id).then((resolve, reject)=>{
            if(reject){
                console.log("DB Error", reject);
            }
            console.log(resolve);
            if(resolve) sleep(2000).then(()=> { //discord takes a short while to acknowledge the face that a reply has been deferred, so the bot halts for 2 seconds b4 sending any responses
                switch (accSwitch) { //this switch dictates the logic behind each parameter
                    case "steam":
                        let intErr = false;
                        bot.dbClient.query(queryCheckSteam, [interaction.user.id], (err, res) => {
                            if (err) {
                                console.log(err);
                                intErr = true;
                                return interaction.followUp({
                                    content: "an internal error has occurred, please contact the admins",
                                    ephemeral: true
                                });
                            }
                            if (res.rows[0].steam_id){
                                intErr = true;
                                return interaction.followUp({content: "ERROR: Steam already verified. To Update your rank use /verify update please.", ephemeral: true});
                            }
                            if (!/^\d+$/.test(acc)) { //checks if user provided account does not consist of only numbers
                                console.log(acc);
                                if(/^((http)s?:\/\/(www\.)?)?steamcommunity\.com\/profile\/.+$/.test(acc)){ //checks if it's a steamcommunity.com/profile/ link
                                    acc=acc.replace(/^((http)s?:(www\.)?\/\/)?steamcommunity\.com\/profile\//,""); //passes the steamID in the /profile link to addUser
                                }
                                if(/^((http)s?:\/\/(www\.)?)?steamcommunity\.com\/id\/.+$/.test(acc)){ //checks if it's a steamcommunity.com/id link
                                    console.log("match");
                                    console.log(acc.replace(/^((http)s?:\/\/(www\.)?)?steamcommunity\.com/,"").concat("?xml=1"));
                                    const options={
                                        hostname: "steamcommunity.com",
                                        port: 443,
                                        path: acc.replace(/^((http)s?:\/\/(www\.)?)?steamcommunity\.com/,"").concat("?xml=1"), //strips the (https://www.)steamcommunity.com part from the link and appends the "?xml=1" parameter to the end of the URL-Path, requesting steam to return the profile in XML format
                                        method: 'GET'
                                    };

                                    //requests the xml containing the user info
                                    const req = bot.https.request(options, res => {
                                        res.on("data", d =>{
                                            //parsing the xml to json
                                            bot.xml2js(d, function(err, res){
                                                if(err){
                                                    console.log(err);
                                                    return interaction.followUp({content: "internal error", ephemeral: true});
                                                }
                                                addUser(res.profile.steamID64[0], bot.steamClient, (added) =>{
                                                    if(!added.success){
                                                        console.log(added);
                                                        interaction.followUp({content: "internal error", ephemeral: true});
                                                    }else{
                                                        const confCode = Math.floor(Math.random()*90000) + 10000;
                                                        holdPromise = interaction.followUp({content:`the bot has sent you a Steam friend request, please accept it, launch CSGO and provide this code after launching CSGO within the next 5 minutes: ${confCode}`, ephemeral: true});
                                                        let added = processAddedSteam(bot.steamClient, bot.csgoGC, confCode, res.profile.steamID64[0]);
                                                        added.then((add) =>{
                                                            if(add.conf){
                                                                let groupArray = [bot.env.CSGO_RANK_Seperator_ID, bot.CSGORankGroupID[add.rank]];
                                                                if(!bot.env.CSGO_RANK_Seperator_ID) groupArray = [bot.CSGORankGroupID[add.rank]];
                                                                interaction.member.roles.add(groupArray).then(() =>{
                                                                    const queryInsertSteam = 'UPDATE veriflyUserDatabase SET steam_id = $1 WHERE discord_id = $2';
                                                                    bot.dbClient.query(queryInsertSteam, [res.profile.steamID64[0], interaction.user.id], (err, res) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            interaction.followUp({content: "internal error", ephemeral:true});
                                                                        }else{
                                                                            interaction.followUp({content: "your steam account has been verified", ephemeral: true});
                                                                        }
                                                                    });
                                                                });
                                                            }else{
                                                                console.log(add);
                                                                interaction.followUp({content: "internal error", ephemeral: true});
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                    });
                                    req.on("error", err => {
                                        console.log(err);
                                        intErr = true;
                                        return interaction.followUp({content:"couldn't get steamprofile, try using a steamID please.", ephemeral: true});
                                    });
                                    req.end();
                                }else{
                                    intErr = true;
                                    return interaction.followUp({content: "Provided Link is not a steamcommunity.com link", ephemeral: true});
                                }
                            }else{
                                console.log(acc);
                                addUser(acc, bot.steamClient, (added) =>{
                                    if(!added.success){
                                        console.log(added);
                                        interaction.followUp({content: "internal error", ephemeral: true});
                                    }else{
                                        const confCode = Math.floor(Math.random()*90000) + 10000;
                                        holdPromise = interaction.followUp({content:`the bot has sent you a Steam friend request, please accept it, launch CSGO and provide this code after launching CSGO within the next 5 minutes: ${confCode}`, ephemeral: true});
                                        let added = processAddedSteam(bot.steamClient, bot.csgoGC, confCode, acc);
                                        added.then((add) =>{
                                            if(add.conf){
                                                let groupArray = [bot.env.CSGO_RANK_Seperator_ID, bot.CSGORankGroupID[add.rank]];
                                                if(!bot.env.CSGO_RANK_Seperator_ID) groupArray = [bot.CSGORankGroupID[add.rank]];
                                                interaction.member.roles.add(groupArray).then(() =>{
                                                    const queryInsertSteam = 'UPDATE veriflyUserDatabase SET steam_id = $1 WHERE discord_id = $2';
                                                    bot.dbClient.query(queryInsertSteam, [acc, interaction.user.id], (err, res) => {
                                                        if(err){
                                                            console.log(err);
                                                            interaction.followUp({content: "internal error", ephemeral:true});
                                                        }else{
                                                            interaction.followUp({content: "your steam account has been verified", ephemeral: true});
                                                        }
                                                    });
                                                });
                                            }else{
                                                if(!add.rank){
                                                    interaction.followUp({content: "5 minutes are over, try again.", ephemeral: true});
                                                }else{
                                                    console.log(add);
                                                    interaction.followUp({content: "internal error", ephemeral: true});
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        break;
                    case "face-it":
                        bot.dbClient.query(queryCheckFaceit, [interaction.user.id], (errDB, resDB) => {
                            if(errDB){
                                console.error("Database error", errDB);
                                return interaction.followUp({content:"Internal Error", ephemeral: true});
                            }
                            if(resDB.rows[0].exists){
                                if(resDB.rows[0].faceit_id){
                                    return interaction.followUp({content:"Faceit Account already verified, to update your rank use ```/verify update```", ephemeral: true});
                                }else{
                                    updateFaceitRank(bot.https, bot.env.FaceitAPI, acc, resDB.rows[0].steam_id, 0, (callbackFaceit) => {
                                       switch(callbackFaceit.code){
                                           case 0:
                                               let groupArray = [bot.env.Faceit_RANK_Seperator_ID, bot.FaceitRankGroupID[callbackFaceit.level - 1]];
                                               if (!bot.env.Faceit_RANK_Seperator_ID) groupArray = [bot.FaceitRankGroupID[callbackFaceit.level - 1]];
                                               interaction.member.roles.add(groupArray).then(() =>{
                                                   const queryUpdateFaceit = 'UPDATE veriflyUserDatabase SET faceit_id = $1 WHERE discord_id = $2';
                                                   bot.dbClient.query(queryUpdateFaceit, [callbackFaceit.faceitID, interaction.user.id], (err, res) => {
                                                        if(err){
                                                            console.log(err);
                                                            return interaction.followUp({content: "internal error", ephemeral:true});
                                                        }else{
                                                           interaction.followUp({content: "your faceit account has been verified", ephemeral: true});
                                                        }
                                                   });
                                               });
                                               break;
                                           case 1:
                                               return interaction.followUp({content: "The account you have provided is not linked to your steam account.", ephemeral: true});
                                               break;
                                           case 2:
                                               return interaction.followUp({content: "You have not played CSGO on Faceit yet.", ephemeral: true});
                                               break;
                                           case 3:
                                               return interaction.followUp({content: "The account you have entered does not exist, or faceit has messed up", ephemeral: true});
                                           default:
                                               console.log(callbackFaceit.err);
                                               return interaction.followUp({content: "internal error", ephemeral:true});
                                               break;
                                       }
                                    });
                                }
                            }else{
                                return interaction.followUp({content: "you need to verify your steam account first.", ephemeral: true});
                            }
                        });
                        break;
                    case "update":
                        bot.dbClient.query(queryCheckUpdate, [interaction.user.id], (err, res) =>{
                            if(res.rows[0].existssteam){
                                addUser(res.rows[0].steam_id, bot.steamClient, (addRes) => {
                                    if(addRes.success){
                                        const confCode = Math.floor(Math.random()*90000) + 10000;
                                        holdPromise = interaction.followUp({content:`the bot has sent you a Steam friend request, please accept it, launch CSGO and provide this code after launching CSGO within the next 5 minutes: ${confCode}`, ephemeral: true});
                                        let add = processAddedSteam(bot.steamClient, bot.csgoGC, confCode, res.rows[0].steam_id);
                                        add.then((callbackAdded) => {
                                            if(callbackAdded.conf){
                                                interaction.member.roles.remove(bot.CSGORankGroupID).then(()=>{
                                                    interaction.member.roles.add(bot.CSGORankGroupID[callbackAdded.rank]).then(()=>{
                                                        interaction.followUp({content: "your csgo rank has been updated", ephemeral: true});
                                                        if(res.rows[0].faceit_id != null) updateFaceitRank(bot.https, bot.env.FaceitAPI, res.rows[0].faceit_id, res.rows[0].steam_id, 1,(callbackFaceit) => {
                                                            switch(callbackFaceit.code){
                                                                case 0:
                                                                    let groupArray = [bot.env.Faceit_RANK_Seperator_ID, bot.FaceitRankGroupID[callbackFaceit.level - 1]];
                                                                    if (!bot.env.Faceit_RANK_Seperator_ID) groupArray = [bot.FaceitRankGroupID[callbackFaceit.level - 1]];
                                                                    interaction.member.roles.remove(bot.FaceitRankGroupID).then(()=>{
                                                                        interaction.member.roles.add(groupArray).then(() =>{
                                                                            interaction.followUp({content: "your faceit rank has been updated", ephemeral: true});
                                                                        });
                                                                    });
                                                                    break;
                                                                case 1:
                                                                    return interaction.followUp({content: "The account you have linked is not linked to your steam account (anymore).", ephemeral: true});
                                                                    break;
                                                                case 2:
                                                                    return interaction.followUp({content: "You have not played CSGO on Faceit yet.", ephemeral: true});
                                                                    break;
                                                                case 3:
                                                                    return interaction.followUp({content: "The faceit account you are linked to does not exist (anymore), or faceit has messed up", ephemeral: true});
                                                                default:
                                                                    console.log(callbackFaceit.err);
                                                                    return interaction.followUp({content: "internal error", ephemeral:true});
                                                                    break;
                                                            }
                                                        });
                                                    });
                                                });
                                            }else{
                                                interaction.followUp({content: "You have exceeded 5 minutes or entered the wrong code, please try again", ephemeral: true});
                                            }

                                        });
                                    }
                                });
                            }else{
                                interaction.followUp({content: "you need to verify your steam account before updating ranks.", ephemeral: true});
                            }
                        });
                        break;
                    default:
                        return interaction.followUp({content: "invalid usage", ephemeral: true});
                }
            });
        }).catch(error => {
            console.log(error);
            return interaction.followUp(error);
        });
    }
}

/**discordUserCheck
 * checks weather a User is already in the linked Postgres Database and if not adds them to the Database
 * @param dbClient requires the postgres DB-Client object
 * @param user requires the discord userID of the user
 * @returns {} resolves with value true if it succeeds, rejects with the DB error
 */
function discordUserCheck(dbClient, user){
    const queryCheckDiscord = 'SELECT exists(SELECT 1 FROM veriflyUserDatabase WHERE discord_id = $1)';
    const queryInsertDiscord = 'INSERT INTO veriflyUserDatabase(discord_id) VALUES($1)';
    return new Promise(function(resolve, reject){
        dbClient.query(queryCheckDiscord, [user], (err, res) => {
            if(err){
                reject(err);
            }else{
                resolve(true);
            }
            if(!res.rows[0].exists){
                dbClient.query(queryInsertDiscord, [user], (err, res) => {
                    if(err){
                        reject(err);
                    } else{
                        resolve(true);
                    }
                });
            }
        });
    });
}


/**addUser
 * adds the specified steam account
 * @param acc steamID of the account that's supposed to be added
 * @param steamClient a steamClient object
 * @callback callback calls back with false if adding fails, with true if it succeeds, the following codes are also provided
 *  [true]14: Account was already added
 *  [true]null: <expected behavior> user was added
 *  [false]2: The Steam account doesn't exist
 *  [false]err: Unknown Error
 */
function addUser(acc, steamClient, callback){
    steamClient.addFriend(acc, (err, res) => {
        if (err) {
            switch (err.eresult) {
                case 2: //2 is thrown if a Steam account doesn't exist
                    callback({
                        success: false,
                        code: 2
                    });
                    break;
                case 14: //14 is thrown if a friend request has already been sent or the bot is already friends with the User
                    callback({
                        success: true,
                        code: 14
                    });
                    break;
                default:
                    callback({
                        success: false,
                        code: err
                    });
                    break;
            }
        } else {
            callback({
                success: true,
                code: null
            });
        }
    });
}

/**processAddedSteam
 * authenticates the user via steam chat
 * @param steamClient steamClient Object
 * @param csgoGC csgoGameCoordinator Object
 * @param confCode 2FA code, has to be disclosed to the user before this function is called
 * @param acc steamID of the user
 * @returns {conf, rank} conf(true/false): indicates weather the rank was successfully obtained, rank is a number from 0(unranked) to 18(global elite) indicating the users rank
 */
function processAddedSteam(steamClient, csgoGC, confCode, acc){
    return new Promise(function(resolve){
        let timer = setTimeout(resolve, 300000,{conf: false, rank: undefined});
        steamClient.on(`friendMessage#${acc}`, function(steamID, message){
            if(parseInt(message) === confCode){
                csgoGC.requestPlayersProfile(acc, (res) => {
                    let rankingObject;
                    if(parseInt(res.ranking.rank_type_id) === 6){
                        rankingObject=res.ranking;
                    }else{
                        res.rankings.forEach(x => {
                           if(parseInt(x.rank_type_id) === 6) rankingObject = x;
                        });
                    }
                    clearTimeout(timer);
                    resolve({
                        conf: true,
                        rank: rankingObject.rank_id
                    });
                });
            }else{
                clearTimeout(timer);
                resolve({
                    conf: false,
                    rank: null
                });
            }
        });
    });
}


/**updateFaceitRank
 * used to get the current Faceit Rank of a user
 * @param https https object, used to do an HTTPS-Get request
 * @param FaceitAPIKey the faceit API key used to authenticate to the faceit services
 * @param acc the faceit account identifier, this can either be a nickname or a faceitID (specified in acctype)
 * @param steamID the steamID of the steam account linked to the faceit account, this is used as verification method, as faceit drops the steamID in the playerInfo object
 * @param acctype can be set to 0 or 1, indicates the kind of account identifier passed in the acc argument: 0=nickname, 1=faceitID
 * @param callback calls back with a code, (level,) (faceitID), err
 *        codes:
 *              0 - success
 *              1 - steamID does not match
 *              2 - has not played csgo on faceit
 *              3 - account not found
 *              E - other error
 *        level: specifies the accounts faceit level
 *        faceitID: speicifies the accounts faceitID, a unique identifier
 *        err: specifies the kind of other error, will be null in case of success or code 1,2,3
 */
function updateFaceitRank(https, FaceitAPIKey, acc, steamID, acctype, callback){
    const headers={
        Authorization: "Bearer " + FaceitAPIKey
    };
    let path;
    if(acctype == 0) path = "/data/v4/players?nickname=";
    if(acctype == 1) path = "/data/v4/players/";
    if(acctype !=0 && acctype !=1){
        callback({
            code: 'E',
            err: "invalid account type specified"
        });
    }
    const request={
        hostname: "open.faceit.com",
        port: 443,
        path: path.concat(acc),
        accept: 'application/json',
        headers: headers
    };
    https.get(request, (res) => {
        let rawData;
        res.on('data', (chunk) => {
            rawData += chunk;
        });
        res.on('end', () => {
            rawData = rawData.replace(/^undefined/, "");
            let data;
            try{
                data=JSON.parse(rawData);
                if(!data.errors) {
                    if (data.games.csgo) {
                        if (data.steam_id_64 === steamID) {
                            callback({
                                code: 0,
                                level: data.games.csgo.skill_level - 1,
                                faceitID: data.player_id,
                                err: null
                            })
                        } else {
                            callback({
                                code: 1,
                                err: null
                            });
                        }
                    }else{
                        callback({
                            code: 2,
                            err: null
                        })
                    }
                }else{
                    callback({
                        code: 3,
                        err: null
                    });
                }
            }catch(e){
                callback({
                    code: 'E',
                    err: e
                })
            }
        });
    }).on("error", (err) => {
        callback({
            code: 'E',
            err: err
        })
    });
}

let sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};