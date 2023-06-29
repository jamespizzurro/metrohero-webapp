import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import moment from 'moment';

import PredictionsActions from '../actions/PredictionsActions';
import PredictionsStore from '../stores/PredictionsStore';
import SettingsStore from "../stores/SettingsStore";

import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import Slider from 'material-ui/Slider';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import AvSkipPrevious from 'material-ui/svg-icons/av/skip-previous';
import AvSkipNext from 'material-ui/svg-icons/av/skip-next';
import RaisedButton from 'material-ui/RaisedButton';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  propTypes: {
    shouldRenderTop: PropTypes.bool
  },

  getStoreState() {
    return {
      isLoading: PredictionsStore.get('isLoading'),
      playback: PredictionsStore.get('playback')
    };
  },

  _handleChangeDate(event, date) {
    if (date) {
      const selectedMoment = moment(date);
      const newMoment = moment.unix(this.state.playback.get('timestamp')).year(selectedMoment.year()).dayOfYear(selectedMoment.dayOfYear());
      PredictionsActions.getPredictions(newMoment.unix());
    }
  },

  _handleChangeTime(event, time) {
    if (time) {
      const selectedMoment = moment(time);
      const newMoment = moment.unix(this.state.playback.get('timestamp')).hours(selectedMoment.hours()).minutes(selectedMoment.minutes()).seconds(0);
      PredictionsActions.getPredictions(newMoment.unix());
    }
  },

  _handleChangeSeconds(event, newValue) {
    if (this.refs.secondsSlider) {
      const currMoment = moment.unix(this.state.playback.get('timestamp'));
      const newMoment = currMoment.hours(currMoment.hours()).minutes(currMoment.minutes()).seconds(newValue);
      PredictionsActions.getPredictions(newMoment.unix());
    }
  },

  _handlePlayPause() {
    PredictionsActions.togglePlayback();
  },

  _handleSkipBackwards() {
    const currMoment = moment.unix(this.state.playback.get('timestamp'));
    const newMoment = currMoment.subtract(1, 'minutes');
    PredictionsActions.getPredictions(newMoment.unix());
  },

  _handleSkipForwards() {
    const currMoment = moment.unix(this.state.playback.get('timestamp'));
    const newMoment = currMoment.add(1, 'minutes');
    PredictionsActions.getPredictions(newMoment.unix());
  },

  render() {
    if (!this.state.playback.get('enabled')) {
      return false;
    }

    let numSeconds = moment.unix(this.state.playback.get('timestamp')).seconds();
    if (numSeconds < 10) {
      numSeconds = '0' + numSeconds;
    }

    return (
      <Paper
        className='PlaybackControls'
        style={this.props.shouldRenderTop ? {top: 56, bottom: 'initial'} : null}
        zDepth={3}
      >
        <DatePicker
          ref='datePicker'
          hintText='Date'
          value={moment.unix(this.state.playback.get('timestamp')).toDate()}
          style={{display: 'inline-block', verticalAlign: 'middle'}}
          textFieldStyle={{width: 85}}
          onChange={this._handleChangeDate}
          disabled={this.state.isLoading || this.state.playback.get('isPlaying')}
          firstDayOfWeek={0}
        />
        <span
          className={this.state.isLoading || this.state.playback.get('isPlaying') ? 'disabled' : ''}
          style={{marginLeft: 8, marginRight: 8, verticalAlign: 'middle'}}
        >
          at
        </span>
        <TimePicker
          ref='timePicker'
          hintText='Time'
          format='24hr'
          value={moment.unix(this.state.playback.get('timestamp')).toDate()}
          style={{display: 'inline-block', verticalAlign: 'middle'}}
          textFieldStyle={{width: 40}}
          onChange={this._handleChangeTime}
          disabled={this.state.isLoading || this.state.playback.get('isPlaying')}
        />
        <div
          className={this.state.isLoading || this.state.playback.get('isPlaying') ? 'disabled' : ''}
          style={{display: 'inline-block', verticalAlign: 'middle', paddingTop: 1}}
        >
          :{numSeconds}
        </div>
        <IconButton
          tooltip='Go back 1 minute'
          onClick={this._handleSkipBackwards}
          tooltipPosition='top-center'
          disabled={this.state.isLoading || this.state.playback.get('isPlaying')}
          style={{verticalAlign: 'middle'}}
        >
          <AvSkipPrevious />
        </IconButton>
        <Slider
          ref='secondsSlider'
          min={0}
          step={1}
          max={59}
          style={{display: 'inline-block', width: 180, margin: 0, verticalAlign: 'middle'}}
          value={moment.unix(this.state.playback.get('timestamp')).seconds()}
          onChange={this._handleChangeSeconds}
          disabled={this.state.isLoading || this.state.playback.get('isPlaying')}
          sliderStyle={{marginTop: 0, marginBottom: 0}}
        />
        <IconButton
          tooltip='Go forward 1 minute'
          onClick={this._handleSkipForwards}
          tooltipPosition='top-center'
          disabled={this.state.isLoading || this.state.playback.get('isPlaying')}
          style={{verticalAlign: 'middle'}}
        >
          <AvSkipNext />
        </IconButton>
        <RaisedButton
          label={this.state.playback.get('isPlaying') ? 'Pause' : 'Play'}
          style={{margin: '0 auto', display: 'inline-block', verticalAlign: 'middle'}}
          onClick={this._handlePlayPause}
        />
      </Paper>
    );
  }
});
