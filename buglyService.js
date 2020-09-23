const http = require("http");
const https = require("https");

http
  .createServer(function (request, response) {
    // 定义了一个post变量，用于暂存请求体的信息
    let post = "";

    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    request.on("data", function (chunk) {
      post += chunk;
    });

    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    request.on("end", function () {
      console.log("接收到原始数据", typeof post);
      // console.log("接收到原始数据", post.toString());

      // 简单判断数据格式，是否符合要求
      if (!post || post === "") {
        return;
      }

      // 解析请求参数
      const jsonBody = JSON.parse(post);
      // console.log("解析后数据jsonBody", jsonBody);
      // console.log("解析后数据jsonBody 类型", typeof jsonBody);

      // 转换格式
      let newData = jsonBody.eventContent.datas.filter(function (
        element,
        index,
        self
      ) {
        // console.log(element); // 依次打印'A', 'B', 'C'
        // console.log(index); // 依次打印0, 1, 2
        // console.log(self); // self就是变量datas
        if (
          // element.version === "1.5.500"||
          // element.version === "1.5.101" ||
          element.version === "1.5.200"
        ) {
          return true;
        } else {
          return false;
        }
      });
      // console.log("过滤后的数据", newData);
      if (newData && newData.length > 0) {
        let crashData = newData[0];
        console.log("符号条件的数据crashData", crashData);
        let newJson = {
          msgtype: "markdown",
          markdown: {
            content:
              `### 每日Crash数据 \n` +
              `- 联网用户数：${crashData.accessUser} \n` +
              `- crash次数： ${crashData.crashCount} \n` +
              `- crash影响用户数：${crashData.crashUser} \n` +
              `- 版本号：${crashData.version} \n` +
              `[点击查看详情](${crashData.appUrl})`,
          },
        };

        // 发送新的请求
        sendWeChat(newJson);
      }

      // 返回请求状态
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf8",
      });
      response.end(0);
    });
    request.on("error", function (msg) {
      console.log("捕获到错误数据error", msg);
    });
  })
  .listen(8888);

/**
 * 发送Jason数据给企业微信
 * @param {Json} json
 */
const sendWeChat = (json) => {
  let post_data = JSON.stringify(json);
  // console.log("发送给企业微信数据json", post_data);
  let options = {
    hostname: "qyapi.weixin.qq.com", //此处不能写协议
    path: "/cgi-bin/webhook/send?key=d1e4439a-8f30-4bab-a7ff-186b0d5ad9e4",
    // path: "/cgi-bin/webhook/send?key=b085a61d-160c-457a-a9c2-45a5b67f123e",  小分队群
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      //   "Content-Length": post_data.length,
    },
  };
  let clientRequest = https.request(options, function (response) {
    console.log("STATUS:" + response.statusCode);
    console.log("HEADERS:" + JSON.stringify(response.headers));
    response.setEncoding("utf8");
    response.on("data", function (chunk) {
      console.log("BODY:" + chunk);
    });
  });
  clientRequest.on("error", function (e) {
    console.log("problem with request: " + e.message);
  });
  // write data to request body
  clientRequest.write(post_data);
  clientRequest.end();
  // console.log(clientRequest);
};

// 终端打印如下信息
console.log("Server running at https://58.87.106.184:8888");
// console.log('Server running at http://127.0.0.1:8888');
