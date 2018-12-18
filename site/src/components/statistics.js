import stats from '../../data/stats'
import {graphql, StaticQuery} from "gatsby";
import Header from "./layout";
import React from "react";
import serviceIcon1 from "../images/service-icon-1.png";
import NumberFormat from "react-number-format";
import serviceIcon3 from "../images/service-icon-3.png";
import raccoon from "../images/raccoon.svg";
import raccoon2 from "../images/raccoon2.svg";
import WordCloud from 'react-wordcloud';
import EmojiConvertor from "emoji-js";
import Plot from 'react-plotly.js';

import _ from "lodash";

let emoji = new EmojiConvertor();
emoji.img_sets.apple.sheet = 'https://helit.org/sheet_apple_64.png';
emoji.use_sheet = true;
// emoji.replace_mode = 'unified';

const Channel = (props) => (
    <span>
      <span className="text-muted"
            style={{fontWeight: 'normal'}}>~{stats.channels[props.id].name}</span>
        &nbsp;{stats.channels[props.id].display_name}
  </span>
);

const User = function (props) {
    const user = stats.users[props.id];

    return <span>
        <img src={user.profile_picture} className="img-thumbnail" alt="User profile picture"/>
        {` `}
        {/*<span  className="text-muted" style={{ fontWeight: 'normal'}}>{user.username}</span>*/}
        {` `}
        {
            (!_.isEmpty(user.nickname)) ? user.nickname : user.first_name + " " + user.last_name
        }
    </span>
};

