// 渠道商详情页面
import React from 'react';
import { AnyAction } from 'redux';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { match as IMatch } from 'dva/router';
import { ConnectState } from '@/models/connect';
import { CodeType } from '@/models/dictionary';
import { TChannelVendorDetail } from '../../models/channelVendor';

/**
 * URL 参数类型定义
 */
export interface IUrlParams {
  id: string;
}

/**
 * Props 类型定义
 */
export interface IDetailProps {
  children: React.ReactElement;
  match: IMatch<IUrlParams>;
  dispatch<K = any>(action: AnyAction): K;
  ADMINISTRATIVE_DIVISION: Array<CodeType> | null;
  channelVendorDetail: TChannelVendorDetail | null;
  loading: boolean;
}

@connect(({ dictionary, channelVendor, loading }: ConnectState) => ({
  ADMINISTRATIVE_DIVISION: dictionary.ADMINISTRATIVE_DIVISION,
  channelVendorDetail: channelVendor.channelVendorDetail,
  loading: loading.effects['channelVendor/getChannelVendorDetail'],
}))
class ChannelVendorManage extends React.PureComponent<IDetailProps> {
  componentDidMount() {
    // 字典请求时效不定，导致
    // VB-9633 【v1.4uat】【业务支撑】查看渠道商详情界面，出现界面白屏（非必现，sit尝试几十次未复现）
    // const { dispatch, match } = this.props;
    // dispatch({
    //   type: 'channelVendor/getChannelVendorDetail',
    //   payload: {
    //     channelVendorId: match.params.id,
    //   },
    // });
  }

  componentWillReceiveProps(nextProps: IDetailProps) {
    const { ADMINISTRATIVE_DIVISION: NEXT_ADMINISTRATIVE_DIVISION } = nextProps;
    const { ADMINISTRATIVE_DIVISION } = this.props;
    if (
      NEXT_ADMINISTRATIVE_DIVISION &&
      ADMINISTRATIVE_DIVISION !== NEXT_ADMINISTRATIVE_DIVISION &&
      NEXT_ADMINISTRATIVE_DIVISION.length > 0
    ) {
      const { dispatch, match } = this.props;
      dispatch({
        type: 'channelVendor/getChannelVendorDetail',
        payload: {
          channelVendorId: match.params.id,
        },
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'channelVendor/clearChannelVendor',
    });
  }

  // 根据id 获取详情
  childrenRender = () => {
    const { children, channelVendorDetail, loading } = this.props;
    return React.cloneElement(children, {
      title: (
        <div>
          <span style={{ paddingRight: '5px' }}>
            {formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}:{' '}
          </span>
          {channelVendorDetail ? channelVendorDetail.name : null}
        </div>
      ),
      loading: !channelVendorDetail && loading,
    });
  };

  render() {
    return this.childrenRender();
  }
}

export default ChannelVendorManage;
