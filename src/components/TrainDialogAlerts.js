import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import moment from 'moment';
import Linkify from 'react-linkify';

import {List, ListItem} from 'material-ui/List';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    recentTweets: PropTypes.object
  },

  _getTweetUrl(userId, tweetId) {
    if (!userId || !tweetId) {
      return;
    }

    return `https://twitter.com/${userId}/status/${tweetId}`;
  },

  render() {
    let twitterDescription;
    let tweetList;
    if (this.props.recentTweets) {
      const tweets = [];
      this.props.recentTweets.get('tweets').forEach((tweet, index) => {
        const time = moment.unix(tweet.get('timestamp'));
        tweets.push(
          <ListItem
            key={tweet.get('twitterIdString')}
            primaryText={
              <Linkify properties={{target: 'blank'}}>
                {tweet.get('text')}
              </Linkify>
            }
            secondaryText={
              <div style={{textAlign: 'right', fontSize: 12}}>
                <a href={this._getTweetUrl(tweet.get('userId'), tweet.get('twitterIdString'))} target='_blank' style={{cursor: 'pointer'}}>tweeted</a>
                &nbsp;
                <span>{`${time.fromNow()} (${time.format('h:mm a')})`}</span>
              </div>
            }
            innerDivStyle={{padding: 8, fontSize: 13}}
            disabled
          />
        );
      });

      if (this.props.recentTweets.get('keywords')) {
        twitterDescription = {__html: `Twitter is talking about this train:<br/><strong>${this.props.recentTweets.get('keywords')}</strong>`};
      } else {
        twitterDescription = {__html: `Twitter is talking about this train.`};
      }

      tweetList = (
        <List>
          {tweets}
        </List>
      );
    } else {
      twitterDescription = {__html: 'There are no recent tweets about this train.'};
    }

    return (
      <div
        className='train-dialog-problems-content'
      >
        <div
          className='train-dialog-problems-content-twitter'
        >
          <p
            className='train-dialog-problems-content-twitter-description'
            dangerouslySetInnerHTML={twitterDescription}
            style={tweetList ? {marginBottom: 0} : null}
          />
          {tweetList}
        </div>
      </div>
    );
  }
});
