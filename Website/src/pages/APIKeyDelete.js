import React, { Component } from 'react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import apiRoutes from '../routes/apis';
import { showNotification } from '../redux/actions';
import { connect } from 'react-redux';
import AuthenticatedRoute from '../components/AuthenticatedRoute';

class APIKeyDelete extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiKey: {},
      user: {},
      apiKeyId: this.props.match.params.id,
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
        apiKeyId: nextProps.match.params.id,
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

      const { apiKeys } = apiRoutes;
      const apiKeyId = this.state.apiKeyId;
      const url = `${apiKeys.details}/${apiKeyId}`;
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

  deleteAPIKey = async () => {
    const { showErrorNotification, showSuccessNotification } = this;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-access-token': this.state.user && this.state.user.token,
      };

      const { apiKeys } = apiRoutes;
      const apiKeyId = this.state.apiKeyId;
      const url = `${apiKeys.delete}/${apiKeyId}`;
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
        this.props.history.push('/bang-dieu-khien/api-key');
      } else {
        const { message } = response.data;

        console.log(message);
      }
    } catch (error) {
      showErrorNotification('Xóa API key khỏi hệ thống thất bại!');
    }
  };

  render() {
    const { deleteAPIKey } = this;

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
                <h3 className="form__title">Xóa API Key</h3>

                <p>
                  Bạn có chắc chắn muốn xóa API key{' '}
                  <strong>
                    {this.state.apiKey && this.state.apiKey.generated_key}
                  </strong>{' '}
                  khỏi hệ thống hay không?
                </p>
                <div className="buttons" style={{ marginTop: '12px' }}>
                  <Link
                    to="/bang-dieu-khien/api-key"
                    className="button"
                    style={{ marginRight: '10px' }}
                  >
                    Trở về
                  </Link>
                  <button className="button" onClick={() => deleteAPIKey()}>
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
  connect(mapStateToProps, { showNotification })(APIKeyDelete)
);
