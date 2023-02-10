# Setup
## .env File
After installing the bot create an .env file in the root of the bot installation folder.
Configure it as follows:
```ini
TOKEN=your Discord bot token
GUILD_ID=your Server ID (used for development)
language=your language code - avivable(DE, EN)
prefix=the prefix infront of non-slash commands
admins=discord IDs of admins (allowed to use /unverify @user), seperated by ','
DB_Host=host IP of your database
DB_Port=port of your database
DB_User=user for database
DB_Password=password for database user
DB_Database=the database you created the Table in
Steam_User=steam login name for the bot account
Steam_Password=steam login password for the bot account, there currently is no support for 2FA
FaceitAPI=your faceit API key
CSGO_RANK_Seperator_ID=ID of your csgo rank seperator role, or empty if you dont want to use seperators
CSGO_RANK_DC_ID=IDs of your discord roles matching csgo ranks in ascending order (id for unranked, id for s1, ..., id for global)
Faceit_RANK_Seperator_ID=ID of your faceit rank seperator role, or empty if you dont want to use serperators
Faceit_RANK_DC_ID=IDs of your discord roles matching csgo ranks in ascending order(id for level 1, id for level 2, ..., id for level 10)
```
## DB
The bot requires a Postgres Database. Provide the credentials in the .env file (as mentioned above).\
Further create the following Table and grant the account used for the Bot read and write permissions on it.
```sql
CREATE TABLE veriflyUserDatabase(discord_id bigint PRIMARY KEY, steam_id bigint DEFAULT NULL, faceit_id text DEFAULT NULL, status text DEFAULT 'user' check(status IN('user', 'mod')))
```
## Finish Setup
 loadSlash.js is used to load the Slash commands the bot is going to use. This has to be done before the bot goes live.
 To do so, simply run "node loadSlash.js" in the root directory of the bot. After the program successfully terminated you can load the bot.
 IMPORTANT: THIS FILE HAS TO BE EXECUTED EVERY TIME YOU ADD A NEW COMMAND.
 
## Run the bot
 ```bash
 node index.js
 ```

## Why is this declared unfinished, it works?
 1. Localizations are missing / command prompts are hardcoded
 2. Errors are only thrown to console
 3. Some documentation is missing
 4. index.js probably should be called main.js
 5. code quality is a bit iffy at some points (This bot was one of my first actual projects, which was bigger than a couple lines of code)
 
 If you want to address any of these issues feel free to do so and create a PR i'll definitly look at it!
