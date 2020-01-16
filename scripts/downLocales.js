const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// 国际化id
const i10nIds = '5dbbf7b2279509006c454221,5dbbf2df279509006c4524fe';
const downloadLocalesApi = `https://front-basic-dev.aidoin.com/api/i10n/down?vids=${i10nIds}`;

// 请求数据
const downData = () =>
  new Promise((resolve, reject) => {
    const myURL = new URL(downloadLocalesApi);
    const protocol = myURL.protocol === 'https:' ? https : http;
    console.log('==开始下载==');
    const req = protocol.get(downloadLocalesApi, res => {
      let data = '';
      res.setEncoding('utf-8');
      res.on('data', chunk => {
        data = `${data}${chunk}`;
      });
      res.on('end', () => {
        console.log('==下载成功==');
        resolve(data);
      });
    });

    req.on('error', e => {
      console.log('==下载失败==');
      reject(e);
    });

    req.end();
  });

// 生成js文件到public中
const writeFile = data =>
  new Promise((resolve, reject) => {
    const result = `window.g_locales=${data}`;
    console.log('==开始写入文件==');
    fs.writeFile(path.join(__dirname, '../public/locales.js'), result, err => {
      if (err) {
        console.log('==写入文件失败==');
        reject(err);
      }
      console.log('==写入文件成功==');
      resolve(err);
    });
  });

const init = async () => {
  try {
    const data = await downData();
    await writeFile(data);
  } catch (e) {
    console.error('下载字体库失败', e);
    process.exit();
  }
};

init();
