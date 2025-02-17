const axios = require('axios');
const readline = require('readline');

/**
 * Coze API 配置
 * @constant {Object}
 */
const COZE_CONFIG = {
  baseURL: 'https://api.coze.cn/v1/workflow/run',
  token: 'pat_4fgwZw9Ye9rMsiBcAFkPjlnkjL15Oocq0EFsfMsj0628W3DbiFCfj1FvwCT5q0hv', // 替换为您的实际token
  workflowId: '7471577248035995660' // 替换为您的实际workflow_id
};

/**
 * 创建readline接口
 * @type {readline.Interface}
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 调用Coze工作流API
 * @async
 * @param {string} url - 用户输入的URL
 * @returns {Promise<Object>} API响应数据
 * @throws {Error} 请求错误
 */
async function callCozeAPI(url) {
  try {
    const response = await axios({
      method: 'POST',
      url: COZE_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${COZE_CONFIG.token}`,
        'Content-Type': 'application/json'
      },
      data: {
        workflow_id: COZE_CONFIG.workflowId,
        parameters: {
          article_url: url
        }
      },
      timeout: 30000 // 设置30秒超时
    });

    if (!response.data) {
      throw new Error('API返回数据为空');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // 服务器返回错误状态码
      console.error('API错误响应:', {
        status: error.response.status,
        data: error.response.data
      });
      throw new Error(`API请求失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // 请求发送失败
      throw new Error('无法连接到API服务器，请检查网络连接');
    } else {
      // 其他错误
      throw new Error(`API调用错误: ${error.message}`);
    }
  }
}

/**
 * 获取用户输入的URL
 * @returns {Promise<string>} 用户输入的URL
 */
function getUserInput() {
  return new Promise((resolve) => {
    rl.question('请输入要处理的URL: ', (url) => {
      resolve(url);
    });
  });
}

/**
 * 验证URL格式
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否为有效URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 主程序
 * @async
 */
async function main() {
  try {
    // 获取用户输入
    const url = await getUserInput();

    // 验证URL格式
    if (!isValidUrl(url)) {
      throw new Error('请输入有效的URL地址，例如: https://example.com');
    }

    console.log('正在处理URL...');

    // 调用API
    const result = await callCozeAPI(url);

    // 格式化输出结果
    console.log('\n处理结果:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n程序错误:', error.message);
  } finally {
    // 关闭readline接口
    rl.close();
  }
}

// 启动程序
main();

// 处理程序退出
process.on('exit', () => {
  console.log('程序已退出');
}); 