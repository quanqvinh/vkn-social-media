import React from 'react';

import { Route, Switch } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Posts from '../pages/Posts';
import Users from '../pages/Users';

const Routes = () => {
  return (
    <Switch>
      <Route path="/dashboard" exact component={Dashboard} />
      <Route path="/users" component={Users} />
      <Route path="/posts" component={Posts} />
    </Switch>
  );
};

export default Routes;
