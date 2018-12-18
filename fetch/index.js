require('babel-polyfill');
require('isomorphic-fetch');
const inquirer = require('inquirer');
const config = require('config');
const fs = require('fs');
const _ = require('lodash');
const delay = require('delay');
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

    fs.writeFile("data/team.json", JSON.stringify(team), err => {if (err) console.error(err)});
    const teamId = team.id;

    // Fetch all the users
    const townSquare = await client.getChannelByName(teamId, 'town-square');
    let users = await client.getProfilesInChannel(townSquare.id, 0, 200);
    console.log("Found " + Object.keys(users).length + " users");
    await _.each(users, async function(user) {
        user.profile_picture = await client.getProfilePictureUrl(user.id);
    });
    fs.writeFile("data/users.json", JSON.stringify(users), err => {if (err) console.error(err)});

    // Fetch all the channels
    let channels = await client.getChannels(teamId, 0, 1000);
    channels = channels.filter(chan => chan.type === 'O'); // Only public channels

    console.log("Found " + channels.length + " channels.");
    fs.writeFile("data/channels.json", JSON.stringify(channels), err => {if (err) console.error(err)});

    for (channel in channels) {
        await delay(500);
        channel = channels[channel];
        let posts = {};
        let page = 0;
        while (true) {
            console.log("Fetching page #" + page + " of channel " + channel.name + " (" + Object.keys(posts).length + " total posts)");
            let newPosts = await client.getPosts(channel.id, page++, 500);
            await _.each(newPosts.posts, async function(post, id) {
                if (post.has_reactions) {
                //     await delay(100);
                    newPosts.posts[id].reactions = await client.getReactionsForPost(post.id);
                } else {
                    newPosts.posts[id].reactions = {};
                }
            });
            posts = {...posts, ...(newPosts.posts)};

            if (Object.values(newPosts.posts).length <= 0 || page >= 100) {
                break;
            }
        }
        fs.writeFile("data/posts/" + channel.name + ".json", JSON.stringify(posts), err => {if (err) console.error(err)});
    }
};

fetch();

