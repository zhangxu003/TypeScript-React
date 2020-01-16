import { Icon } from 'antd';
import defaultSettings from '../../../config/defaultSettings';

const { iconfontUrl: scriptUrl } = defaultSettings;
// 使用：
// import IconFont from '@/components/IconFont';
// <IconFont type='icon-demo' className='xxx-xxx' />
const IconFont = Icon.createFromIconfontCN({ scriptUrl });
export default IconFont;
