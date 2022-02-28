/**
 * This File contains functions that are used in multiple different modules of the bot.
 * For simplicity’s sake they are bundled into the util folder.
 */

const fs = require('fs');

//function getFiles, returns all files with a certain *ending* from a given *path*
const getFiles = (path, ending) =>{
    return fs.readdirSync(path).filter(f => f.endsWith(ending));
}

module.exports ={
    getFiles
}