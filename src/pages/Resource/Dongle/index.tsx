import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import Search from './components/Search';
import TableList from './components/TableList';

class Dongle extends React.PureComponent {
  render() {
    return (
      <PageWrapper extra={<Search />}>
        <TableList />
      </PageWrapper>
    );
  }
}

export default Dongle;
