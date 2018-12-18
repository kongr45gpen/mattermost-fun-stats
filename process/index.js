const config = require('config');
const fs = require('fs');
const _ = require('lodash');
const greekUtils = require('greek-utils');
// require('utilities.js');

const channels = _.mapKeys(JSON.parse(fs.readFileSync('data/channels.json', 'utf8')), channel => channel.id);
const users = _.mapKeys(JSON.parse(fs.readFileSync('data/users.json', 'utf8')), user => user.id);
const emojis = _.mapKeys(JSON.parse(fs.readFileSync('data/emojis.json', 'utf8')), emoji => emoji.name);
let posts = {};
fs.readdirSync('data/posts/').forEach(function(file) {
    // Only read .json data
    if (! _.endsWith(file.toLowerCase(), '.json')) return;

    const newPosts = JSON.parse(fs.readFileSync('data/posts/' + file, 'utf8'));
    posts = {...posts, ...newPosts};
});
// Don't keep deleted posts
_.remove(posts, post => post.delete_at !== 0);

console.log("Found " + _.size(posts) + " posts");

_.forEach(channels, function(channel) {
    channel.stats = {
        count: 0,
        countRoot: 0,
        raccoons: 0,
        raccoonedPosts: 0,
        totalReactions: 0,
        reactions: {},
        members: {}, // We define a channel member as someone who has posted in that channel
        hashtags: {},
        threads: {}
    }
});

_.forEach(users, function(user) {
    user.stats = {
        count: 0,
        countRoot: 0,
        raccoonsEaten: 0,
        raccoonsGiven: 0,
        raccoonedPosts: 0,
        characters: 0,
        charactersLatin: 0,
        words: 0,
        reactionsGiven: {},
        reactionsTaken: {}
    }
});

_.forEach(posts, function(post) {
    post.stats = {
        children: 0
    }
});

let hashtags = {};
let hours = _.mapValues([...Array(24)], function(o) { 
    return { count: 0, countWithoutAuto: 0} 
    });
let reactions = {};
let words = {};

_.forEach(posts, function(post) {
    // Ignored dates
    if (post.create_at < config.get('processing.after')) return;

    // Time counting
    const created = new Date(post.create_at);
    if (hours[created.getHours()]) {
        hours[created.getHours()].count += 1;
    }

    // Ignored channels and users
    if (config.get('processing.ignored_channels').includes(channels[post.channel_id].name)) return;
    if (users[post.user_id] === undefined) return;
    if (config.get('processing.ignored_users').includes(users[post.user_id].name)) return;

    // Ignore webhook posts
    if (post.props.from_webhook) return;

    // Ignore system posts
    if (_.startsWith(post.type, 'system')) return;

    if (hours[created.getHours()]) {
        hours[created.getHours()].countWithoutAuto += 1;
    }

    // Whether this post is not a child
    const isRoot = (post.parent_id === '');
    let channel = channels[post.channel_id].stats;
    let user = (users[post.user_id] === undefined) ? {} : users[post.user_id].stats;

    channel.count += 1;
    user.count += 1;
    if (isRoot) {
        channel.countRoot += 1;
        user.countRoot += 1;
    }

    if (!channel.members.hasOwnProperty(post.user_id)) {
        channel.members[post.user_id] = {
            count: 0
        }
    }
    channel.members[post.user_id].count += 1;

    // Thread counting
    if (!isRoot) {
        if (!channel.threads.hasOwnProperty(post.parent_id)) {
            channel.threads[post.parent_id] = {
                count: 0
            }
        }
        channel.threads[post.parent_id].count += 1;
        posts[post.parent_id].stats.children += 1;
    }

    // Word counting
    user.characters += _.size(post.message);
    user.charactersLatin += _.size(_.filter(post.message, c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')));
    user.words += _.size(_.words(post));
    _.words(post.message).forEach(function (word) {
        word = greekUtils.sanitizeDiacritics(word.toLowerCase());
        if (!words.hasOwnProperty(word)) {
            words[word] = {
                count: 0
            }
        }
        words[word].count += 1;
    });

    // Hashtag counting
    if (post.hashtags !== '') {
        _.split(post.hashtags,' ').forEach(function (hashtag) {
            hashtag = hashtag.toLowerCase();
            if (!hashtags.hasOwnProperty(hashtag)) {
                hashtags[hashtag] = {
                    count: 0
                }
            }
            if (!channel.hashtags.hasOwnProperty(hashtag)) {
                channel.hashtags[hashtag] = {
                    count: 0
                }
            }
            hashtags[hashtag].count += 1;
            channel.hashtags[hashtag].count += 1;
        });
    }

    // Reaction counting
    _.forEach(post.reactions, function(reaction) {
        channel.totalReactions += 1;
        if (!reactions.hasOwnProperty(reaction.emoji_name)) {
            reactions[reaction.emoji_name] = {
                count: 0
            }
        }
        reactions[reaction.emoji_name].count += 1;

        if (!channel.reactions.hasOwnProperty(reaction.emoji_name)) {
            channel.reactions[reaction.emoji_name] = {
                count: 0
            }
        }
        channel.reactions[reaction.emoji_name].count += 1;

        if (user !== undefined) {
            if (!user.reactionsTaken.hasOwnProperty(reaction.emoji_name)) {
                user.reactionsTaken[reaction.emoji_name] = {
                    count: 0
                }
            }
            user.reactionsTaken[reaction.emoji_name].count += 1;
        }

        let reactor = users[reaction.user_id];
        if (reactor !== undefined) {
            if (!reactor.stats.reactionsGiven.hasOwnProperty(reaction.emoji_name)) {
                reactor.stats.reactionsGiven[reaction.emoji_name] = {
                    count: 0
                }
            }
            reactor.stats.reactionsGiven[reaction.emoji_name].count += 1;
        }

        if (reaction.emoji_name === 'raccoon') {
            user.raccoonsEaten += 1;
            if (users[reaction.user_id]) {
                users[reaction.user_id].stats.raccoonsGiven += 1;
            }
            channel.raccoons += 1;
        }
    });
    if (_.some(post.reactions, r => r.emoji_name === 'raccoon')) {
        channel.raccoonedPosts += 1;
        user.raccoonedPosts += 1;
    }
});

const output = {
    users: users,
    posts: posts,
    channels: channels,
    hours: hours,
    hashtags: hashtags,
    reactions: reactions,
    words: words,
    emojis: emojis,
};
fs.writeFileSync("site/data/stats.json", JSON.stringify(output, null, 2));


// console.log(_.map(words, c=>c.stats));
// console.log(_.filter(posts, u => u.message[1] == 'o'));
