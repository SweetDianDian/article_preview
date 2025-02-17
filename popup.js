const COZE_CONFIG = {
  baseURL: 'https://api.coze.cn/v1/workflow/run',
  token: 'pat_4fgwZw9Ye9rMsiBcAFkPjlnkjL15Oocq0EFsfMsj0628W3DbiFCfj1FvwCT5q0hv',
  workflowId: '7471577248035995660'
};

document.addEventListener('DOMContentLoaded', function () {
  const processButton = document.getElementById('processButton');
  const copyButton = document.getElementById('copyButton');
  const loadingDiv = document.getElementById('loading');
  const resultDiv = document.getElementById('result');
  const resultContent = document.getElementById('resultContent');
  const errorDiv = document.getElementById('error');
  const errorText = document.getElementById('errorText');

  processButton.addEventListener('click', async () => {
    try {
      loadingDiv.classList.remove('hidden');
      resultDiv.classList.add('hidden');
      errorDiv.classList.add('hidden');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab.url;

      const result = await processURL(url);

      try {
        if (typeof marked === 'undefined') {
          throw new Error('Markdown解析器未加载');
        }

        // 配置marked选项
        marked.setOptions({
          renderer: new marked.Renderer(),
          highlight: function (code, lang) {
            return code;
          },
          gfm: true,
          breaks: true
        });

        // 渲染Markdown
        resultContent.innerHTML = marked.parse(result);
        console.log(result, 'result');
        // 处理表格的响应式
        const tables = resultContent.getElementsByTagName('table');
        Array.from(tables).forEach(table => {
          const wrapper = document.createElement('div');
          wrapper.style.overflowX = 'auto';
          table.parentNode.insertBefore(wrapper, table);
          wrapper.appendChild(table);
        });

      } catch (e) {
        resultContent.textContent = result;
        console.error('Markdown parsing failed:', e);
      }

      resultDiv.classList.remove('hidden');
    } catch (error) {
      console.error('Error details:', error);
      errorText.textContent = error.message;
      errorDiv.classList.remove('hidden');
    } finally {
      loadingDiv.classList.add('hidden');
    }
  });

  // 复制按钮点击事件
  copyButton.addEventListener('click', async () => {
    try {
      const content = resultContent.textContent;
      await navigator.clipboard.writeText(content);

      // 显示复制成功提示
      const originalText = copyButton.innerHTML;
      copyButton.innerHTML = '<span>✓</span>';
      setTimeout(() => {
        copyButton.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
});

async function processURL(url) {
  try {
    const response = await fetch(COZE_CONFIG.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_CONFIG.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: COZE_CONFIG.workflowId,
        parameters: {
          article_url: url
        }
      })
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.data) {
      throw new Error('返回数据格式不正确');
    }

    // 解析返回的数据
    const parsedData = JSON.parse(data.data);
    return parsedData.data;

  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
} 