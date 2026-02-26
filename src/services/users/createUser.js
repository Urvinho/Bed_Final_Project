import { v4 as uuidv4 } from "uuid";
import userData from "../../data/users.json" assert { type: "json" };

const createUser = (username, name, password, image) => {
  const newUser = {
    id: uuidv4(),
    name,
    username,
    password,
    image,
  };

  userData.users.push(newUser);

  return newUser;
};

export default createUser;
