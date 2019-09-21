const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login(config.token);

// Initializes playlist dict using 'playlist.txt' as source
function init_playlist() {
    var fs = require('fs');
    var file = fs.readFileSync('./playlist.txt').toString();

    // Formats text file by [genre, link, ..., ...]
    var textFile = file.split(';');

    var dict = {};
    var ifKey = true;
    var keyVal = "";

    // Initializes dict by alternating from genre/link
    for (var i in textFile) {
        if (ifKey) {
            keyVal = textFile[i].replace(/(\r\n|\n|\r)/gm, "");
            ifKey = false;
        } else {
            dict[keyVal] = textFile[i];
            ifKey = true;
        }
    }
    return dict;
}

// Initializes current set of playlists in a dict
var playlist_dict = init_playlist();

// Prints available YouTube playlists
function print_playlist(message) {
    for (var key in playlist_dict) {
        message.channel.send(key + ' : ' + playlist_dict[key]);
    }
}

function add_to_playlist(genre, link) {
	if (genre.length > 0 && link.length > 0) {
	    if (link.startsWith('https://www.youtube.com')) {
	        playlist_dict[genre] = link;
	        // Update text file to reflect addition
	        var fs = require("fs");
	        fs.appendFile("./playlist.txt", genre + ";" + link + ";\r\n", function (err) {
	            if (err) throw err;
	        });
	        return true;
	    }
    } 
    return false;
}

function remove_from_playlist(genre) {
    playlist_dict.delete(genre);
}


function display_help(message) {
    message.channel.send(`Available commands:\n
    					  \t!help, !commands
    					  \t!playlists
    					  \t!add [playist name], [youtube link]
    					  \t!remove [playlist name]
    					  \t...
    					  \tWIP`);
}


// Messaging portion
client.on('message', message => {
    // Our client needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content === '!help' || message.content === '!commands') {
        display_help(message);
    } else if (message.content === '!playlists') {
    	print_playlist(message);
    } else if (message.content.startsWith('!add')) {
    	var input = message.content.substring(5).split(",");

    	// Checks validity of command
        var addCheck = add_to_playlist(input[0].trim(), input[1].trim());

        if (addCheck) {
        	message.channel.send('Playlist added successfully. Genre is ' + input[0]);
        } else {
        	message.channel.send('Playlist failed to be added. Link must be from youtube.com');
        }
    } else if (message.content.startsWith('!remove')) {
    	console.log(message.content.split(" ")[1]);
    	remove_from_playlist(message.content.split(" ")[1]);
    }
        /*
        // Mention practice
        case 'danielcho':
            //client.users.get("name", "dkcha#0103").id;
            client.sendMessage({
                    to: channelID,
                    message: "<@380199617540653056> hello sir????! you like big poopoo"
            });
            break;

        // Prints available playlists on YouTube (used for Fredclient)
        case 'playlists':
            print_playlist(channelID, message)
            break;

        case 'add':
            var input = message.split(" ");
            var addCheck = add_to_playlist(input[1], input[2]);
            if (addCheck) {
                client.sendMessage({
                    to: channelID,
                    message: 'Playlist added successfully. Genre is ' + input[1] + ' and link is: ' + input[2]
                });
            } else {
                 client.sendMessage({
                    to: channelID,
                    message: 'Playlist failed to be added. Link must be from youtube.com'
                });
            }
            break;

        default:
            client.sendMessage({
                to: channelID,
                message: 'poopoo, type !help for commands'
            });
        
        // Just add any case commands if you want to..
     }
     */
});