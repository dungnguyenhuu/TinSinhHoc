import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';

class UserDelete extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {},
      user: {},
      userId: this.props.match.params.id,
    };
  }

  componentDidMount() {
    const { fetchData } = this;

    fetchData();
  }

  componentWillReceiveProps(nextProps) {
    const { fetchData } = this;

    this.setState(
      {
        userId: nextProps.match.params.id,
        user: nextProps.user,
      },
      fetchData
    );
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

  deleteUser = async () => {
    const { showErrorNotification, showSuccessNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { users } = apiRoutes;
      const userId = this.state.userId;
      const url = `${users.delete}/${userId}`;
      const response = await axios.delete(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { message } = response.data;

        showSuccessNotification(message);
        this.props.history.push('/bang-dieu-khien/nguoi-dung');
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Xóa người dùng khỏi hệ thống thất bại!');
    }
  };

  render() {
    const { deleteUser } = this;

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
                <h3 className="form__title">Xóa người dùng</h3>

                <p>
                  Bạn có chắc chắn muốn xóa người dùng{' '}
                  <strong>
                    {this.state.userData &&
                      (this.state.userData.full_name ||
                        this.state.userData.username)}
                  </strong>{' '}
                  khỏi hệ thống hay không?
                </p>
                <div className="buttons" style={{ marginTop: '12px' }}>
                  <Link
                    to="/bang-dieu-khien/nguoi-dung"
                    className="button"
                    style={{ marginRight: '10px' }}
                  >
                    Trở về
                  </Link>
                  <button className="button" onClick={() => deleteUser()}>
                    Đồng ý
                  </button>
                </div>
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
  connect(mapStateToProps, { showNotification })(UserDelete)
);
