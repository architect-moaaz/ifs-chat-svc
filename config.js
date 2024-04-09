require('dotenv').config();
var config = {
  development: {
    app : {
      port: 8000,
      identityUrl: "https://id-dev.intelliflow.in/IDENTITY/",
      originUrl: "http://localhost:3000",
      kcurl: "kc-dev.intelliflow.in"
    },
    mongodb: {
      url: "mongoadmin:bdung@0.0.0.0:27017/"
    }
    
    
  },
  production: {
    app : {
      port: process.env.DEV_PORT,
      identityUrl: process.env.DEV_IDENTITY_URL,
      originUrl: process.env.DEV_ORIGIN_URL,
      kcurl: process.env.DEV_KEY_CLOAK_HOST
    },
    mongodb: {
      url: process.env.DEV_MONGO_USERNAME + ":" + process.env.DEV_MONGO_PASSWORD + "@" +
        process.env.DEV_MONGO_HOST + ":" + process.env.DEV_MONGO_PORT
    }
    
  },
   colo: {
    app : {
      port: process.env.COLO_PORT,
      identityUrl: process.env.COLO_IDENTITY_URL,
      originUrl: process.env.COLO_ORIGIN_URL,
      kcurl: process.env.COLO_KEY_CLOAK_HOST
    },
    mongodb: {
      url: process.env.COLO_MONGO_USERNAME + ":" + process.env.COLO_MONGO_PASSWORD + "@" +
        process.env.COLO_MONGO_HOST + ":" + process.env.COLO_MONGO_PORT
    }
  },
  uat: {
    app : {
      port: process.env.UAT_PORT,
      identityUrl: process.env.UAT_IDENTITY_URL,
      originUrl: process.env.UAT_ORIGIN_URL,
      kcurl: process.env.UAT_KEY_CLOAK_HOST
    },
    mongodb: {
      url: process.env.UAT_MONGO_USERNAME + ":" + process.env.UAT_MONGO_PASSWORD + "@" +
        process.env.UAT_MONGO_HOST + ":" + process.env.UAT_MONGO_PORT
    }
  },
  gcp: {
    app : {
      port: process.env.GCP_PORT,
      identityUrl: process.env.GCP_IDENTITY_URL,
      originUrl: process.env.GCP_ORIGIN_URL,
      kcurl: process.env.GCP_KEY_CLOAK_HOST
    },
    mongodb: {
      url: process.env.GCP_MONGO_USERNAME + ":" + process.env.GCP_MONGO_PASSWORD + "@" +
        process.env.GCP_MONGO_HOST + ":" + process.env.GCP_MONGO_PORT
    }
  },
};

module.exports = config;
