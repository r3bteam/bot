const Discord = require('discord.js');
const client = new Discord.Client();
const client = new Discord.Client();
let config = require('./config.json')
let tokens = require('./tokens.json')
const YouTube = require('youtube-node');
const yt = require('ytdl-core');
var youTube = new YouTube();
youTube.setKey('AIzaSyDtLJezFAIk6FR36SxG-QbN2vdjs9MXujc');


const prefix = "1";
client.on("ready", async () => {
	console.log(`Bot is ready! ${client.user.username}`);
	client.user.setActivity(`Type ${prefix}play`, {type: 'PLAYING'})
// 'subscribe': (msg) => {
    // if (message.guild.id === '479090634813341696') {
    //     let member = message.guild.member
    //     var role = message.guild.roles.find('name', "Subscriber");
    //     message.member.addRole(role)
    //     message.channel.sendMessage(`:tada: You have successfully subscribed!`)
    // } else {
    //     message.reply('Sorry but this command only works in my guild')
let queue = {}; 
const commands = {
	'play': (msg) => {
		if (!msg.guild || !msg.member) return;
		const voiceChannel = msg.member.voiceChannel;
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with ${prefix}add`);
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
		if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing Music.');
		let dispatcher;
		queue[msg.guild.id].playing = true;

		console.log(queue);
		(function play(song) {
			console.log(song);
			if (song === undefined) return msg.channel.sendMessage('Leaving voiceChannel... Queue is empty').then(() => {
				queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
			msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
			dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : tokens.passes });
			let collector = msg.channel.createCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(prefix + 'pause')) {
					if (!voiceChannel || voiceChannel.type !== 'voice') return msg.channel.sendMessage(':fire: Please join a voiceChannel.');	
					msg.channel.sendMessage('Paused music').then(() => {dispatcher.pause();});
				} else if (m.content.startsWith(prefix + 'resume')){
						if (!voiceChannel || voiceChannel.type !== 'voice') return msg.channel.sendMessage(':fire: Please join a voiceChannel.');
					msg.channel.sendMessage('Resumed music').then(() => {dispatcher.resume();});
				} else if (m.content.startsWith(prefix + 'skip')){
						if (!voiceChannel || voiceChannel.type !== 'voice') return msg.channel.sendMessage(':fire: Please join a voiceChannel.');
					// msg.channel.sendMessage('This command is currently disabled at the time being.')
					msg.channel.sendMessage('Song skipped.').then(() => {dispatcher.end();});
				// } else if (m.content.startsWith(prefix + 'time')){
				// 	msg.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
			});
			dispatcher.on('end', () => {
				collector.stop();
				queue[msg.guild.id].songs.shift();
				play(queue[msg.guild.id].songs[0]);
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('error: ' + err).then(() => {
					collector.stop();
					queue[msg.guild.id].songs.shift();
					play(queue[msg.guild.id].songs[0]);
				});
			});
		})(queue[msg.guild.id].songs[0]);
	},
	'join': (msg) => {
		if (!msg.guild || !msg.member) return;
		return new Promise((resolve, reject) => {
			const voiceChannel = msg.member.voiceChannel;
			if (!voiceChannel || voiceChannel.type !== 'voice') return msg.channel.sendMessage(':fire: Please join a voiceChannel.');
			voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
		});
	},
	// 'add': (msg) => {
	// 	let url = msg.content.split(' ')[1];
	// 	if (url == '' || url === undefined) return msg.channel.sendMessage(`You must add a url, or youtube video id after ${prefix}add`);
	// 	yt.getInfo(url, (err, info) => {
	// 		if(err) return msg.channel.sendMessage('Invalid YouTube Link: ' + err);
	// 		if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
	// 		queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
	// 		msg.channel.sendMessage(`**Added __${info.title}__ to the queue** Requested by ${msg.author.username}`);
	// 	});
	// },
	
	'add': (msg, err, env) => {
		if (!msg.guild || !msg.member) return;
	return new Promise((resolve, reject) => {
	 let name = msg.content.split(" ").splice(1).join(" ");
	             	if (name == '' || name === undefined) return msg.channel.sendMessage(`:fire: An error has occured. Please do ${prefix}add \`<url|song name>\``)
            youTube.search(name, 1, function(error, result) {
                if (error) {
                    if (err) return msg.channel.sendMessage('Error: ' + err);
                } else {
                if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = []; 
                queue[msg.guild.id].songs.push({
                    url: `https://www.youtube.com/watch?v=${result.items[0].id.videoId}`,
                    title: result.items[0].snippet.title,
                    requester: msg.author.username
                });
                  //   msg.channel.sendMessage(`**Added __${result.items[0].snippet.title}__ to the queue** Requested by ${msg.author.username}`);
                     msg.channel.sendMessage("", {embed: {
					description: `**Added __${result.items[0].snippet.title}__ to the queue** Requested by ${msg.author.username}`
}
});
                }
            });   
	});	
	},
	'queue': (msg) => {
		if (!msg.guild || !msg.member) return;
		if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with ${prefix}add`);
		let tosend = [];
		queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
		msg.channel.sendMessage(`Current songs queued ${(tosend.length > 5 ? '*[Only next 5 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
	
	},
	'stop': (msg) => {
		if (!msg.guild || !msg.member) return;
	return new Promise((resolve, reject) => {	
	const voiceChannel = msg.member.voiceChannel;
voiceChannel.leave()
	// 	let tosend = [`Currently playing ${info.title} requested by ${msg.author.username}`];
	// 	msg.channel.sendMessage(tosend.join('\n'));
	});
	},
	'leave': (msg) => {
		if (!msg.guild || !msg.member) return;
	return new Promise((resolve, reject) => {	
	const voiceChannel = msg.member.voiceChannel;
voiceChannel.leave()
	// 	let tosend = [`Currently playing ${info.title} requested by ${msg.author.username}`];
	// 	msg.channel.sendMessage(tosend.join('\n'));
	});
	},
	'volume': (msg) => {
	return new Promise((resolve, reject) => {
	msg.channel.sendMessage("To turn the volume up or down, use the client to do that, by right clicking on client. http://prntscr.com/dyl114")
	});
	},
	'subscribe': (msg) => {
		if (!msg.guild || !msg.member) return;
	     if (msg.guild.id === '479090634813341696') {
        let member = msg.guild.member
        var role = msg.guild.roles.find('name', "Subscriber");
        msg.member.addRole(role)
        msg.channel.sendMessage(`:tada: You have successfully subscribed!`)
    } else {
    msg.reply('Sorry but this command only works in my guild')  
	}
	},
	'eval': (msg) => {
	 var evalcode = msg.content.split(" ").splice(1).join(" ");
        try {
           if (msg.author.id != "479090634813341696")
           return msg.reply("Atleast you tried.")
            var evaled = eval(evalcode);
            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
             msg.channel.sendMessage({
                  embed: {
                      color: 0xb342f4,
                      fields: [{
                            name: '`OUTPUT`',
                            value: clean(evaled),
                      }],
                      timestamp: new Date(),
                      footer: {}
                  }
             })
        } catch (err) {
            msg.channel.sendMessage({
             embed: {
                      color: 0xd12121,
                      fields: [{
                            name: '`ERROR`',
                            value: `${clean(err)}`,
                      }],
                      timestamp: new Date(),
                      footer: {}
                  }
        })
        }
        function clean(text) {
            if (typeof(text) === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            } else {
                return text;
            }
            }
	}
};

client.login(process.env.BOT_TOKEN);
