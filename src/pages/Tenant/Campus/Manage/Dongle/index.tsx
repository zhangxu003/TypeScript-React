import React, { Component } from 'react';
import DongleList from './components/DongleList';
import styles from './index.less';

class RelationPackage extends Component {
  state = {};

  componentDidMount() {}

  handleTabChange = (key: string) => {
    console.log(key);
  };

  render() {
    return (
      <div className={styles.relationPackageContainer}>
        <DongleList />
      </div>
    );
  }
}
export default RelationPackage;
