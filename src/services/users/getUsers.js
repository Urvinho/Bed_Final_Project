import userData from "../../data/users.json" assert { type: "json" };

const getUsers = () => {
  return userData.users;
};

export default getUsers;
