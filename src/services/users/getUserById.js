import userData from "../../data/users.json" assert { type: "json" };

const getUserById = (id) => {
  return userData.users.find((user) => user.id === id);
};

export default getUserById;
