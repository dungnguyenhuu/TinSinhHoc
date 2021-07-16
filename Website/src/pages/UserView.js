import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';
import { formatDateString } from '../utils';

class UserView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {},
      user: this.props.user,
      userId: this.props.match.params.id,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { fetchData } = this;
    this.setState(
      { userId: nextProps.match.params.id, user: nextProps.user },
      fetchData
    );
  }

  componentDidMount() {
    const { fetchData } = this;

    fetchData();
  }

  fetchData = async () => {
    const { showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { users } = apiRoutes;
      const userId = this.state.userId;
      const url = `${users.details}/${userId}`;
      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        this.setState({
          userData: response.data.data,
        });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Lấy thông tin của người dùng thất bại!');
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

  render() {
    const { userData } = this.state;

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
                <form className="auth-form">
                  <h3 className="form__title">Xem thông tin người dùng</h3>

                  <div className="form__main">
                    <div className="form-group">
                      <label>Tên đăng nhập</label>
                      <input
                        type="text"
                        placeholder="Tên đăng nhập"
                        disabled={true}
                        value={userData.username}
                      />
                    </div>

                    <div className="form-group">
                      <label>Tên đầy đủ</label>
                      <input
                        type="text"
                        placeholder="Tên đầy đủ"
                        disabled={true}
                        value={userData.full_name}
                      />
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ email</label>
                      <input
                        type="text"
                        placeholder="Địa chỉ email"
                        disabled={true}
                        value={userData.email}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phân quyền</label>
                      <input
                        type="text"
                        placeholder="Phân quyền"
                        disabled={true}
                        value={
                          userData.admin === 1 ? 'Quản trị viên' : 'Người dùng'
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Thời gian tạo</label>
                      <input
                        type="text"
                        placeholder="Thời gian tạo"
                        disabled={true}
                        value={formatDateString(userData.created_at)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Thời gian cập nhật cuối</label>
                      <input
                        type="text"
                        placeholder="Thời gian cập nhật cuối"
                        disabled={true}
                        value={formatDateString(userData.updated_at)}
                      />
                    </div>

                    <Link to="/bang-dieu-khien/nguoi-dung" className="button">
                      Trở về
                    </Link>
                  </div>
                </form>
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
  connect(mapStateToProps, { showNotification })(UserView)
);
