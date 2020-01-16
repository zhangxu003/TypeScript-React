/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import React, { Component } from 'react';
import { message, Progress } from 'antd';
import './index.less';
import { formatMessage } from 'umi/locale';
import { getOSSAuth, userHeaderImgOSSAuth } from '@/services/global';

/**
 *
 * @class CustomUpload
 *
 * input:
 *    appId:'第三方身份标识' fileSize:'文件上传最大值设置' uploadType:上传类型（userImg头像）
 *
 *  output:
 *  onSuccess(id,path,fileName)  //fileId(文件id),url（文件url）,fileName（文件名）
 */
class CustomUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false, // 上传中
      failUpload: false,
      successUpload: false,

      path: '',
      progress: 0,
      fileId: '',
      aliyunData: null,
      isOSS: false, // 是否是音频上传
    };
  }

  componentDidMount() {}

  // 获取上传文件所需信息
  getOSSInfo() {
    const { appId, fileSize, uploadType } = this.props;
    if (uploadType && uploadType === 'userImg') {
      // 头像oss
      const accountId = localStorage.getItem('uid');
      const params1 = {
        appId,
        fileSize,
        accountId,
      };
      userHeaderImgOSSAuth(params1).then(res => {
        if (res && res.responseCode === '200') {
          this.state.aliyunData = res.data;
        } else {
          const mgs = formatMessage({
            id: 'operate.message.failedToGetFileUploadParameters',
            defaultMessage: '获取文件上传参数失败!',
          });
          message.warning(mgs);
        }
      });
    } else {
      // 非头像
      const params = {
        appId, // 第三方身份标识
        fileSize, // 文件上传最大值设置
      };
      getOSSAuth(params).then(res => {
        if (res && res.responseCode === '200') {
          this.state.aliyunData = res.data;
        } else {
          const mgs = formatMessage({
            id: 'operate.message.failedToGetFileUploadParameters',
            defaultMessage: '获取文件上传参数失败!',
          });
          message.warning(mgs);
        }
      });
    }
  }

  // 选择文件
  changePath = e => {
    const { uploadType } = this.props;
    const file = e.target.files[0];
    console.log('------file', file);
    if (!file) {
      return;
    }

    if (/^image\/\S+$/.test(file.type) && uploadType && uploadType === 'userImg') {
      // 图片上传
      if (file.size > 5 * 1024 * 1024) {
        message.warning('最大可上传5M的图片');
        // eslint-disable-next-line react/no-string-refs
        if (this.refs.uploadBtn) {
          // eslint-disable-next-line react/no-string-refs
          this.refs.uploadBtn.value = null;
        }
        return;
      }
    }

    let src;
    let preview;
    const { type } = file;
    // console.log(this.props.accept)
    // 匹配类型为image/开头的字符串
    if (/^image\/\S+$/.test(type) && this.props.accept.indexOf('image') > -1) {
      src = URL.createObjectURL(file);
      preview = <img src={src} alt="" />;
      // eslint-disable-next-line brace-style
    }
    // 匹配类型为audio/开头的字符串
    else if (/^audio\/\S+$/.test(type) && this.props.accept.indexOf('audio') > -1) {
      if (type.indexOf('mp3') < 0 && type.indexOf('wav') < 0) {
        const mgs = formatMessage({
          id: 'operate.message.pleaseSelectMp3WavFormatFile',
          defaultMessage: '请选择mp3、wav格式文件！',
        });
        message.warn(mgs);
        return;
      }
      // eslint-disable-next-line brace-style
    }
    // 匹配类型为video/开头的字符串
    else if (/^video\/\S+$/.test(type) && this.props.accept.indexOf('video') > -1) {
      src = URL.createObjectURL(file);
      // eslint-disable-next-line jsx-a11y/media-has-caption
      preview = <video src={src} autoPlay loop controls />;
      // eslint-disable-next-line brace-style
    }
    // 匹配类型为text/开头的字符串
    else if (/^text\/\S+$/.test(type) && this.props.accept.indexOf('text') > -1) {
      const self = this;
      const reader = new FileReader();
      reader.readAsText(file);
      // 注：onload是异步函数，此处需独立处理
      // eslint-disable-next-line func-names
      reader.onload = function() {
        preview = <textarea value={this.result} readOnly />;
        self.setState({ path: file.name, data: file, preview });
      };
      return;
    } else {
      const mgs = formatMessage({
        id: 'operate.message.pleaseChooseTheRightFormatFile',
        defaultMessage: '请选择正确格式文件',
      });
      message.warn(mgs);
      return;
    }

    // eslint-disable-next-line react/no-unused-state
    this.setState({ path: file.name, data: file, preview });

    this.upload(file);
  };

  // 上传文件
  upload = data => {
    // const data = this.state.data;
    if (!data) {
      console.log('未选择文件');
      return;
    }

    const { uploadType } = this.props;

    const { type } = data;
    if (type.indexOf('mp3') > 0 || type.indexOf('wav') > 0) {
      /**
       ********************音频上传***********
       * */
      // 此处的url应该是服务端提供的上传文件api
      this.state.isOSS = false;
      const { origin } = window.location;
      const url = `${origin}/api/file/transcode/original-audio-file`;

      const form = new FormData();

      // 此处的file字段由上传的api决定，可以是其它值
      form.append('file', data);

      const xhr = new XMLHttpRequest();

      this.xhr = xhr;
      xhr.upload.addEventListener('progress', this.uploadProgress, false); // 第三个参数为useCapture?，是否使用事件捕获/冒泡

      xhr.onreadystatechange = this.uploadStateChange; // 上传状态变化
      xhr.onerror = this.uploadFail; // 上传失败
      xhr.onload = this.uploadComplete; // 上传完成

      xhr.open('POST', url, true); // 第三个参数为async?，异步/同步

      // eslint-disable-next-line vars-on-top
      // eslint-disable-next-line no-var
      // eslint-disable-next-line block-scoped-var
      var taken = localStorage.getItem('token');
      // eslint-disable-next-line block-scoped-var
      // eslint-disable-next-line no-multi-spaces
      xhr.setRequestHeader('Authorization', `${taken}`); // setRequestHeader必须写在open之后

      xhr.send(form);

      this.setState({
        uploading: true,
      });
    } else {
      // eslint-disable-next-line spaced-comment
      /******** 非音频文件 **** */

      // 环境配置
      // eslint-disable-next-line no-undef
      console.log(process.env.APP_ENV);
      // eslint-disable-next-line no-undef
      // eslint-disable-next-line eqeqeq
      // eslint-disable-next-line no-undef
      if (process.env.APP_ENV === 'pro') {
        // eslint-disable-next-line spaced-comment
        /**============ UAT环境 走OSS =============**/
        this.state.isOSS = true;
        const url = this.state.aliyunData.host;
        const form = new FormData();
        form.append('name', data.name);
        form.append('key', this.state.aliyunData.fileId);
        form.append('policy', this.state.aliyunData.policy);
        form.append('OSSAccessKeyId', this.state.aliyunData.accessId);
        form.append('success_action_status', '200');
        form.append('callback', this.state.aliyunData.callbackBody);
        form.append('signature', this.state.aliyunData.signature);
        form.append('file', data);

        const xhr = new XMLHttpRequest();

        this.xhr = xhr;
        xhr.upload.addEventListener('progress', this.uploadProgress, false); // 第三个参数为useCapture?，是否使用事件捕获/冒泡

        xhr.onreadystatechange = this.uploadStateChange; // 上传状态变化
        xhr.onerror = this.uploadFail; // 上传失败
        xhr.onload = this.uploadComplete; // 上传完成

        xhr.open('POST', url, true); // 第三个参数为async?，异步/同步

        xhr.send(form);

        this.setState({
          uploading: true,
        });
      } else {
        // eslint-disable-next-line spaced-comment
        /**============ dev、sit环境走S3 走OSS没意义 =============**/
        this.state.isOSS = false;
        const { origin } = window.location;
        let url = '';
        if (uploadType && uploadType === 'userImg') {
          const accountId = localStorage.getItem('uid');
          url = `${origin}/api/file/file/head-img?accountId=${accountId}`;
        } else {
          url = `${origin}/api/file/file`;
        }

        // const url = `${origin}/api/file/file/head-img?accountId=${accountId}`;

        const form = new FormData();

        // 此处的file字段由上传的api决定，可以是其它值
        form.append('file', data);

        const xhr = new XMLHttpRequest();

        this.xhr = xhr;
        xhr.upload.addEventListener('progress', this.uploadProgress, false); // 第三个参数为useCapture?，是否使用事件捕获/冒泡

        xhr.onreadystatechange = this.uploadStateChange; // 上传状态变化
        xhr.onerror = this.uploadFail; // 上传失败
        xhr.onload = this.uploadComplete; // 上传完成

        xhr.open('POST', url, true); // 第三个参数为async?，异步/同步

        // eslint-disable-next-line no-redeclare
        var taken = localStorage.getItem('token');
        xhr.setRequestHeader('Authorization', `${taken}`); // setRequestHeader必须写在open之后

        xhr.send(form);

        this.setState({
          uploading: true,
        });
      }
    }
  };

  uploadStateChange = () => {
    console.log(this.xhr);
  };

  uploadProgress = e => {
    console.log(e);

    if (e.lengthComputable) {
      const progress = Math.round((e.loaded / e.total) * 99);
      this.setState({ progress });
    }
  };

  uploadFail = () => {
    console.log('上传失败');

    this.setState({
      failUpload: true,
      uploading: false,
    });
  };

  // 上传完成
  uploadComplete = e => {
    console.log(e);
    if (e.target.readyState === 4 && e.target.status === 200) {
      const { response } = this.xhr;
      const resJson = JSON.parse(response);

      if (!this.state.isOSS) {
        if (resJson.responseCode === '200') {
          this.state.fileId = resJson.data.id;
          this.props.onSuccess(resJson.data.id, resJson.data.path, this.state.path);
          this.setState({
            successUpload: true,
            uploading: false,
            progress: 100,
          });
        } else {
          const code = resJson.data;
          const mgs = formatMessage({ id: code });
          message.warning(mgs);
          this.setState({
            failUpload: true,
            uploading: false,
          });
        }
      } else {
        this.state.fileId = resJson.data.id;
        this.props.onSuccess(resJson.data.id, resJson.data.path, this.state.path);
        this.setState({
          successUpload: true,
          uploading: false,
          progress: 100,
        });
      }
    } else {
      const mgs = formatMessage({
        id: 'operate.message.fileUploadFailsPleaseUploadAgain',
        defaultMessage: '文件上传失败，请重新上传！',
      });
      message.warning(mgs);
      this.setState({
        failUpload: true,
        uploading: false,
      });
    }

    /**  暂时处理方案 清除input的value值，防止选择同一个文件，不触发onchange方法 * */
    // eslint-disable-next-line react/no-string-refs
    if (this.refs.uploadBtn) {
      // eslint-disable-next-line react/no-string-refs
      this.refs.uploadBtn.value = null;
    }
  };

  // eslint-disable-next-line react/sort-comp
  componentWillUnmount() {
    if (this.xhr) {
      this.xhr.upload.removeEventListener('progress', this.uploadProgress, false);
    }
  }

  render() {
    const { accept, type, name, uploadType } = this.props;
    let customStyle = { position: 'relative' };
    if (type === 'controls') {
      customStyle = {};
    }
    return (
      <div className="custom-uploads">
        {uploadType && uploadType === 'userImg' && <div className="tip">最大可上传5M的图片</div>}

        <div className="upload-box" style={customStyle}>
          <i className="iconfont icon-upload" style={{ paddingRight: '5px' }} />{' '}
          {/* <input type='file' className="file-btn" accept='video/*,image/*,text/plain' onChange={this.changePath} /> 选择文件 */}
          <input
            type="file"
            // eslint-disable-next-line react/no-string-refs
            ref="uploadBtn"
            className="file-btn"
            onClick={() => {
              // eslint-disable-next-line no-undef
              if (process.env.APP_ENV === 'pro') {
                this.getOSSInfo();
              }
            }}
            onChange={this.changePath}
            accept={accept}
          />
          {name ||
            (`${accept}`.includes('video/mp4')
              ? formatMessage({ id: 'operate.message.chooseTheVideo', defaultMessage: '选择视频' })
              : formatMessage({
                  id: 'operate.message.selectTheAudio',
                  defaultMessage: '选择音频',
                }))}
        </div>
        <div
          style={{
            display: this.state.path === '' ? 'none' : 'block',
            padding: '10px 0px',
            margin: 0,
          }}
          className="pathName"
        >
          {this.state.path}
        </div>
        <div className="progressWrap">
          {this.state.uploading && (
            <Progress percent={this.state.progress} status={this.uploading ? 'active' : 'normal'} />
          )}
          {this.state.failUpload && (
            <p style={{ padding: '10px 0px', margin: 0 }}>
              {formatMessage({ id: 'operate.message.uploadFailed', defaultMessage: '上传失败' })}
            </p>
          )}
          {this.state.successUpload && (
            <p style={{ padding: '10px 0px', margin: 0 }}>
              {formatMessage({
                id: 'operate.message.uploadedSuccessfully',
                defaultMessage: '上传成功',
              })}
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default CustomUpload;
