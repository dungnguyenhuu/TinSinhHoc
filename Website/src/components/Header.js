import React, { Component } from 'react';
import { logIn, logOut } from '../redux/actions';
import { NavLink, Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isEmptyObj } from '../utils';

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: this.props.user,
    };
  }

  onLogOut = () => {
    const { history, logOut } = this.props;
    localStorage.removeItem('VTC_USER');
    logOut();
    history.push('/dang-nhap');
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.user });
  }

  render() {
    const { onLogOut } = this;

    return (
      <header>
        <h1 className="header__title">
          <Link to="/">TextClassifier</Link>
        </h1>

        <nav className="header__nav">
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <NavLink to="/" activeClassName="active" exact={true}>
                Trang chủ
              </NavLink>
            </li>
            <li className="header__nav-item">
              <NavLink to="/gioi-thieu" activeClassName="active">
                Giới thiệu
              </NavLink>
            </li>
            <li className="header__nav-item">
              <NavLink to="/huong-dan-su-dung-api" activeClassName="active">
                Hướng dẫn sử dụng API
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* {!isEmptyObj(this.props.user) ? (
          <div className="ml-auto header__dropdown-menu">
            <i className="fas fa-user-circle"></i>&nbsp;&nbsp;Xin chào,{' '}
            {this.state.user &&
              (this.state.user.full_name || this.state.user.username)}
            !
            <ul className="header__dropdown-list">
              {!isEmptyObj(this.state.user) && this.state.user.admin === 1 && (
                <li className="header__dropdown-list-item">
                  <Link to="/bang-dieu-khien/tong-quan">Bảng điều khiển</Link>
                </li>
              )}
              <li className="header__dropdown-list-item">
                <Link to="/tai-khoan">Cập nhật thông tin</Link>
              </li>
              <li className="header__dropdown-list-item">
                <Link to="/thay-doi-mat-khau">Thay đổi mật khẩu</Link>
              </li>
              <li className="header__dropdown-list-item">
                <Link to="/quan-ly-api">Quản lý API</Link>
              </li>
              <li className="header__dropdown-list-item">
                <Link to="#" onClick={onLogOut}>
                  Đăng xuất
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <div className="ml-auto header__buttons">
            <Link to="/dang-nhap">
              <span className="button button-outlined">Đăng nhập</span>
            </Link>

            <Link to="/dang-ky">
              <span className="button button-active">Đăng ký</span>
            </Link>
          </div>
        )} */}

        {/* <h1 className="header__title">Vietnamese Text Classifier</h1> */}
        {/* <p className="header__subtitle"><i className="far fa-file-alt"></i>&nbsp;&nbsp;Phân loại văn bản tiếng Việt trực tuyến&nbsp;&nbsp;<i className="far fa-file-alt"></i></p> */}
      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default withRouter(connect(mapStateToProps, { logIn, logOut })(Header));
