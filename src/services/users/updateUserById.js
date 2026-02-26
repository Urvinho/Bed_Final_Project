import userData from "../../data/users.json" assert { type: "json" };

const updateUserById = (id, updatedUser) => {
  const userIndex = userData.users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return null;
  }

  // We make sure that the ID and other, unknown properties are not inserted
  const { username, name, password, image } = updatedUser;

  userData.users[userIndex] = {
    ...userData.users[userIndex],
    username: username || userData.users[userIndex].username,
    name: name || userData.users[userIndex].name,
    password: password || userData.users[userIndex].password,
    image: image || userData.users[userIndex].image,
  };

  return userData.users[userIndex];
};

export default updateUserById;
