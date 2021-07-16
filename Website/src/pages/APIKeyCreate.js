import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';

class APIKeyCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiKey: {
        user_id: '',
        remaining_calls: 100,
      },
      user: this.props.user,
    };
  }

  componentDidMount() {
    const { fetchUsers } = this;

    fetchUsers();
  }

  changeData = (fieldName, value) => {
    const apiKey = { ...this.state.apiKey };
    apiKey[fieldName] = value;

    this.setState({ apiKey });
  };

  componentWillReceiveProps(nextProps) {
    const { fetchUsers } = this;

    this.setState({ user: nextProps.user }, fetchUsers);
  }

  create = async () => {
    const { showSuccessNotification, showErrorNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.props.user && this.props.user.token,
      };

      const { apiKey } = this.state;
      const { apiKeys } = apiRoutes;
      const url = apiKeys.createForUser;
      const response = await axios.post(url, apiKey, { headers });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { message } = response.data;

        showSuccessNotification(message);
        this.props.history.push('/bang-dieu-khien/api-key');
      } else {
        const { message } = response.data;

        showErrorNotification(message);
      }
    } catch (error) {
      showErrorNotification('Thêm API key mới thất bại!');
    }
  };

  submit = (e) => {
    e.preventDefault();
    this.create();
  };

  showSuccessNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('success', message);
  };

  showErrorNotification = (message) => {
    const { showNotification } = this.props;

    showNotification('error', message);
  };

  fetchUsers = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { users } = apiRoutes;
      let url = users.listAll;

      const response = await axios.get(url, {
        headers,
      });

      if (
        response &&
        response.status === 200 &&
        response.data.status === 'SUCCESS'
      ) {
        const { data } = response.data;
        const { users } = data;

        this.setState({
          users,
          apiKey: {
            ...this.state.apiKey,
            user_id: users[0].id,
          },
        });
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { changeData, submit } = this;
    const { apiKey, users } = this.state;

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
                <form className="auth-form" onSubmit={submit}>
                  <h3 className="form__title">Thêm API key mới</h3>
                  <div className="form-group">
                    <label>Người dùng</label>
                    <select
                      onChange={(e) =>
                        changeData('user_id', parseInt(e.target.value))
                      }
                      value={apiKey.user_id}
                      style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '12px',
                        fontSize: '15px',
                      }}
                    >
                      {users &&
                        users.map((user) => (
                          <option value={user.id}>
                            {user.full_name} ({user.username})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Số request còn lại</label>
                    <input
                      type="number"
                      onChange={(e) =>
                        changeData('remaining_calls', parseInt(e.target.value))
                      }
                      value={apiKey.remaining_calls}
                    />
                  </div>

                  <div className="buttons">
                    <Link
                      to="/bang-dieu-khien/api-key"
                      className="button"
                      style={{ marginRight: '10px' }}
                    >
                      Trở về
                    </Link>
                    <button type="submit" className="button">
                      Thêm mới
                    </button>
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
  connect(mapStateToProps, { showNotification })(APIKeyCreate)
);
