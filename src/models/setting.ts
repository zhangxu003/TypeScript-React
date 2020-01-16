/**
 * 去除，代码中，在线更改主题的功能
 */
import defaultSettings, { DefaultSettings } from '../../config/defaultSettings';

export interface SettingModelType {
  namespace: 'settings';
  state: DefaultSettings;
}

const SettingModel: SettingModelType = {
  namespace: 'settings',
  state: defaultSettings,
};
export default SettingModel;
