import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import apiRoutes from '../routes/apis';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import Layout from '../components/Layout';
import axios from 'axios';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overviewData: {
        total_users: 0,
        total_api_keys: 0,
        total_api_calls: 0,
      },
      user: this.props.user,
      users: [],
      apiKeys: [],
      apiCalls: [],
      users_duration: 1,
      api_keys_duration: 1,
      api_calls_duration: 1,
    };
  }

  componentDidMount() {
    const { fetchOverviewData, fetchUsers, fetchApiKeys, fetchApiCalls } = this;

    fetchOverviewData();
    fetchUsers();
    fetchApiKeys();
    fetchApiCalls();
  }

  componentWillReceiveProps(nextProps) {
    const { fetchOverviewData, fetchUsers, fetchApiKeys, fetchApiCalls } = this;

    this.setState({ user: nextProps.user }, () => {
      fetchOverviewData();
      fetchUsers();
      fetchApiKeys();
      fetchApiCalls();
    });
  }

  fetchOverviewData = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { statistics } = apiRoutes;
      const url = `${statistics.general}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        this.setState({
          overviewData: response.data.data,
        });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  fetchUsers = async (duration = 1) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { statistics } = apiRoutes;
      const url = `${statistics.users}?duration=${duration}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        let users = [];

        Object.keys(response.data.data.statistics).map((key) => {
          users.push({
            date: key,
            users: response.data.data.statistics[key],
          });
        });

        users.sort((a, b) => {
          let tempA = a.date.split('/').reverse().join('');
          let tempB = b.date.split('/').reverse().join('');

          return tempA.localeCompare(tempB);
        });

        this.setState({ users });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  fetchApiKeys = async (duration = 1) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { statistics } = apiRoutes;
      const url = `${statistics.apiKeys}?duration=${duration}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        let apiKeys = [];

        Object.keys(response.data.data.statistics).map((key) => {
          apiKeys.push({
            date: key,
            keys: response.data.data.statistics[key],
          });
        });

        apiKeys.sort((a, b) => {
          let tempA = a.date.split('/').reverse().join('');
          let tempB = b.date.split('/').reverse().join('');

          return tempA.localeCompare(tempB);
        });

        this.setState({ apiKeys });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  fetchApiCalls = async (duration = 1) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { statistics } = apiRoutes;
      const url = `${statistics.apiCalls}?duration=${duration}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        let apiCalls = [];

        Object.keys(response.data.data.statistics).map((key) => {
          apiCalls.push({
            date: key,
            requests: response.data.data.statistics[key],
          });
        });

        apiCalls.sort((a, b) => {
          let tempA = a.date.split('/').reverse().join('');
          let tempB = b.date.split('/').reverse().join('');

          return tempA.localeCompare(tempB);
        });

        this.setState({ apiCalls });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  showSuccessNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('success', message);
  };

  showErrorNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('error', message);
  };

  changeDuration = (type, value) => {
    const { fetchUsers, fetchApiKeys, fetchApiCalls } = this;

    switch (type) {
      case 'users':
        this.setState({ users_duration: value }, () => fetchUsers(value));
        break;

      case 'api_keys':
        this.setState({ api_keys_duration: value }, () => fetchApiKeys(value));
        break;

      case 'api_calls':
        this.setState({ api_calls_duration: value }, () =>
          fetchApiCalls(value)
        );
        break;
    }
  };

  render() {
    const { changeDuration } = this;
    const { overviewData } = this.state;

    return (
      <Layout>
        <AuthenticatedRoute>
          <div className="wrapper profile">
            <div className="row">
              <div className="left-column">
                <div className="list">
                  <NavLink
                    to="/bang-dieu-khien/tong-quan"
                    className="list-item"
                    activeClassName="active"
                  >
                    Tổng quan
                  </NavLink>
                  <NavLink
                    to="/bang-dieu-khien/nguoi-dung"
                    className="list-item"
                    activeClassName="active"
                  >
                    Quản lý người dùng
                  </NavLink>
                  <NavLink
                    to="/bang-dieu-khien/request"
                    className="list-item"
                    activeClassName="active"
                  >
                    Quản lý request
                  </NavLink>
                  <NavLink
                    to="/bang-dieu-khien/api-key"
                    className="list-item"
                    activeClassName="active"
                  >
                    Quản lý API key
                  </NavLink>
                </div>
              </div>

              <div className="right-column">
                <h3 className="form__title">Tổng quan</h3>
                <h3 className="section-title">Số liệu tổng quan</h3>

                <div className="cards">
                  <div className="card">
                    <h4 className="card__title">Tổng số người dùng</h4>
                    <p className="card__number">{overviewData.total_users}</p>
                  </div>

                  <div className="card">
                    <h4 className="card__title">Tổng số request</h4>
                    <p className="card__number">
                      {overviewData.total_api_calls}
                    </p>
                  </div>

                  <div className="card">
                    <h4 className="card__title">Tổng số API key</h4>
                    <p className="card__number">
                      {overviewData.total_api_keys}
                    </p>
                  </div>
                </div>

                <div className="section-header">
                  <h3 className="section-title">Biểu đồ số lượng người dùng</h3>
                  <select
                    onChange={(e) => changeDuration('users', e.target.value)}
                    value={this.state.users_duration}
                  >
                    <option value={1}>Tuần này</option>
                    <option value={2}>Tháng này</option>
                    <option value={3}>Quý này</option>
                    <option value={4}>Năm nay</option>
                  </select>
                </div>

                <LineChart
                  width={700}
                  height={360}
                  data={this.state.users}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis dataKey="users" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#4164E3"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>

                <div className="section-header">
                  <h3 className="section-title">Biểu đồ số lượng request</h3>
                  <select
                    onChange={(e) =>
                      changeDuration('api_calls', e.target.value)
                    }
                    value={this.state.api_calls_duration}
                  >
                    <option value={1}>Tuần này</option>
                    <option value={2}>Tháng này</option>
                    <option value={3}>Quý này</option>
                    <option value={4}>Năm nay</option>
                  </select>
                </div>
                <LineChart
                  width={700}
                  height={360}
                  data={this.state.apiCalls}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis dataKey="requests" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#4164E3"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>

                <div className="section-header">
                  <h3 className="section-title">Biểu đồ số lượng API key</h3>
                  <select
                    onChange={(e) => changeDuration('api_keys', e.target.value)}
                    value={this.state.api_keys_duration}
                  >
                    <option value={1}>Tuần này</option>
                    <option value={2}>Tháng này</option>
                    <option value={3}>Quý này</option>
                    <option value={4}>Năm nay</option>
                  </select>
                </div>
                <LineChart
                  width={700}
                  height={360}
                  data={this.state.apiKeys}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis dataKey="keys" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="keys"
                    stroke="#4164E3"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </div>
            </div>
          </div>
        </AuthenticatedRoute>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default withRouter(
  connect(mapStateToProps, { showNotification })(Dashboard)
);
