import { AnyAction } from 'redux';
import { MenuDataItem } from '@ant-design/pro-layout';
import { RouterTypes } from 'umi';
import { GlobalModelState } from './global';
import { FileModelState } from './file';

import { DefaultSettings as SettingModelState } from '../../config/defaultSettings';
import { UserModelState } from './user';
import { LoginModelType } from './login';
import { DictionaryModelState } from './dictionary';
import { DongleModelState } from '@/pages/Resource/models/dongle';
import { CampusModelState } from '@/pages/Tenant/models/campus';
import { TeacherModelState } from '@/pages/Tenant/models/teacher';
import { PackageModelState } from '@/pages/Resource/Package/models/resourcepackage';
import { TenantPackageModelState } from '@/pages/Tenant/models/tenantpackage';
import { IChannelVendorModelState } from '@/pages/Tenant/models/channelVendor';

export { GlobalModelState, SettingModelState, UserModelState };

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    user?: boolean;
    login?: boolean;
    dongle?: boolean;
    dictionary?: boolean;
    campus?: boolean;
    teacher?: boolean;
  };
}

export interface ConnectState {
  global: GlobalModelState;
  loading: Loading;
  settings: SettingModelState;
  user: UserModelState;
  login: LoginModelType;
  dictionary: DictionaryModelState;
  dongle: DongleModelState;
  campus: CampusModelState;
  teacher: TeacherModelState;
  resourcepackage: PackageModelState;
  tenantpackage: TenantPackageModelState;
  channelVendor: IChannelVendorModelState;
  file: FileModelState;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}

/**
 * @type T: Params matched in dynamic routing
 */
export interface ConnectProps<T = {}> extends Partial<RouterTypes<Route, T>> {
  // dispatch?: Dispatch<AnyAction & Promise<any>>;
  dispatch?<K = any>(action: AnyAction): K;
}
// <T extends A>(action: T): T
