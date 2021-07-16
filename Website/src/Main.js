import React, { Component, Fragment } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import App from './pages/App';
import Login from './pages/Login';
import Register from './pages/Register';
import Introduction from './pages/Introduction';
import Documentation from './pages/Documentation';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import APIManager from './pages/APIManager';

import Dashboard from './pages/Dashboard';
import UserManager from './pages/UserManager';
import UserView from './pages/UserView';
import UserEdit from './pages/UserEdit';
import UserDelete from './pages/UserDelete';
import RequestManager from './pages/RequestManager';
import APIKeyManager from './pages/APIKeyManager';
import APIKeyView from './pages/APIKeyView';
import RequestView from './pages/RequestView';

import Header from './components/Header';
import Footer from './components/Footer';

import Notification from './components/Notification';

import { logIn } from './redux/actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class Main extends Component {
  componentWillMount() {
    const localUser = JSON.parse(localStorage.getItem('VTC_USER')) || {};

    this.setState({ user: localUser }, () => {
      this.props.logIn(localUser);
    });
  }

  render() {
    return (
      <Fragment>
        <Switch>
          <Route path="/dang-nhap" component={Login} />
          <Route path="/dang-ky" component={Register} />
          <Route path="/gioi-thieu" component={Introduction} />
          <Route path="/huong-dan-su-dung-api" component={Documentation} />
          <Route path="/tai-khoan" component={Profile} />
          <Route path="/thay-doi-mat-khau" component={ChangePassword} />
          <Route path="/quan-ly-api" component={APIManager} />

          <Route path="/bang-dieu-khien/tong-quan" component={Dashboard} />
          <Route
            path="/bang-dieu-khien/nguoi-dung"
            component={UserManager}
            exact={true}
          />
          <Route
            path="/bang-dieu-khien/nguoi-dung/thong-tin/:id"
            component={UserView}
          />
          <Route
            path="/bang-dieu-khien/nguoi-dung/cap-nhat/:id"
            component={UserEdit}
          />
          <Route
            path="/bang-dieu-khien/nguoi-dung/xoa/:id"
            component={UserDelete}
          />
          <Route
            path="/bang-dieu-khien/request"
            component={RequestManager}
            exact={true}
          />
          <Route
            path="/bang-dieu-khien/request/:id"
            component={RequestView}
            exact={true}
          />
          <Route
            path="/bang-dieu-khien/api-key"
            component={APIKeyManager}
            exact={true}
          />
          <Route path="/bang-dieu-khien/api-key/:id" component={APIKeyView} />
          <Route path="/" component={App} />
        </Switch>

        <Notification />
      </Fragment>
    );
  }
}

export default withRouter(connect(null, { logIn })(Main));
