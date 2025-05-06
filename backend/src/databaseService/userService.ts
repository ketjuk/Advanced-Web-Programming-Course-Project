import User from '../databaseModel/createUserTable';
import LoginUser from '../databaseModel/createLoginUserTable';
import VerificationCodeTable from '../databaseModel/createCodeTable';
import crypto from 'crypto';

//gengerate a random strng as token
const generateToken = (): string => {
    return crypto.randomBytes(16).toString('hex');
  };

// generate 4 digits random code
const generateCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString(); 
};

//user sign up
export const signupUser = async (username: string, password: string) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('user already exists');
  }

  const user = new User({ username, password});
  await user.save();
  return true;
};

//user log in
export const loginUser = async (username: string, password: string) => {
  const user = await User.findOne({ username, password });
  if (!user) throw new Error('username and password do not match');

  const token = generateToken();
  await LoginUser.create({ username: user.username, token });

  return { username: user.username, token };
};

//search username with token
export const getUsernameWithToken = async (token: string) => {
  const username = await LoginUser.findOne({ token }).populate({
    path: 'username',
    select: 'username', //only return username
    model: 'User',
  });

  return username;
};

//create a verification code record, and return
export const createCode = async () => {
  const code = generateCode();
  const saved = await VerificationCodeTable.create({ code });
  return {
    _id: saved._id.toString(), //return the _id of saved code
    code: saved.code,
  };
};

//check if the verification code is exist
export const checkCode = async(_id: string, code: string) => {
  const record = await VerificationCodeTable.findById(_id);

  if (!record || record.code !== code) {
    throw new Error('Verification code is wrong');
  }

  return true;
}

//log out
export const logoutUser = async (token: string) => {
  await LoginUser.deleteOne({ token });
};
