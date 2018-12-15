require('babel-polyfill');
require('isomorphic-fetch');
const inquirer = require('inquirer');
const config = require('config');
const fs = require('fs');
if (!global.WebSocket) {
    global.WebSocket = require('ws');
}
const Client4 = require('mattermost-redux/client/client4.js').default;
const client = new Client4;
const wsClient = require('mattermost-redux/client/websocket_client.js').default;
var token;

console.log("Welcome to Mattermost fetch");

wsClient.setEventCallback(function(event){
    console.log(event);
});

client.setUrl(config.get('mattermost.url'));
client.setToken(config.get('mattermost.token'));

let fetch = async function() {
    let team = undefined;

    if (config.has('mattermost.team')) {
        team = await client.getTeamByName(config.get('mattermost.team'));
    }
    if (!team) {
        const teams = await client.getMyTeams();
        await inquirer.prompt([{
            type: 'list',
            name: 'team',
            message: 'Which team do you want to fetch?',
            choices: teams.map(team => team.name)
        }]).then(async function(answer) {
            team = await client.getTeamByName(answer.team);
        });
    }

    const teamId = team.id;

    // Fetch all the channels
    let channels = await client.getChannels(teamId, 0, 1000);
    channels = channels.filter(chan => chan.type === 'O'); // Only public channels

    console.log("Found " + channels.length + " channels.");

    for (channel in channels) {
        channel = channels[channel];
        let posts = {};
        let page = 0;
        while (true) {
            console.log("Fetching page #" + page + " of channel " + channel.name + " (" + Object.keys(posts).length + " total posts)");
            const newPosts = await client.getPosts(channel.id, page++, 500);
            posts = {...posts, ...(newPosts.posts)};

            if (Object.values(newPosts.posts).length <= 0 || page >= 100) {
                break;
            }
        }
        await fs.writeFile("data/" + channel.name + ".json", JSON.stringify(posts));
    }
};

fetch();

