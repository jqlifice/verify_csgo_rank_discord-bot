# Setup
## .env File
After installing the bot create an .env file in the root of the bot installation folder.
Configure it as follows:
```shell
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
