import React, { Component, Fragment } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import apiRoutes from '../routes/apis';
import axios from 'axios';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import Layout from '../components/Layout';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { formatDateString } from '../utils';

class RequestManager extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
      user: this.props.user,
      keyword: '',
      total_pages: 0,
      current_page: 1,
    };
  }

  changeKeyword = (keyword) => {
    const { fetchData } = this;

    this.setState({ keyword }, fetchData);
  };

  componentDidMount() {
    const { fetchData } = this;

    fetchData();
  }

  componentWillReceiveProps(nextProps) {
    const { fetchData } = this;

    this.setState({ user: nextProps.user }, fetchData);
  }

  fetchData = async () => {
    const { showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { apiCalls } = apiRoutes;

      let url;

      if (this.state.keyword != '') {
        url = `${apiCalls.list}?keyword=${this.state.keyword}&page=${this.state.current_page}`;
      } else {
        url = `${apiCalls.list}`;
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

  showSuccessNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('success', message);
  };

  showErrorNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('error', message);
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

  render() {
    const { changeKeyword, getPreviousPage, getNextPage } = this;
    const { requests, current_page, total_pages } = this.state;

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
                <h3 className="form__title">Quản lý request</h3>

                <input
                  type="text"
                  onChange={(e) => changeKeyword(e.target.value)}
                  className="form-input-outline"
                  placeholder="Nhập từ khóa cần tìm kiếm"
                />

                {requests.length > 0 ? (
                  <Fragment>
                    <table>
                      <tr>
                        <th></th>
                        <th>Người dùng</th>
                        <th>API Key</th>
                        <th>Thời gian gọi</th>
                        <th>Kết quả</th>
                      </tr>

                      {requests &&
                        requests.map((request) => (
                          <tr>
                            <td>
                              <div className="table-menu">
                                <i className="fas fa-bars"></i>

                                <ul className="table-menu__list">
                                  <li className="table-menu__list-item">
                                    <Link
                                      to={`/bang-dieu-khien/request/thong-tin/${request.id}`}
                                    >
                                      Xem thông tin
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            </td>
                            <td>
                              {request.user.full_name || request.user.username}
                            </td>
                            <td>{request.api_key}</td>
                            <td>{formatDateString(request.created_at)}</td>
                            <td>{request.result}</td>
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
                  <div>Chưa có dữ liệu</div>
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
  connect(mapStateToProps, { showNotification })(RequestManager)
);
