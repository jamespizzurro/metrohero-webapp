import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';

import {Card, CardTitle, CardText} from 'material-ui/Card';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div className="Faq vertical-scrolling">
        <div style={{margin: '0 auto 92px', maxWidth: '750px'}}>
          <Card style={{marginTop: 8, marginBottom: 8}}>
            <CardTitle title="General" style={{paddingBottom: 0}} />
            <CardText>
              <h4>Where am I? What is this? Who is this for? What does this do?</h4>
              <p>
                Welcome! This is MetroHero, the free DC Metrorail app you need AND the one you deserve, designed by commuters, for commuters. We let you see the position of every Metrorail train in real time, giving you the clearest picture of the current state of the entire DC Metro system. See dynamic estimates of exactly how long it will take you to reach your destination given current delays, track work, and even single-tracking. Harness the power of live crowd-sourcing to report problems with stations and individual trains. And you can forget about empty station boards and endless streams of 'DLY'—if there's a train ANYWHERE on the tracks, we'll tell you where it is.
              </p>
              <p>
                This is our webapp, which is compatible with most modern platforms, like iOS, Android and Desktop. We also have an <a href="https://play.google.com/store/apps/details?id=com.hodgepig.wmata" target="_blank">Android app</a> and an <a href="https://itunes.apple.com/us/app/metrohero/id1375269139" target="_blank">iOS app</a> that both wrap this webapp for your convenience. We're also pretty active on Twitter, so feel free to <a href="https://twitter.com/dcmetrohero" target="_blank">follow us</a> there, or like us on <a href="https://www.facebook.com/metrohero" target="_blank">Facebook</a>.
              </p>
              <h4>Who are you? Why did you start this project?</h4>
              <p>
                There are two of us here at MetroHero: James and Jen. We're both residents of Arlington and daily Orange/Silver line commuters. Our project was born out of frustration; we were tired of relying on unintelligible announcements from our train operators and confusing station PA announcements. We knew there had to be a better way, so we spent several months developing a tool that can show you trains, delays and congestion in real time, empowering riders to answer their own questions about WMATA's service to better understand and appreciate the system they ride every day.
              </p>
              <h4>Why don't I see other apps and services doing what you do?</h4>
              <p>
                Up until recently, WMATA did not offer developers access to data about train locations; we had to derive it ourselves using raw train predictions data—the same train arrival times you see on the PIDs, or "Passenger Information Displays", i.e. the freestanding black boards with train ETAs on them on station platforms. This was not an easy task nor was it perfect, which is probably why you didn't see others doing it. However, now that this data is available <a href="https://developer.wmata.com/docs/services/5763fa6ff91823096cac1057/operations/5763fb35f91823096cac1058" target="_blank">directly from WMATA</a>, we think there will be a lot more people doing what we do soon. ;)
              </p>
              <h4>How does this project stay afloat financially? I don't see any ads.</h4>
              <p>
                We used to run ads, but in early 2017, we switched accepting monthly donations via <a href="https://www.patreon.com/metrohero" target="_blank">Patreon</a> instead. Patreon allows us to accept donations only from the people who care most about MetroHero's continued success so that we in return can offer a service that is truly free for every commuter, pure and unencumbered by ads. If you're interested in donating, please check out <a href="https://www.patreon.com/metrohero" target="_blank">our Patreon page</a>.
              </p>
              <h4>What web browsers do you support? Which one do you suggest using for this site?</h4>
              <p>
                On Desktop, we support the latest stable versions of Chrome, Firefox, Edge, and Safari as well as Internet Explorer 11. Of those, we suggest using Chrome, since that's what we use to develop the site. On Mobile, we suggest using either our <a href="https://play.google.com/store/apps/details?id=com.hodgepig.wmata" target="_blank">Android app</a> or <a href="https://itunes.apple.com/us/app/metrohero/id1375269139" target="_blank">iOS app</a>, but any mobile web browser updated to the latest stable version should suffice if you are not able or not willing to download our app. All other web browsers are unsupported.
              </p>
              <h4>Where do you source your data?</h4>
              <p>
                We use <a href="https://developer.wmata.com/" target="_blank">WMATA's APIs</a> to obtain train positions data, track circuit data, and more. We then take all of this and combine it into a single dataset using our own algorithms which enable us to, among many other things, plot trains on maps as well as provide train ETAs for stops throughout the entire Metrorail system. If you're interested in using our data for yourself, check out <a href="/apis" target="_blank">our public API documentation</a>.
              </p>
              <h4>Is this project open source?</h4>
              <p>
                Not at this time, but we do offer our data to the public in real-time via our public APIs. Check out <a href="/apis" target="_blank">our public API documentation</a> for more information.
              </p>
            </CardText>
          </Card>
          <Card style={{marginTop: 8, marginBottom: 8}}>
            <CardTitle title="Dashboard" style={{paddingBottom: 0}} />
            <CardText>
              <p>
                On the Dashboard, every line—Red, Orange, Silver, Blue, Yellow, and Green—has a card with a corresponding colored header at the top. In that colored header is general information about the trains servicing that line: the number of active trains in revenue service, the number of eight-car trains, and the number of tardy trains (see the list below for our definition of those terms). Below the colored header is a list of train destinations and the current average platform wait time across stations serviced by trains going in that direction. This average platform wait time can appear in green, yellow/orange, or red: green means average wait times are as expected or better than expected; yellow/orange means above-normal average wait times; red means well-above-expected average wait times that are perhaps indicative of more serious delays. To dig even deeper into the data, you can tap the 'Details' button at the bottom of the line's card. Here are some definitions of the terms you'll find there:
              </p>
              <ul>
                <li><strong>active</strong>: number of trains in active revenue service, as coded by WMATA; higher is better; expected number of trains is derived from <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a></li>
                <li><strong>eight-car</strong>: number of (and percentage of all) active trains with eight cars (as opposed to trains with only 6 cars); higher is better</li>
                <li><strong>tardy</strong>: number of (and percentage of all) active trains with cumulative trip time delays of 5 minutes or more, accumulated during their trip so far by holding and/or moving slowly, as calculated by us; lower is better</li>
                <li><strong>tardiness</strong>: median cumulative trip time delays accumulated by active trains; lower is better</li>
                <li><strong>avg hdwy</strong>: average predicted <a href="https://en.wikipedia.org/wiki/Headway" target="_blank">headways</a>, i.e. the expected travel time between each pair of back-to-back trains given their current positions, and not taking short-term delays/congestion into account; lower is better; N/A if there are currently less than two active trains</li>
                <li><strong>avg freq</strong>: average observed train frequency of trains arriving at stations; lower is better; expected train frequency is derived from <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a></li>
                <li><strong>freq var</strong>: standard deviation of the observed train frequency of trains arriving at stations, capturing how consistent the spacing between trains is; lower is better; expected value is calculated from <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a></li>
                <li><strong>avg wait</strong>: average estimated wait time on station platforms for a train, calculated by us using the following formula published <a href="http://pubsonline.informs.org/doi/abs/10.1287/trsc.9.3.248" target="_blank">here</a>: <span style={{whiteSpace: 'nowrap'}}>(&mu; (1 + &sigma;&sup2; / &mu;&sup2;) / 2)</span>, "where &mu; and &sigma; are respectively the mean and standard deviation of the time headways" between observed train arrivals at stations, and assuming riders' arrival at station platforms is random, which is the worst-case scenario; lower is better; the expected estimated wait time is calculated by us using <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a>; our calculations optimistically assume every rider is able to board the first train they're waiting for, which is not always the case, but WMATA does not make any real-time ridership data available for us to use</li>
                <li><strong>headways</strong>: the headway adherence of trains, calculated by comparing observed train arrivals at each scheduled station stop to <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a>, expressed as a percentage between 0 and 100; higher is better; we consider a train to be adhering to scheduled headways if the time between the last train's arrival and this train's arrival is less than or equal to one full expected headway, plus 2 minutes</li>
                <li><strong>schedule</strong>: the schedule adherence of trains, calculated by comparing observed train arrivals at each scheduled station stop to <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a>, expressed as a percentage between 0 and 100; higher is better; we consider a train to be adhering to schedule if it arrives at its next station stop within (+/−) 2 minutes of schedule</li>
              </ul>
              <p>
                All of this information is updated approximately every 30 seconds. It is not uncommon for this data to fluctuate wildly between updates as trains arrive at their final destinations and new ones depart, so the Dashboard as a whole is best analyzed over the course of a few minutes for the best analysis; it is discouraged to take what you see on the Dashboard at any given moment as fact without first consulting our other resources, like our Line Maps.
              </p>
            </CardText>
          </Card>
          <Card style={{marginTop: 8}}>
            <CardTitle title="Line Maps" style={{paddingBottom: 0}} />
            <CardText>
              <p>
                Line Maps show where trains are located in realtime relative to each other and every station on a given line. Each line—Red, Orange, Silver, Blue, Yellow, and Green—has its own map. The maps are to scale, so the distance between each pair of neighboring stations are in proportion with the actual distance between those stations geographically.
              </p>
              <p>
                On each Line Map, you'll see colored train icons with some text next to them, or what we call a train ETA. If that ETA is a number, that's approximately how many minutes away that train is from its next station stop. If it's 'ARR' or 'BRD', then the train is arriving or boarding at its next station stop, respectively. Train icons are colored according to what line they're currently servicing, e.g. blue for the Blue Line, red for the Red Line, etc. Where a train is headed is indicated by the colored arrow either above or below the train's icon, while which side of the colored line it's on (left or right) indicates which track it's currently on (track 2 or 1, respectively). During single-tracking, for example, trains headed in the same direction may be on different tracks, i.e. appear on opposite sides of the colored line in the app, but their colored arrow will be pointing in the same direction.
              </p>
              <p>
                Sometimes, you'll see an asterisk next to a train and its ETA. This indicates the train is currently holding or moving slowly and that the ETA displayed may no longer be accurate. Tap the train icon for details. You can actually tap <i>any</i> train (not just these tardy trains) at anytime to see details about that train, like how many cars it has, if it has any previous delays, its final destination, and more. You can also tag trains for positive or negative characteristics—such has having a good train operator (positive) or as being too hot or cold (negative)—using the thumbs up and down icons, respectively. There will also be times where some trains appear as black instead of one of the line colors. Those trains are either No Passenger trains, work vehicles, or might be totally normal trains but we just don't have enough data to know where it's headed. Tap on them too for details.
              </p>
              <p>
                Tap a station dot to get a complete list of arrival times relative to that station in each direction of travel. Unlike the boards at station platforms, we show you <i>every</i> train's ETA, not just 3 at a time, and you can tap into each train row to get the same expanded information about each train that you do when you tap on a train icon from the Line Map directly. You can also see scheduled departure times from this view, which are displayed as arrival times (e.g. 11:15) instead of a countdown to arrival (e.g. 5) to indicate they are not real-time predictions and may or may not actually operate on time, we're just making our best guess using the data we have.
              </p>
              <p>
                Finally, along both the left and right side of each colored line on Line Maps, you may see thin vertical yellow/orange or red bars that vertically fade in and out. These are heatmaps showing previous and current delays; yellow/orange indicates moderate slowdowns while red indicates more serious delays. These only appear if we at MetroHero have determined there might be a problem, so if your train is traveling through stretches of track flanked by either of these bars in your direction of travel, you can expect some additional travel time. That said, bars can disappear as quickly as they appear as new issues crop up and others are resolved, so you may want to keep an eye on them.
              </p>
            </CardText>
          </Card>
        </div>
      </div>
    );
  }
});
