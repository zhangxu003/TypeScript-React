import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import DocumentTitle from 'react-document-title';
import React from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectProps } from '@/models/connect';

const UserLayout: React.SFC<ConnectProps> = props => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);

  return (
    <DocumentTitle
      title={getPageTitle({
        pathname: location.pathname,
        breadcrumb,
        formatMessage,
        ...props,
      })}
    >
      {children}
    </DocumentTitle>
  );
};

export default UserLayout;
