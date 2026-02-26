import userData from "../../data/users.json" assert { type: "json" };

const deleteUserById = (id) => {
  const userIndex = userData.users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return null;
  }

  const deletedUser = userData.users.splice(userIndex, 1);

  return deletedUser;
};

export default deleteUserById;
