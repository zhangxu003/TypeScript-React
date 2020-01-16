import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import Search from './Search';
import CampusList from './Components/CampusList';

export default (): React.ReactNode => (
  <PageWrapper extra={<Search />}>
    <CampusList />
  </PageWrapper>
);
