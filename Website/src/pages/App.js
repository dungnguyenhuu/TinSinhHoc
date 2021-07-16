import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Main from '../components/Main';
import Layout from '../components/Layout';
import SlideShow from '../components/SlideShow';

class App extends Component {
  render() {
    return (
      <Layout>
        <SlideShow />

        <div className="wrapper">
          <Main />
        </div>
      </Layout>
    );
  }
}

export default App;
