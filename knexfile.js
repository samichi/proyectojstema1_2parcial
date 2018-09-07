module.exports = {
    development: {
        client: "postgresql",
        connection:
        "postgres://xpbzhtflffydyb:52508071ffd004d8f9dca6855d0492dfa70ccebf8bee3e6efe311395861bde18@ec2-107-21-233-72.compute-1.amazonaws.com:5432/d22fba2ecbqfdm"
    },
  
    production:{
        client:"postgresql",
        connection: process.env.DATABASE_URL + '?ssl=true'
    }
  };