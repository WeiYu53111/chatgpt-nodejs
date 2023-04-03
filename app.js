const express = require('express');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const crypto = require('crypto');
const env = require('./envi')

// Configure your proxy settings

/*
const proxyAgent = new HttpsProxyAgent(`http://${proxyHost}:${proxyPort}`);
*/





const axiosInstance = axios.create({
  baseURL: env.openaiApiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.openaiApiKey}`,
  },
  //httpsAgent: proxyAgent,
});




const app = express();

// 解析 JSON 格式的请求体数据
app.use(express.json());
// 使用 urlencoded() 解析器函数处理 URL 编码格式的请求体数据
app.use(express.urlencoded({ extended: false }));


const rateLimiter = new RateLimiterMemory({
  points: 15, // Number of requests allowed
  duration: 60, // Time duration in seconds
});

/***********************************      chatgpt 信息          ********************************************  */
app.post('/wxapp/sendText', async (req, res) => {
  try {

    //console.log(req)
    await rateLimiter.consume(req.ip); // Limit request rate

    const prompt = req.body.message;
    if (!prompt) {
      return res.status(400).json({ error: 'Message is required' });
    }
    console.log("已经接收到请求了:"+prompt)

    const messages = [
        {
          role: 'user',
          content: prompt,
        },
      ];


    const response = await axiosInstance.post('', {
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
      });
      
    console.log('API Response:', response.data.choices[0].message.content);
    const data ={
      messages: response.data.choices[0].message.content
    }
    res.status(200).json({data:data});

  } catch (error) {
    if (error instanceof RateLimiterMemory) {
      res.status(429).json({ error: 'Too many requests' });
    } else {
      console.error('API Request Error:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
});


/***********************************     登录            ********************************************  */
app.post('/wxapp/login', (req, res) => {

  //console.log(req)

  const token = generateToken(""); // 生成 token 数据
  const data = {
    token: token
  }

  res.status(200).json({
    data: data
  });
});



/***********************************     获取余额            ********************************************  */
app.post('/wxapp/getBalance', (req, res) => {


  console.log("查询余额以及过期时间")
  const balance = 0; // 随机生成一个小数
  const currentTime = new Date();
  const futureTime = new Date(currentTime);
  futureTime.setHours(currentTime.getHours() + 1);
  const futureTimeStr = futureTime.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  

  const data = {
    balance: balance,
    vip_expire_time: futureTimeStr.substring(0,10)
  }

  res.status(200).json({
    data: data
  });
});

function generateToken(openid) {
  /*const timestamp = new Date().getTime();
  const secret = 'your-secret-key'; // 替换为您的秘钥

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(openid + timestamp.toString());

  const token = hmac.digest('hex');*/

  return "token";
}


/***********************************     登录            ********************************************  */
app.post('/wxapp/getWxappInfo', (req, res) => {
  const data = {
    page_title: "哂码助手"
  }

  res.status(200).json({
    data: data
  });
});

/***********************************     敏感词过滤           ********************************************  */
app.post('/wxapp/wordFilter', (req, res) => {
  const message = req.body.message;

  console.log(req.body)

  // 定义敏感词数组
  const badWords = ['尼玛', '他妈的', '狗屎'];

  // 使用正则表达式匹配敏感词，并将其替换为 ***
  const regex = new RegExp(badWords.join('|'), 'gi');
  const filteredMessage = message.replace(regex, '***');

  const data = {
    message: filteredMessage
  }


  // 返回过滤后的字符串
  res.status(200).json({ data:data });
});



/***********************************     获取历史聊天记录           ********************************************  */
app.post('/wxapp/getHistoryMsg', (req, res) => {
  const message = req.body.message;

  console.log(req.body)

  // 定义敏感词数组
  //const badWords = ['尼玛', '他妈的', '狗屎'];

  // 使用正则表达式匹配敏感词，并将其替换为 ***
  //const regex = new RegExp(badWords.join('|'), 'gi');
  //const filteredMessage = message.replace(regex, '***');

  const data = {
    message: []
  }


  // 返回过滤后的字符串
  res.status(200).json({ data:data });
});







// Start server
const port = env.port || 9995;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
