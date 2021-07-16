import React, { Component, Fragment } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import apiRoutes from '../routes/apis';
import axios from 'axios';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import Layout from '../components/Layout';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { formatDateString } from '../utils';

class UserManager extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      user: this.props.user,
      keyword: '',
      total_pages: 0,
      current_page: 1,
    };
  }

  componentDidMount() {
    const { fetchData } = this;

    fetchData();
  }

  componentWillReceiveProps(nextProps) {
    const { fetchData } = this;

    this.setState({ user: nextProps.user }, fetchData);
  }

  changeKeyword = (keyword) => {
    const { fetchData } = this;

    this.setState({ keyword }, fetchData);
  };

  fetchData = async () => {
    const { showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { users } = apiRoutes;
      let url;

      if (this.state.keyword != '') {
        url = `${users.list}?keyword=${this.state.keyword}&page=${this.state.current_page}`;
      } else {
        url = `${users.list}?page=${this.state.current_page}`;
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
        const { users, total_pages } = data;

        this.setState({
          users,
          total_pages,
        });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Lấy danh sách tất cả người dùng thất bại!');
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
    const { users, current_page, total_pages } = this.state;

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
                <div className="form__header">
                  <h3 className="form__title" style={{ marginBottom: 0 }}>
                    Quản lý người dùng
                  </h3>

                  <Link
                    to="/bang-dieu-khien/nguoi-dung/them-moi"
                    class="button"
                  >
                    Thêm mới
                  </Link>
                </div>

                <input
                  type="text"
                  onChange={(e) => changeKeyword(e.target.value)}
                  className="form-input-outline"
                  placeholder="Nhập từ khóa cần tìm kiếm"
                />

                {users.length > 0 ? (
                  <Fragment>
                    <table>
                      <tr>
                        <th></th>
                        <th>Tên đăng nhập</th>
                        <th>Tên đầy đủ</th>
                        <th>Email</th>
                        <th>Phân quyền</th>
                        <th>Ngày tạo</th>
                      </tr>

                      {users &&
                        users.map((user) => (
                          <tr>
                            <td>
                              <div className="table-menu">
                                <i className="fas fa-bars"></i>

                                <ul className="table-menu__list">
                                  <li className="table-menu__list-item">
                                    <Link
                                      to={`/bang-dieu-khien/nguoi-dung/thong-tin/${user.public_id}`}
                                    >
                                      Xem thông tin
                                    </Link>
                                  </li>

                                  {user.public_id !== this.state.user.id && (
                                    <Fragment>
                                      <li className="table-menu__list-item">
                                        <Link
                                          to={`/bang-dieu-khien/nguoi-dung/cap-nhat/${user.public_id}`}
                                        >
                                          Cập nhật
                                        </Link>
                                      </li>
                                      <li className="table-menu__list-item">
                                        <Link
                                          to={`/bang-dieu-khien/nguoi-dung/xoa/${user.public_id}`}
                                        >
                                          Xóa
                                        </Link>
                                      </li>
                                    </Fragment>
                                  )}
                                </ul>
                              </div>
                            </td>
                            <td>{user.username}</td>
                            <td>{user.full_name}</td>
                            <td>{user.email}</td>
                            <td>
                              {user.admin === 1
                                ? 'Quản trị viên'
                                : 'Người dùng'}
                            </td>
                            <td>{formatDateString(user.created_at)}</td>
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
  connect(mapStateToProps, { showNotification })(UserManager)
);
