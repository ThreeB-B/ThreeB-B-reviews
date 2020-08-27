const casual = require('casual');

const generateUsers = (times) => {
  let users = [];

  for (let i = 0; i < times; i++) {
    let user = {};

    // name
    user.name = casual.first_name;
    //profile pic
    user.profilePicNum = casual.integer(0, 999);

    users.push(user);
  }
  
  return users;
};

module.exports.users = generateUsers(1000);