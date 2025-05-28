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

export const changeUserImage = async (token: string, image: string) => {
  const loginInfo = await findLoginInfoByToken(token);
  if (!loginInfo) throw new Error('Invalid token');

  const user = await User.findOne({ username: loginInfo.username });
  if (!user) throw new Error('User not found');

  user.image = image;
  await user.save();

  return true;
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

  await VerificationCodeTable.findByIdAndDelete(_id);

  return true;
}

//get user detail by username
export const findUserByUsername = async (username: string) => {
  return await User.findOne({ username });
};

//get login detail by token
export const findLoginInfoByToken = async (token: string) => {
  return await LoginUser.findOne({ token });
};

//log out
export const logoutUser = async (token: string) => {
  await LoginUser.deleteOne({ token });
};

//save user's comment
export const addCommentToUser = async (userId: string, commentId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $push: { writtenComments: commentId } },
    { new: true }
  );
};

//unsave user's comment
export const deleteCommentToUser = async (userId: string, commentId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { writtenComments: commentId } },
    { new: true }
  );
};

//like article
export const likeArticleForUser = async (userId: string, articleId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $addToSet: { likedArticles: articleId } },
    { new: true }
  );
};

//cancel like article
export const unlikeArticleForUser = async (userId: string, articleId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { likedArticles: articleId } },
    { new: true }
  );
};

//save article
export const saveArticle = async (userId: string, articleId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedArticles: articleId } },
    { new: true }
  );
};

//unsave article
export const unsaveArticle = async (userId: string, articleId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { savedArticles: articleId } },
    { new: true }
  );
};


//follow user
export const followUser = async (userId: string, targetUserId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $addToSet: { following: targetUserId } },
    { new: true }
  );
};

//unfollow user
export const unfollowUser = async (userId: string, targetUserId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { following: targetUserId } },
    { new: true }
  );
};

//specifically for getting the following list from an user
export const getFollowingUsers = async (userIds: string[]) => {
  const users = await User.find({ _id: { $in: userIds } })
    .select('username image')
    .lean();

  return users.map(u => ({
    username: u.username,
    image: u.image || ''
  }));
};