const MongoClient = require("mongodb").MongoClient;

const axios = require("axios");
const checkNodeEnv = require("../configService");

var config = checkNodeEnv();

const {
  app: { identityUrl, kcurl },
  mongodb: { url },
} = config;

async function authenticate(token, workspace) {
  console.log("Authenticating",workspace);
  if(workspace == "Intelliflow"){
    workspace = "master";
  }
  // let workspace = req.headers.workspace;
  // console.log("workspace", workspace);
  var status = 401;
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
      console.log("line 310", response.status);
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

module.exports.getAllusers = async (req, res, next) => {
  let check = await authenticate(req.headers.token, req.headers.workspace);
  console.log("request",req.headers, req.body);
  console.log("42", check);
  if (check == 200) {
    console.log("check1", req.headers.token);
    var getuserapi = {
      method: "get",
      url: identityUrl + "user/fetchallusers",
      headers: {
        authorization: req.headers.authorization,
        "Content-Type": "application/json",
        workspace: req.headers.workspace,
        redirect: "follow",
      },
    };

    try {
      const response = await axios(getuserapi);
      return response.data; // Return the response data
    } catch (error) {
      console.log("error:", error.message);
      return null; // Return null or an empty array (depending on your use case) in case of an error
    }
  } else {
    res.redirect("https://intelliflow.ai/");
  }
};

module.exports.addAllUsers = async (req, res, next) => {
  let check = await authenticate(req.headers.token, req.headers.workspace);
  console.log("70", check);
  if (check == 200) {
    console.log("check2", req.headers.token);
    try {
      const uri = `mongodb://${url}`;

      const client = new MongoClient(uri, { useUnifiedTopology: true });

      await client.connect();

      let res1 = await this.getAllusers(req, res, next);

      if (!res1 || res1.length === 0) {
        // Handle the case when res1 is null or empty

        return res
          .status(404)
          .json({ success: false, message: "No users found." });
      }

      let usernames = [];

      let emails = [];

      let ids = [];

      res1.forEach((resp) => {
        usernames.push(resp.firstName + " " + resp.lastName);

        emails.push(resp.email);

        ids.push(resp.id);
      });

      const userData = [];

      var workspace = req.headers.workspace;

      if (req.headers.workspace === "master") {
        workspace = "Intelliflow";
      }

      const database = client.db(`${workspace}_chats`);

      const usersCollection = database.collection("users");

      // Find existing users with matching email addresses

      const existingUsers = await usersCollection
        .find({ email: { $in: emails } })
        .toArray();

      for (let i = 0; i < usernames.length; i++) {
        // Check if the email is already present in the existingUsers array

        const isEmailAlreadyExists = existingUsers.some(
          (user) => user.email === emails[i]
        );

        if (!isEmailAlreadyExists && emails[i] != null) {
          userData.push({
            _id: ids[i],
            username: usernames[i],
            email: emails[i],
          });
        }
      }
      // Insert non-duplicate users as separate documents in the "users" collection
      let result = await usersCollection.insertMany(userData);
      res.send;
      return res.status(200).json({
        success: true,

        message: "Users data inserted successfully.",

        insertedCount: result.insertedCount,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Error inserting users data.(Invalid/Duplicate Data)",
      });
    }
  } else {
    res.redirect("https://intelliflow.ai/");
  }
};

module.exports.getUserData = async (req, res, next) => {
  let check = await authenticate(req.headers.token, req.headers.workspace);
  
  if (check == 200) {
    console.log("check3", req.headers.token);
    try {
      const uri = `mongodb://${url}`;

      const client = new MongoClient(uri, { useUnifiedTopology: true });

      await client.connect();

      var workspace = req.headers.workspace;

      if (req.headers.workspace === "master") {
        workspace = "Intelliflow";
      }

      const database = client.db(`${workspace}_chats`);

      const usersCollection = database.collection("users");

      const messagesCollection = database.collection("messages");

      const users = await usersCollection.find({}).toArray();

      const usersWithLastMessages = await Promise.all(
        users.map(async (user) => {
          const lastMessage = await messagesCollection

            .find({
              users: {
                $all: [user._id, req.headers.loggedinusername], // Assuming the logged-in user's ID is stored in req.loggedInUserId
              },
            })

            .sort({ time: -1 })

            .limit(1)

            .toArray();

          return {
            ...user,

            lastMessage: lastMessage.length > 0 ? lastMessage[0] : null,
          };
        })
      );

      const sortedUsers = usersWithLastMessages.sort((a, b) => {
        if (!a.lastMessage) return 1;

        if (!b.lastMessage) return -1;

        return b.lastMessage.time - a.lastMessage.time;
      });

      return res.status(200).json({ success: true, users: sortedUsers });
    } catch (err) {
      console.error(err);

      return res
        .status(500)
        .json({ success: false, message: "Error fetching users data." });
    }
  } else {
    res.redirect("https://intelliflow.ai/");
  }
};
