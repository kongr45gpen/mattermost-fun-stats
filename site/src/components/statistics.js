import stats from '../../data/stats'
import {graphql, StaticQuery} from "gatsby";
import Header from "./layout";
import React from "react";
import serviceIcon1 from "../images/service-icon-1.png";
import NumberFormat from "react-number-format";
import serviceIcon3 from "../images/service-icon-3.png";
import raccoon from "../images/raccoon.svg";

import _ from "lodash";

const Channel = (props) => (
  <span>
      <span className="text-muted" style={{fontWeight: 'normal'}}>~{stats.channels[props.id].name}</span>
      &nbsp;{stats.channels[props.id].display_name}
  </span>
);

const User = function(props) {
    const user = stats.users[props.id];

    return <span>
        <img src={user.profile_picture} className="img-thumbnail" alt="User profile picture" />
        {` `}
        {/*<span  className="text-muted" style={{ fontWeight: 'normal'}}>{user.username}</span>*/}
        {` `}
        {
            (!_.isEmpty(user.nickname)) ? user.nickname : user.first_name + " " + user.last_name
        }
    </span>
};

const LargeNumbers = () => (
    <section className="gray-bg section-padding" id="service-page">
        <div className="container">
            <div className="row">
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
                        <div className="box-icon">
                            <img src={ serviceIcon1 } alt="" />
                        </div>
                        <h4>TOTAL POSTS</h4>
                        <p className="large-information">
                            <NumberFormat value={_.size(stats.posts)} displayType={'text'} thousandSeparator={true} />
                        </p>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
                        <div className="box-icon">
                            <img src={ serviceIcon3 } alt="" />
                        </div>
                        <h4>TOTAL HOURS SPENT TYPING</h4>
                        <p className="large-information"><NumberFormat value={
                            _.sumBy(Object.values(stats.users), u => u.stats.words) / 60.0 / 80.0
                            // stats.users['o6t7scc5djf5jkxuhgh1s17gda'].stats.words
                        } displayType={'text'} thousandSeparator={true} /></p>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-4">
                    <div className="box">
                        <div className="box-icon">
                            <img src={ raccoon } alt="" />
                        </div>
                        <h4>TOTAL RACCOONS</h4>
                        <p className="large-information"><NumberFormat value={
                            _.sumBy(Object.values(stats.users), u => u.stats.raccoonsGiven)
                        } displayType={'text'} thousandSeparator={true} /></p>
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
                        <td>{ channel.stats.count }</td>
                        <td>{ channel.stats.countRoot }</td>
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
                                    <td>{ user.stats.count }</td>
                                    <td>{ user.stats.countRoot }</td>
                                </tr>
                            )
                        }
                    </table>
                </div>
            </div>
        </div>
    </section>
);

const AllChannels = function() {
    const postMember = function(pair) {
        if (pair !== undefined) {
            return <td>
                <User id={pair[0]}/> (<em>{pair[1].count}</em>)
            </td>;
        }
    };

    return <section className="gray-bg section-padding">
        <div className="container">
            <table className="table">
                <tr>
                    <th className="text-right pl-1">Channel</th>
                    <th>Top poster</th>
                    <th>2nd top poster</th>
                    <th># Talkative members</th>
                </tr>
                {
                    _.map(_.filter(stats.channels, c => c.stats.count > 0), channel =>
                        <tr>
                            <th className="text-right pr-1"><Channel id={channel.id}/></th>
                            { postMember(_.maxBy(_.toPairs(channel.stats.members), m => m[1].count)) }
                            { postMember(_.sortBy(_.toPairs(channel.stats.members), m => -m[1].count)[1]) }
                            <td>{ _.size(channel.stats.members) }</td>
                        </tr>
                    )
                }
            </table>
        </div>
    </section>
};

const Statistics = ({ children }) => (
    <div>
        <LargeNumbers/>
        <LargestPosters/>
        <AllChannels/>
    <b>{Object.keys(stats.posts).length}</b>
    </div>
)

export default Statistics
