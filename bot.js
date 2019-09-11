var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

// Initializes playlist dict
function init_playlist() {
    // for line in file: playlist['arg1'] = arg2
    var fs = require("fs");
    var file = fs.readFileSync("./playlist.txt").toString();
   // var text = file.replace(/(\r\n|\n|\r)/gm,"").split(" ");
    var text = file.split(" ");
    logger.info(text)

    var d = {};
    var ifKey = true;
    var keyVal = "";

    for (var word in text) {
        logger.info(text[word])
        if (ifKey) {
            keyVal = text[word];
            ifKey = false;
        } else {
            d[keyVal] = text[word];
            ifKey = true;
        }
    }
    return d;
}

// Initializes current set of playlists in a dict
var playlist_dict = init_playlist();

// Prints available YouTube playlists
function print_playlist(channelID, message) {
    for (var key in playlist_dict) {
        bot.sendMessage({
            to: channelID,
            message: key + ' ' + playlist_dict[key]
        })
    }
}

function add_to_playlist(genre, link) {
    if (link.substring(0, 23) == "https://www.youtube.com") {
        playlist_dict[genre] = link;
        // Update text file to reflect addition
        var fs = require("fs");
        fs.appendFile("./playlist.txt", genre + " " + link + "\r\n", function (err) {
            if (err) throw err;
        });
        return true;
    } 
    return false;
}

function remove_from_playlist(genre) {
    playlist_dict.delete(genre);
}

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        logger.info('arg is ' + cmd)
        args = args.splice(1);
        logger.info(message)
        switch(cmd) {
            // !ping
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Available commands:\n\n\
                              !playlist\n\
                              !'
                });
                break;

            case 'danielcho':
                //client.users.get("name", "dkcha#0103").id;
                bot.sendMessage({
                        to: channelID,
                        message: "<@380199617540653056> hello sir????! you like big poopoo"
                });
                break;

            // Prints available playlists on YouTube (used for FredBot)
            case 'playlists':
                print_playlist(channelID, message)
                break;

            case 'add':
                var input = message.split(" ");
                var addCheck = add_to_playlist(input[1], input[2]);
                if (addCheck) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'Playlist added successfully. Genre is ' + input[1] + ' and link is: ' + input[2]
                    });
                } else {
                     bot.sendMessage({
                        to: channelID,
                        message: 'Playlist failed to be added. Link must be from youtube.com'
                    });
                }
                break;

            default:
                bot.sendMessage({
                    to: channelID,
                    message: 'poopoo, type !help for commands'
                });
            
            // Just add any case commands if you want to..
         }
     }
});
