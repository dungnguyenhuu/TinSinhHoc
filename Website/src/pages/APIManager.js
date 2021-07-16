import React, { Fragment, Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
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
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import { formatDateString, isEmptyObj } from '../utils';

class APIManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiCalls: [],
      api_call_duration: 1,
      apiKey: {},
      requests: [],
      user: this.props.user,
      keyword: '',
      total_pages: 0,
      current_page: 1,
      textToggleStatuses: {},
    };
  }

  changeKeyword = (keyword) => {
    const { fetchRequests } = this;

    this.setState({ keyword }, fetchRequests);
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

  componentWillReceiveProps(nextProps) {
    const { fetchAPIKey, fetchApiCalls, fetchRequests } = this;

    this.setState({ user: nextProps.user }, () => {
      fetchAPIKey();
      fetchApiCalls();
      fetchRequests();
    });
  }

  componentDidMount() {
    const { fetchAPIKey, fetchApiCalls, fetchRequests } = this;

    fetchAPIKey();
    fetchApiCalls();
    fetchRequests();
  }

  fetchAPIKey = async () => {
    const { showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { apiKeys } = apiRoutes;
      const url = `${apiKeys.detailsByUser}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        this.setState({
          apiKey: response.data.data,
        });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Lấy thông tin của API key thất bại!');
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

  createApiKey = async () => {
    const {
      fetchAPIKey,
      fetchApiCalls,
      fetchRequests,
      showErrorNotification,
    } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { apiKeys } = apiRoutes;
      const url = `${apiKeys.create}`;
      const response = await axios.post(url, null, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        fetchAPIKey();
        fetchApiCalls();
        fetchRequests();
      } else {
        const { message } = response.data;

        showErrorNotification(message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  fetchRequests = async () => {
    const { showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { apiCalls } = apiRoutes;
      let url;

      if (this.state.keyword != '') {
        url = `${apiCalls.listByUser}?keyword=${this.state.keyword}&page=${this.state.current_page}`;
      } else {
        url = `${apiCalls.listByUser}`;
      }

      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { data } = response.data;
        const { api_calls, total_pages } = data;

        this.setState({
          requests: api_calls,
          total_pages,
        });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Lấy danh sách tất cả request thất bại!');
    }
  };

  fetchApiCalls = async (duration = 1) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { statistics } = apiRoutes;
      const url = `${statistics.apiCallsByUser}?duration=${duration}`;
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

  getPreviousPage = () => {
    const { fetchData } = this;
    const { current_page } = this.state;

    if (current_page > 1) {
      this.setState({ current_page: current_page - 1 }, fetchData);
    }
  };

  getNextPage = () => {
    const { fetchData } = this;
    const { current_page, total_pages } = this.state;

    if (current_page < total_pages) {
      this.setState({ current_page: current_page + 1 }, fetchData);
    }
  };

  toggleText = (requestId) => {
    const textToggleStatuses = this.state.textToggleStatuses;

    if (requestId in textToggleStatuses) {
      textToggleStatuses[requestId] = !textToggleStatuses[requestId];
    } else {
      textToggleStatuses[requestId] = true;
    }

    this.setState({ textToggleStatuses });
  };

  render() {
    const {
      createApiKey,
      changeDuration,
      changeKeyword,
      getPreviousPage,
      getNextPage,
      toggleText,
    } = this;
    const {
      apiKey,
      requests,
      current_page,
      total_pages,
      textToggleStatuses,
    } = this.state;

    return (
      <Layout>
        <AuthenticatedRoute>
          <div className="wrapper profile">
            <div className="row">
              <div className="left-column">
                <div className="list">
                  <NavLink
                    to="/tai-khoan"
                    className="list-item"
                    activeClassName="active"
                  >
                    Cập nhật thông tin
                  </NavLink>
                  <NavLink
                    to="/thay-doi-mat-khau"
                    className="list-item"
                    activeClassName="active"
                  >
                    Thay đổi mật khẩu
                  </NavLink>
                  <NavLink
                    to="/quan-ly-api"
                    className="list-item"
                    activeClassName="active"
                  >
                    Quản lý API
                  </NavLink>
                </div>
              </div>

              <div className="right-column">
                <h3 className="form__title">Quản lý API</h3>
                <h3 className="section-title">API Key</h3>
                {!isEmptyObj(apiKey) ? (
                  <Fragment>
                    <input
                      type="text"
                      placeholder="API key của bạn"
                      disabled={true}
                      value={apiKey.generated_key}
                    />
                    <p>
                      API key này còn lại{' '}
                      <strong>{apiKey.remaining_calls}</strong> request nữa.
                    </p>
                  </Fragment>
                ) : (
                  <Fragment>
                    <button className="button" onClick={() => createApiKey()}>
                      Tạo API Key
                    </button>
                  </Fragment>
                )}

                <div className="section-header">
                  <h3 className="section-title">Thông tin sử dụng</h3>
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

                <input
                  type="text"
                  onChange={(e) => changeKeyword(e.target.value)}
                  className="form-input-outline"
                  placeholder="Nhập từ khóa cần tìm kiếm"
                  style={{ marginTop: '12px' }}
                />

                {requests.length > 0 ? (
                  <Fragment>
                    <table>
                      <tr>
                        <th style={{ minWidth: '120px' }}>Thời gian gọi</th>
                        <th>Nội dung văn bản</th>
                        <th style={{ minWidth: '120px' }}>
                          Chủ đề được phân loại
                        </th>
                      </tr>

                      {requests.map((request) => (
                        <tr>
                          <td
                            style={{
                              minWidth: '120px',
                              verticalAlign: 'top',
                            }}
                          >
                            {formatDateString(request.created_at)}
                          </td>
                          <td>
                            <div
                              className={
                                !(request.id in textToggleStatuses) ||
                                textToggleStatuses[request.id] === false
                                  ? 'collapsed-text'
                                  : ''
                              }
                            >
                              {request.document}
                            </div>
                            <button
                              className="button"
                              onClick={() => toggleText(request.id)}
                              style={{ marginTop: '12px' }}
                            >
                              {!(request.id in textToggleStatuses) ||
                              textToggleStatuses[request.id] === false
                                ? 'Mở rộng'
                                : 'Thu gọn'}
                            </button>
                          </td>
                          <td
                            style={{ minWidth: '120px', verticalAlign: 'top' }}
                          >
                            <strong>{request.result}</strong>
                          </td>
                        </tr>
                      ))}
                    </table>

                    <div className="pagination">
                      <span className="pagination__page">
                        Trang {current_page} / {total_pages}
                      </span>

                      <div className="pagination__buttons">
                        <button
                          className="button"
                          onClick={() => getPreviousPage()}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>

                        <button
                          className="button"
                          style={{ marginLeft: '6px' }}
                          onClick={() => getNextPage()}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  </Fragment>
                ) : (
                  <div>Chưa có dữ liệu!</div>
                )}
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
  connect(mapStateToProps, { showNotification })(APIManager)
);
