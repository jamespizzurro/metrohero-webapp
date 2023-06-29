import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import moment from 'moment';
import Linkify from 'react-linkify';
import StoreMixin from 'reflux-immutable/StoreMixin';

import StationStore from '../stores/StationStore';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationStore, 'onStoreChange')
  ],

  getStoreState() {
    return {
      haveData: !!StationStore.get('data'),
      twitterProblems: StationStore.get('data') ? StationStore.get('data').get('tweetResponse') : null,
      railIncidents: StationStore.get('data') ? StationStore.get('data').get('railIncidents') : null
    };
  },

  _getTweetUrl(userId, tweetId) {
    if (!userId || !tweetId) {
      return;
    }

    return `https://twitter.com/${userId}/status/${tweetId}`;
  },

  render() {
    let alertDescription;
    let alertList;
    if (!this.state.haveData) {
      alertDescription = {__html: '<i>Loading MetroAlerts…</i>'};
    } else if (this.state.railIncidents) {
      const alerts = [];
      this.state.railIncidents.forEach((incident, index) => {
        const time = moment.unix(incident.get('timestamp'));
        alerts.push(
          <ListItem
            key={incident.get('description')}
            primaryText={
              <Linkify properties={{target: 'blank'}}>
                {incident.get('description')}
              </Linkify>
            }
            secondaryText={
              <div style={{textAlign: 'right', fontSize: 12}}>
                {'as of ' + time.fromNow() + ' (' + time.format('h:mm a') + ')'}
              </div>
            }
            innerDivStyle={{padding: 8, fontSize: 13}}
            disabled
          />
        );
      });

      alertDescription = {__html: `${alerts.length} active ${(alerts.length === 1) ? 'MetroAlert' : 'MetroAlerts'} for this station:`};
      alertList = (
        <List>
          {alerts}
        </List>
      );
    } else {
      alertDescription = {__html: 'No active MetroAlerts for this station.'};
    }

    let twitterDescription;
    let tweetList;
    if (!this.state.haveData) {
      twitterDescription = {__html: '<i>Loading tweets…</i>'};
    } else if (this.state.twitterProblems) {
      const tweets = [];
      this.state.twitterProblems.get('tweets').forEach((tweet, index) => {
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

      if (this.state.twitterProblems.get('keywords')) {
        twitterDescription = {__html: `Twitter is reporting <strong>${this.state.twitterProblems.get('keywords')}</strong> at, affecting, or caused by activity at this station recently.`};
      } else {
        twitterDescription = {__html: 'Twitter is talking about stuff at, affecting, or caused by activity at this station recently.'};
      }

      tweetList = (
        <List>
          {tweets}
        </List>
      );
    } else {
      twitterDescription = {__html: 'There are no recent tweets describing any issues at, affecting, or caused by activity at this station.'};
    }

    return (
      <div className='station-dialog-problems-content'>
        <div className='station-dialog-problems-content-alerts'>
          <strong><p className='station-dialog-problems-content-alerts-description' dangerouslySetInnerHTML={alertDescription} style={alertList ? {marginBottom: 0} : null} /></strong>
          {alertList}
        </div>
        <Divider />
        <div className='station-dialog-problems-content-twitter'>
          <p className='station-dialog-problems-content-twitter-description' dangerouslySetInnerHTML={twitterDescription} style={tweetList ? {marginBottom: 0} : null} />
          {tweetList}
        </div>
      </div>
    );
  }
});
