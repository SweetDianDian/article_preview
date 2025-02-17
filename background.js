// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('URL Content Processor 插件已安装');
});

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'processURL') {
    console.log('Processing URL:', request.url);
    sendResponse({ status: 'received' });
  }
  return true;
});

// 确保service worker保持活跃
chrome.runtime.onConnect.addListener(function(port) {
  port.onDisconnect.addListener(function() {
    console.log('Port disconnected');
  });
});

// 添加请求监听器来处理CORS
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const headers = details.responseHeaders || [];
    headers.push({
      name: 'Access-Control-Allow-Origin',
      value: chrome.runtime.getURL('')
    });
    headers.push({
      name: 'Access-Control-Allow-Headers',
      value: 'Authorization, Content-Type'
    });
    return { responseHeaders: headers };
  },
  { urls: ['https://api.coze.cn/*'] },
  ['responseHeaders', 'extraHeaders']
); 