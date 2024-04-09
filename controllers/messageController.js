const MongoClient = require("mongodb").MongoClient;
const checkNodeEnv = require("../configService")
const axios = require("axios");

var config = checkNodeEnv();

const {
  app: { kcurl },
  mongodb: {url}
} = config;

async function authenticate(token, workspace) {
  var status = 401;
  if(workspace == "Intelliflow"){
    workspace = "master";
  }
  var url = `https://${kcurl}/realms/${workspace}/protocol/openid-connect/userinfo`;
  const options = {
    method: "GET",
    url: url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  let response1 = await axios(options)
    .then(function (response) {
      if (response.status === 200) {
        status = response.status;
      }
      return response.status;
    })
    .catch(async function (error) {
      if (error.response) {
        console.log(error.response);
      }
      return error.response;
    });
  return response1;
}


module.exports.getMessages = async (req, res, next) => {
  
let check = await authenticate(req.headers.token, req.headers.workspace);
if (check == 200) {
  try {
    const client = new MongoClient(
      `mongodb://${url}`,
      { useUnifiedTopology: true }
    );
    await client.connect();
    const workspace = req.headers.workspace;
    const db = client.db(`${workspace}_chats`);
    const messagesCollection = db.collection(`messages`);
    const { from, to } = req.body; // Use req.query instead of req.body for GET requests
    const messages = await messagesCollection
      .find({
        users: {
          $all: [from, to],
        },
      })
      .sort({ updatedAt: 1 })
      .toArray();

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender === from,
        message: msg.message.text,
        time: msg.time
      };
    });

    client.close();
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
} else {
  res.redirect("https://intelliflow.ai/");
}
};

module.exports.addMessage = async (req, res, next) => {
let check = await authenticate(req.headers.token, req.headers.workspace);
if (check == 200) {
  try {
    const client = new MongoClient(
      `mongodb://${url}`,
      { useUnifiedTopology: true }
    );
    await client.connect();
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const workspace = req.headers.workspace;
    const db = client.db(`${workspace}_chats`);
    const messagesCollection = db.collection(`messages`);
    const { from, to, message } = req.body;
    const result = await messagesCollection.insertOne({
      message: { text: message },
      users: [from, to],
      sender: from,
      time: timestamp,
    });

    client.close();

    if (result) return res.json({ msg: "Message added successfully." });
    else {
      res.json({ msg: "Failed to add message to the database" });
    }
  } catch (ex) {
    next(ex);
  }
} else {
  res.redirect("https://intelliflow.ai/");
}
};
