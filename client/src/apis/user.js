import axios from "axios";

const url = `https://jsonplaceholder.typicode.com/user`;
const getAllUsers = async () => {
   try {
      let res = await axios.get(url);
      return res.data;
   } catch (error) {
      console.log(error.message);
   }
};

const getUserById = async (userId) => {
   try {
      let res = await axios.get(`${url}/${userId}`);
      return res.data;
   } catch (error) {
      console.log(error.message);
   }
};

export { getAllUsers, getUserById };
