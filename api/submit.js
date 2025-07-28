export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();

    // 从表单获取字段
    const name = formData.get('name') || '宠物';
    const type = formData.get('type') || '未知类型';
    const symptoms = formData.get('symptom') || '无症状描述';

    // 你可以根据你的表单字段多取一些

    // 组织 DeepSeek prompt
    const prompt = `
你是一名有20年经验的兽医，请根据以下信息给出专业宠物健康建议：
宠物名称：${name}
宠物类型：${type}
症状：${symptoms}

请给出：
1. 在家处理建议（分步骤，用🔵符号）
2. 是否需要立即就医（⚠️红色标注危险症状）
3. 时间预警（如“2小时内就医”）
4. 通俗易懂的病因解释
结尾加一句暖心叮嘱。`;

    // 调用 DeepSeek API
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-2d6aa7553b7f4c10949aac0b61383fcc'  // 把这里替换成你的Key
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位经验丰富的兽医' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('DeepSeek API 错误:', data);
      return new Response('AI 服务错误，请稍后重试', { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content || '未能生成回复，请稍后重试。';

    // 这里你可以做保存、发送邮件或其他操作

    // 简单起见，这里直接跳转感谢页
    return Response.redirect('/thanks.html', 302);

  } catch (error) {
    console.error('API submit 错误:', error);
    return new Response('服务器内部错误', { status: 500 });
  }
}
添加 /api/submit.js 处理表单提交请求
