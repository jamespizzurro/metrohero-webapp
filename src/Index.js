import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import App from './components/App';
import CircuitMapApp from './components/CircuitMapApp';

// fix scrolling in iOS
const handleScrolling = (el) => {
  const isScrolledUpMax = (el.scrollTop < 1);
  const isScrolledDownMax = (el.scrollTop > (el.scrollHeight - el.clientHeight - 1));

  if (isScrolledUpMax) {
    el.style['-webkit-overflow-scrolling'] = 'auto';
    el.scrollTop = 1;
    el.style['-webkit-overflow-scrolling'] = 'touch';
  } else if (isScrolledDownMax) {
    el.style['-webkit-overflow-scrolling'] = 'auto';
    el.scrollTop = (el.scrollHeight - el.clientHeight - 1);
    el.style['-webkit-overflow-scrolling'] = 'touch';
  }
};
const onScroll = (event) => {
  handleScrolling(event.target);
};
setInterval(() => {
  const nodes = document.querySelectorAll('.vertical-scrolling, .scrolling-dialog-body');
  for (let node of nodes) {
    if (!node) {
      continue;
    }

    if (!node.onscroll) {
      handleScrolling(node);
      node.onscroll = onScroll;
    }
  }
}, 1000);

window.React = React;

require('viewport-units-buggyfill').init();

const AppParent = () => (
  <div style={{position: 'relative', width: '100%', height: '100%'}}>
    <Route path="" component={App} />
    <Route path="mycommute" component={App} />
    <Route path="dashboard" component={App} />
    <Route path="realtime-map" component={App} />
    <Route path="system-map" component={App} />
    <Route path="history" component={App} />
    <Route path="departures" component={App} />
    <Route path="faq" component={App} />
    <Route path="line-red" component={App} />
    <Route path="line-orange" component={App} />
    <Route path="line-silver" component={App} />
    <Route path="line-blue" component={App} />
    <Route path="line-yellow" component={App} />
    <Route path="line-green" component={App} />
    <Route path="metrobus" component={App} />
    <Route path="performance" component={App} />
    <Route path="realtime-audit" component={App} />
    <Route path="circuit-map" component={CircuitMapApp} />
  </div>
);

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/" component={AppParent} />
    </Switch>
  </BrowserRouter>
  , document.getElementById('content')
);