const HashTag = function (props) {
    if (!_.isEmpty(props.hashtag) && !_.isEmpty(props.hashtag.props.children) && props.hashtag.props.children !== undefined) {
        return <span>
            <span className="text-muted hashtag-hash">#</span>
            {props.hashtag.props.children.replace(/^#/, '')}
        </span>
    } else {
        return <span/>
    }
};

const Emoji = function (props) {
    let text = emoji.replace_colons(':' + props.shortcode + ':');
    _.each(stats.emojis, function (emoji) {
        text = text.replace(':' + emoji.name + ':', function () {
            return '<span class="emoji-outer emoji-sizer"> \
                <img class="emoji-custom" src=' + emoji.image + ' alt= ' + emoji.name + ' /> \
            </span>'
        }());
    });
    text = text.replace(/^:.+:$/,'');

    return <span dangerouslySetInnerHTML={{__html: text}}>
    </span>
};

const LargeNumbers = () => (
    <section className="gray-bg section-padding" id="service-page">
        <div className="container">
            <div className="row">
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
                        <div className="box-icon">
                            <img src={serviceIcon1} alt=""/>
                        </div>
                        <h4>TOTAL POSTS</h4>
                        <p className="large-information">
                            <NumberFormat value={_.size(stats.posts)} displayType={'text'}
                                          thousandSeparator={true}/>
                        </p>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
                        <div className="box-icon">
                            <img src={serviceIcon3} alt=""/>
                        </div>
                        <h4>TOTAL HOURS SPENT TYPING</h4>
                        <p className="large-information"><NumberFormat value={
                            _.sumBy(Object.values(stats.users), u => u.stats.words) / 60.0 / 80.0
                            // stats.users['o6t7scc5djf5jkxuhgh1s17gda'].stats.words
                        } displayType={'text'} thousandSeparator={true}/></p>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
                        <div className="box-icon">
                            <img src={raccoon} alt=""/>
                        </div>
                        <h4>TOTAL RACCOONS</h4>
                        <p className="large-information"><NumberFormat value={
                            _.sumBy(Object.values(stats.users), u => u.stats.raccoonsGiven)
                        } displayType={'text'} thousandSeparator={true}/></p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const LargestPosters = () => (
    <section className="gray-bg section-padding">
        <div className="container">
            <div class="row">
                <div class="col-xl-6">
                    <h2>Most talkative channels</h2>
                    <table className="table">
                        <tr>
                            <th className="text-right pr-1">Channel</th>
                            <th>Total posts</th>
                            <th>Total threads</th>
                        </tr>
                        {
                            _.slice(_.sortBy(stats.channels, c => -c.stats.count - c.stats.countRoot), 0, 7).map(channel =>
                                <tr>
                                    <th className="text-right pr-1"><Channel id={channel.id}/></th>
                                    <td>{channel.stats.count}</td>
                                    <td>{channel.stats.countRoot}</td>
                                </tr>
                            )
                        }
                    </table>
                </div>
                <div className="col-xl-6">
                    <h2>Most talkative users</h2>
                    <table className="table">
                        <tr>
                            <th className="text-right pl-1">User</th>
                            <th>Total posts</th>
                            <th>Total threads</th>
                        </tr>
                        {
                            _.slice(_.sortBy(stats.users, u => -u.stats.count - u.stats.countRoot), 0, 7).map(user =>
                                <tr>
                                    <th className="text-right pl-1"><User id={user.id}/></th>
                                    <td>{user.stats.count}</td>
                                    <td>{user.stats.countRoot}</td>
                                </tr>
                            )
                        }
                    </table>
                </div>
            </div>
        </div>
    </section>
);

const AllChannels = function () {
    const postMember = function (pair) {
        if (pair !== undefined) {
            return <td>
                <User id={pair[0]}/> (<em>{pair[1].count}</em>)
            </td>;
        }
    };
    const nameFromPair = function (pair) {
        if (pair !== undefined) {
            return <span>
                {pair[0]}
            </span>
        } else {
            return ''
        }
    }

    return <section className="gray-bg section-padding">
        <div className="container">
            <table className="table">
                <tr>
                    <th className="text-right pl-1">Channel</th>
                    <th>Top poster</th>
                    <th>2nd top poster</th>
                    <th>Most popular hashtag</th>
                    <th>Most popular reactions</th>
                    <th>Raccoon percentage</th>
                </tr>
                {
                    _.map(_.filter(stats.channels, c => c.stats.count > 0), channel =>
                        <tr>
                            <th className="text-right pr-1"><Channel id={channel.id}/></th>
                            {postMember(_.maxBy(_.toPairs(channel.stats.members), m => m[1].count))}
                            {postMember(_.sortBy(_.toPairs(channel.stats.members), m => -m[1].count)[1])}
                            <td><HashTag
                                hashtag={nameFromPair(_.maxBy(_.toPairs(channel.stats.hashtags), h => h[1].count))}/>
                            </td>
                            <td>
                                {_.map(_.slice(_.sortBy(_.toPairs(channel.stats.reactions), h => -h[1].count), 0, 5), function (pair) {
                                    return <Emoji shortcode={pair[0]}/>
                                })}
                            </td>
                            <td><img style={{width: '16px', 'margin-right': '2px'}} src={raccoon} alt=""/>
                            { Math.round(100 * channel.stats.raccoonedPosts / channel.stats.countRoot) } % </td>
                            {/*<td>{console.log(_.maxBy(_.toPairs(_.groupBy(channel.stats.reactions, 'emoji_name')), h => _.size(h[1]))) }</td>*/}
                        </tr>
                    )
                }
            </table>
        </div>
    </section>
};

const AllUsers = function () {
    const nameFromPair = function (pair) {
        if (pair !== undefined) {
            return <span>
                {pair[0]}
            </span>
        } else {
            return ''
        }
    }

    return <section className="gray-bg section-padding">
        <div className="container">
            <table className="table">
                <tr>
                    <th className="text-right pl-1">User</th>
                    <th>Most popular reactions TAKEN</th>
                    <th>Most popular reactions GIVEN</th>
                </tr>
                {
                    _.map(_.filter(stats.users, c => c.stats.count > 0), user =>
                        <tr>
                            <th className="text-right pr-1"><User id={user.id}/></th>
                            <td>
                                {_.map(_.slice(_.sortBy(_.toPairs(user.stats.reactionsTaken), h => -h[1].count), 0, 4), function (pair) {
                                    return <Emoji shortcode={pair[0]}/>
                                })}
                            </td>
                            <td>
                                {_.map(_.slice(_.sortBy(_.toPairs(user.stats.reactionsGiven), h => -h[1].count), 0, 7), function (pair) {
                                    return <Emoji shortcode={pair[0]}/>
                                })}
                            </td>
                        </tr>
                    )
                }
            </table>
        </div>
    </section>
};

const HashTagCloud = function () {
    const words = [
        {word: 'hello', value: 3},
        {word: 'world', value: 1},
        {word: 'github', value: 1},
        {word: 'code', value: 1},
    ];

    return <section className="gray-bg section-padding">
        <div className="container">
            <div style={{width: '100%', height: '300px'}}>
                <WordCloud
                    words={_.map(stats.hashtags, function (s, h) {
                        return {word: h, value: s.count};
                    })}
                    wordCountKey='value'
                    wordKey='word'
                />
            </div>
        </div>
    </section>
};

const Hours = function() {
    return <section className="gray-bg section-padding">
    <div className="container">
    <Plot
    data={[
      {
        x: _.keys(stats.hours),
        y: _.map(stats.hours, h => h.countWithoutAuto),
        type: 'bar',
        name: 'Text posts'
      },{
        x: _.keys(stats.hours),
        y: _.map(stats.hours, h => h.count - h.countWithoutAuto),
        type: 'bar',
        name: 'Robot & system posts'
      },
    ]}
    layout={ {width: 1024, height: 300, title: 'Time online', barmode:'stack' } }
  /></div></section>
}

const Statistics = ({children}) => (
    <div>
        <LargeNumbers/>
        <LargestPosters/>
        <AllChannels/>
        <HashTagCloud/>
        <AllUsers/>
        <Hours/>
        <b>{Object.keys(stats.posts).length}</b>
    </div>
)

export default Statistics
