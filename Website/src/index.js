import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './animate.css';
import 'react-notifications/lib/notifications.css';
import * as serviceWorker from './serviceWorker';
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
import UserCreate from './pages/UserCreate';
import UserView from './pages/UserView';
import UserEdit from './pages/UserEdit';
import UserDelete from './pages/UserDelete';
import RequestManager from './pages/RequestManager';
import RequestView from './pages/RequestView';
import APIKeyManager from './pages/APIKeyManager';
import APIKeyCreate from './pages/APIKeyCreate';
import APIKeyView from './pages/APIKeyView';
import APIKeyEdit from './pages/APIKeyEdit';
import APIKeyDelete from './pages/APIKeyDelete';
import { Provider } from 'react-redux';
import store from './redux/store';
import Notification from './components/Notification';

class Index extends Component {
  render() {
    return (
      <React.StrictMode>
        <Provider store={store}>
          <Fragment>
            <Router>
              <Switch>
                <Route path="/dang-nhap" component={Login} />
                <Route path="/dang-ky" component={Register} />
                <Route path="/gioi-thieu" component={Introduction} />
                <Route
                  path="/huong-dan-su-dung-api"
                  component={Documentation}
                />
                <Route path="/tai-khoan" component={Profile} />
                <Route path="/thay-doi-mat-khau" component={ChangePassword} />
                <Route path="/quan-ly-api" component={APIManager} />

                <Route
                  path="/bang-dieu-khien/tong-quan"
                  component={Dashboard}
                />
                <Route
                  path="/bang-dieu-khien/nguoi-dung"
                  component={UserManager}
                  exact={true}
                />
                <Route
                  path="/bang-dieu-khien/nguoi-dung/them-moi"
                  component={UserCreate}
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
                  path="/bang-dieu-khien/request/thong-tin/:id"
                  component={RequestView}
                />
                <Route
                  path="/bang-dieu-khien/api-key"
                  component={APIKeyManager}
                  exact={true}
                />
                <Route
                  path="/bang-dieu-khien/api-key/them-moi"
                  component={APIKeyCreate}
                />
                <Route
                  path="/bang-dieu-khien/api-key/thong-tin/:id"
                  component={APIKeyView}
                />
                <Route
                  path="/bang-dieu-khien/api-key/cap-nhat/:id"
                  component={APIKeyEdit}
                />
                <Route
                  path="/bang-dieu-khien/api-key/xoa/:id"
                  component={APIKeyDelete}
                />
                <Route path="/" component={App} />
              </Switch>
            </Router>

            <Notification />
          </Fragment>
        </Provider>
      </React.StrictMode>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
