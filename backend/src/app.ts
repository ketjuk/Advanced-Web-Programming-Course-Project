import connectDB from './db';

import express, { RequestHandler } from 'express';

import { upload } from './uploadMiddleware';

//request
import {  LoginBody, SignupBody, 
          CreateArticleBody, 
          BrowseArticleBody, ArticleDetailBody, 
          CreateCommentBody, DeleteCommentBody, CreateReplyBody, 
          LikeArticleBody, UnlikeArticleBody, 
          SearchUserBody,
          UploadFileBody, DeleteFileBody } from './types/request';
//user database
import {
  loginUser, signupUser,
  createCode, checkCode,
  findUserByUsername, findLoginInfoByToken,
  addCommentToUser, deleteCommentToUser, getFollowingUsers,
  likeArticleForUser, unlikeArticleForUser
} from './databaseService/userService';
//article database
import {  articleExists, createArticle, getBrowseArticle, getPostDetail, 
          addComment, deleteCommentById, addSecondLevelComment,
          likeArticle, unlikeArticle,
          getArticlesByUser, getUserArticles, getUserComments } from './databaseService/articleService';
//response
import {  CodeResponse, LoginResponse, SignupResponse, 
          CreateCommentResponse, DeleteCommentResponse, CommentReplyResponse, 
          CreateArticleResponse, BrowseArticlesResponse, ArticleDetailResponse, getUsersArticlesResponse,
          LikeArticleResponse, UnlikeArticleResponse,
          SearchUserResponse,
          UploadFileResponse, DeleteFileRessponse } from './types/response';
import path from 'path';
const app = express();
const port = 3000;
const fs = require('fs');

app.use(express.json());
app.use(require("cors")());
//connect to Mongo database
connectDB();
// Enable static access to "upload" directory
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

/*
  POST method
  request with: /log_in
  body: 
  {
    "username"  : string,
    "password"  : string,
    "_id"       : string,
    "code"      : string
  }

  if success, return with 200 status code and a json message: 
  {
    "message"   : "login success",
    "username"  : <same as above>,
    "token"     : <a random generated string>
  }

  if the username or password is missing, return with 400 and a json message: 
  {
    "error": "username, password or id should not be blank"
  }

  if the verification code is wrong, return with 401 status code and a json message: 
  {
    "error": "centification code is wrong"
  }

  if username and password do not match, return with 401 status code and a json message: 
  {
    "error": "username and password do not match"
  }

*/
app.post("/log_in", (async (
  req: express.Request<{}, {}, LoginBody>,
  res: express.Response<LoginResponse>
) => {
  const { username, password, _id, code } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      error: "username, password or id should not be blank",
    });
    return;
  }
  if (!_id || !code) {
    res
      .status(400)
      .json({ success: false, error: "_id and code should not be blank" });
    return;
  }

  try {
    await checkCode(_id, code);
    const result = await loginUser(username, password); //
    res
      .status(200)
      .json({ success: true, data: { message: "login success", ...result } });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    });
  }
}) as RequestHandler);

/*
  POST method
  request with: /sign_up
  body: 
  {
    "username"  : string,
    "password"  : strng,
    "_id"       : string,
    "code"      : string
  }

  if success, return with 200 status code and a json message: 
  {
    "message": "signup success",
    "success": true
  }

  if the username or password is missing, return with 400 and a json message: 
  {
    "error": "username and password should not be blank"
  }

  if the verification _id and code is missing, return with 400 and a json message: 
  {
    "error": "_id and code should not be blank"
  }

  if the verification code is wrong, return with 401 status code and a json message: 
  {
    "error": "centification code is wrong"
  }

  if failed, return with 401 status code and a json message: 
  {
    "error": "user already exists"
  }

*/
app.post("/sign_up", (async (
  req: express.Request<{}, {}, SignupBody>,
  res: express.Response<SignupResponse>
) => {
  const { username, password, _id, code } = req.body;
  if (!username || !password || !_id) {
    res.status(400).json({
      success: false,
      error: "username and password should not be blank",
    });
    return;
  }
  if (!_id || !code) {
    res
      .status(400)
      .json({ success: false, error: "_id and code should not be blank" });
    return;
  }

  try {
    await checkCode(_id, code);
    const result = await signupUser(username, password);
    res
      .status(200)
      .json({ success: true, data: { message: "signup success" } });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: (err as Error).message,
    });
  }
}) as RequestHandler);

/*
  GET method
  request with: /request_code
  no additional information needed for a request
  always generate and return a new record of _id and code:
  {
  "message": {
    "_id": "67f829c85a896574dc650237",
    "code": "4674"
  }
}
*/
app.get("/request_code", (async (
  req: express.Request<{}, {}, {}>,
  res: express.Response<CodeResponse>
) => {
  const code = await createCode();
  res.status(200).json({ success: true, data: { ...code } });
}) as RequestHandler);

/*
  POST method
  request with /create_article
  header:
  Authentication: <token>
  body:
  {
    "title": <compulsatory string>
    "category": string,
    "content":  string
  }

  if success, return with 201 status code and a json message: 
  {
    "success": true,
    "data": {
      "title": "test article",
      "category": "test field",
      "content": "some text",
      "author": "111@11.com",
      "likes": 0,
      "comments": []
    }
  }

  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token or title or category is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token, title or category"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }
*/

app.post('/create_article', (async (req: express.Request<{}, {}, CreateArticleBody>, res: express.Response<CreateArticleResponse | { error: string }>) => {
  const token = req.header('Authentication');
  const { title, category, content } = req.body;

  if (!token || !title || !category) {
    res.status(400).json({ error: 'Missing token, title or category' });//can be divided afterwards
    return;
  }

  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const user = await findUserByUsername(loginInfo.username);
    if (!user) throw new Error('User not found');

    const article = await createArticle(title, category, content, user._id.toString());

    const response: CreateArticleResponse = {
      success: true,
      data: {
        article_id: article._id.toString(),
        title: article.title,
        category: article.category ?? '',
        content: article.content ?? '',
        author: user.username,
        likes: article.likes,
        comments: [],
      },
    };

    res.status(201).json(response);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
}) as RequestHandler);

/*
  POST method
  request with /create_comment
  header:
  Authentication: <token>
  body:
  {
    "article_id": "6812251120cbc77f8a604be3",
  "content": "123"
  }

  if success, return with 201 status code and a json message:
  {
    "success": true,
    "data": {
      "article_id": "681539e0f3a1397d9a07b14d",
      "author": "111@11.com",
      "content": "123",
      "replies": []
    }
  }
  
  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  if article id is not matched with any articles, return with 401 status code and a json message:
  {
  "error": "Post not found"
  }

  if article id is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing article id"
  }

  if content is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing content"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }
*/
app.post('/create_comment', (async (req: express.Request<{}, {}, CreateCommentBody>, res: express.Response<CreateCommentResponse | { error: string }>) => {
  const token = req.header('Authentication');
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }

  const { article_id, content } = req.body;
  if (!article_id) {
    res.status(400).json({ error: 'Missing article id' });
    return;
  }
  if (!content) {
    res.status(400).json({ error: 'Missing content' });
    return;
  }

  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const user = await findUserByUsername(loginInfo.username);
    if (!user) throw new Error('User not found');

    const comment = await addComment(article_id, user._id.toString(), content);

    const update = await addCommentToUser(user._id.toString(), comment._id.toString());

    const response: CreateCommentResponse = {
      success: true,
      data: {
        article_id: comment._id.toString(),
        author: user.username,
        content: comment.content ?? '',
        replies: [],
      },
    };

    res.status(201).json(response);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
}) as RequestHandler);

/*
  POST method
  request with /delete_comment
  header:
  Authentication: <token>
  {
    "comment_id": "6816901d1737568ba4f401de"
  }

  if success, return with 201 status code and a json message:
  {
    "success": true,
    "data": {
      "message": "successfully deleted the comment"
    }
  }
  
  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  if comment id is not matched with any comments, return with 401 status code and a json message:
  {
    "error": "Comment not found"
  }

  if the token is not from the author of the comment, return with 401 status code and a json message:
  {
    "error": "Unauthorized: You are not the author of this comment"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }
*/
app.post('/delete_comment', (async (req: express.Request<{}, {}, DeleteCommentBody>, res: express.Response<DeleteCommentResponse | { error: string }>) => {
  const token = req.header('Authentication');
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  const { comment_id } = req.body;
  if (!comment_id) {
    res.status(400).json({ error: 'Missing comment id' });
    return;
  }

  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const user = await findUserByUsername(loginInfo.username);
    if (!user) throw new Error('User not found');

    const comment = await deleteCommentById(comment_id, user._id.toString());

    const update = await deleteCommentToUser(user._id.toString(), comment_id);

    const response: DeleteCommentResponse = {
      success: true,
      data: {
        message: "successfully deleted the comment",
      },
    };

    res.status(201).json(response);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
}) as RequestHandler);

/*
  POST method
  request with /create_reply
  header:
  Authentication: <token>
  body:
  {
    "comment_id": "6816901d1737568ba4f401de",
    "content": "test reply"
  }

  if success, return with 201 status code and a json message:
  {
    "success": true,
    "data": {
      "_id": "6816905e1737568ba4f401ec",
      "content": "test reply",
      "createdAt": "2025-05-03T21:53:34.457Z",
      "author": {
        "username": "111@11.com",
        "image": ""
      },
      "isMine": true
    }
  }
  
  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  if article id is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing article id"
  }

  if comment_id or content is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing comment id or content"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }

  if the comment_id is wrong
  {
    "error": "Comment not found"
  }
*/
app.post('/create_reply', (async (req: express.Request<{}, {}, CreateReplyBody>, res: express.Response<CommentReplyResponse | { error: string }>) => {
  const token = req.header('Authentication');
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }

  const { comment_id, content } = req.body;
  if (!comment_id || !content) {
    res.status(400).json({ error: 'Missing comment id or content' });
    return;
  }

  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const user = await findUserByUsername(loginInfo.username);
    if (!user) throw new Error('User not found');

    const reply = await addSecondLevelComment(comment_id, user._id.toString(), content);

    const response: CommentReplyResponse = {
      success: true,
      data: {
        _id: reply._id?.toString?.() || '',
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        author: {
          username: user.username,
          image: user.image,
        },
        isMine: true,
      }
    };

    res.status(201).json(response);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
}) as RequestHandler);

/*
  POST method
  request with /search_user
  header:
  Authentication: <token>
  body:
  {
    "username": "111@11.com"
  }

  if success, return with 201 status code and a json message:
{
  "success": true,
  "data": {
    "username": "111@11.com",
    "image": "",
    "writtenComments": [
      {
        "comment_id": "681538fd0f1184e1ecade1e1",
        "article_id": "6812251120cbc77f8a604be3",
        "content": "111",
        "createdAt": "2025-05-02T21:28:29.768Z"
      },
      {
        "comment_id": "681539e0f3a1397d9a07b14d",
        "article_id": "6812251120cbc77f8a604be3",
        "content": "123",
        "createdAt": "2025-05-02T21:32:16.227Z"
      },
      {
        "comment_id": "6816901d1737568ba4f401de",
        "article_id": "6812251120cbc77f8a604be3",
        "content": "123",
        "createdAt": "2025-05-03T21:52:29.723Z"
      }
    ],
    "likedArticles": [],
    "savedArticles": [],
    "following": []
  }
}
  
  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  if username is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing username"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }

  if the username is wrong
  {
    "error": "User not found"
  }
*/
app.post('/search_user', (async (req: express.Request<{}, {}, SearchUserBody>, res: express.Response<SearchUserResponse | { error: string }>) => {
  const token = req.header('Authentication');
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const user = await findUserByUsername(username);
    if (!user) throw new Error('User not found');

    const writtenComments = await getUserComments(user._id.toString());
    const likedArticles = await getArticlesByUser(user.likedArticles.map(id => id.toString()));
    const savedArticles = await getArticlesByUser(user.savedArticles.map(id => id.toString()));
    const following = await getFollowingUsers(user.following.map(id => id.toString()));

    const response: SearchUserResponse = {
      success: true,
      data: {
        username: user.username,
        image: user.image || '',
        writtenComments,
        likedArticles,
        savedArticles,
        following
      }
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}) as RequestHandler);

/*
  POST method
  request with /browse_article
  header:
  Authentication: <token>
  body:
  {
    "sort_by": "time"/"likes", "time" as default,
    "start": <number of first article, 0 as default>,
    "limit": <number of required articles, 30 as default>,
    "category" : <string, select a certain category, default "" stands for all categories>
  }

  if success, return with 200 status code and a json message:
  {
    "success": true,
    "data": {
      "articles": [
        {
          "article_id": "6812251120cbc77f8a604be3",
          "title": "test article",
          "author": {
            "username": "111@11.com",
            "image": ""
          },
          "likes": 0,
          "createdAt": "2025-04-30T13:26:41.639Z"
        },
        {
          "article_id": "681224058cb26ccf73a1b4ec",
          "title": "test article",
          "author": {
            "username": "111@11.com",
            "image": ""
          },
          "likes": 0,
          "createdAt": "2025-04-30T13:22:13.667Z"
        }
      ]
    }
  }
  
  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }
*/
app.post('/browse_article', (async (req: express.Request<{}, {}, BrowseArticleBody>, res: express.Response<BrowseArticlesResponse | { error: string }>) => {
  // TODO: fix, no token and use get method instead of post method
  // const token = req.header('Authentication');
  let { sort_by, start, limit, category } = req.body;
  // if (!token) {
  //   res.status(400).json({ error: 'Missing token' });
  //   return;
  // }
  if (sort_by !== 'time' && sort_by !== 'likes') {
    sort_by = 'time';
  }
  try {
    // const loginInfo = await findLoginInfoByToken(token);
    // if (!loginInfo) throw new Error('Invalid token');

    const articles = await getBrowseArticle(sort_by, start, limit, category);

    const response: BrowseArticlesResponse = {
      success: true,
      data: {
        articles: articles.map(article => ({
          article_id: article._id.toString(),
          title: article.title,
          author: {
            username: (article.author as any).username,
            //todo:real image url
            image: `http://localhost:3000/uploads/${Math.floor(Math.random() * 8) + 1}.jpg`,
          },
          likes: article.likes,
          createdAt: article.createdAt.toISOString(),
          image: article.image ||
            `http://localhost:3000/uploads/${Math.floor(Math.random() * 8) + 1}.jpg`,
        })),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}) as RequestHandler);

/*
  POST method
  request with /article_detail
  header:
  Authentication: <token>
  body:
  {
    "article_id": "6812251120cbc77f8a604be3"
  }

  if success, return with 200 status code and a json message:
  {
  "success": true,
  "data": {
    "article": {
      "article_id": "6812251120cbc77f8a604be3",
      "title": "test article",
      "author": {
        "username": "111@11.com",
        "image": ""
      },
      "likes": 0,
      "createdAt": "2025-04-30T13:26:41.639Z"
    },
    "liked": false,
    "collected": false,
    "comments": [
      {
        "_id": "681538fd0f1184e1ecade1e1",
        "content": "111",
        "author": {
          "username": "111@11.com",
          "image": ""
        },
        "createdAt": "2025-05-02T21:28:29.768Z",
        "isMine": true,
        "replies": []
      }
    ]
  }
}

  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }

  if article id is not matched with any articles, return with 401 status code and a json message:
  {
    "error": "Post not found"
  }
*/
app.post('/article_detail', (async (req: express.Request<{}, {}, ArticleDetailBody>, res: express.Response<ArticleDetailResponse | { error: string }>) => {
  const token = req.header('Authentication');
  const { article_id } = req.body;
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');
    const user = await findUserByUsername(loginInfo.username);
    if (!user) throw new Error('Cannot find user information');

    const article = await getPostDetail(article_id, user._id.toString());
    if (!article) throw new Error('Article not exist');

    const response: ArticleDetailResponse = {
      success: true,
      data: {
        article: {
          article_id: article._id.toString(),
          title: article.title,
          author: {
            username: (article.author as any).username,
            image: (article.author as any).image,
          },
          likes: article.likes,
          createdAt: article.createdAt.toISOString(),
          image: article.image ||
          `http://localhost:3000/upload/${Math.floor(Math.random() * 8) + 1}.jpg`,
        },
        liked: article.liked,
        collected: article.collected,
        comments: article.comments,
      },
    };

    res.status(201).json(response);
  }
  catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}) as RequestHandler);


/*
  GET method
  request with /get_user_articles
  header:
  Authentication: <token>

  if success, return with 200 status code and a json message:
  {
    "success": true,
    "data": {
      "articles": [
        {
          "article_id": "6812251120cbc77f8a604be3",
          "title": "test article",
          "createdAt": "2025-04-30T13:26:41.639Z"
        },
        {
          "article_id": "681224058cb26ccf73a1b4ec",
          "title": "test article",
          "createdAt": "2025-04-30T13:22:13.667Z"
        }
      ]
    }
  }

  if the article is empty, return with 200 status code and a json message:
  {
    "success": true,
    "data": {
      "articles": []
    }
  }

  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }
*/
app.get('/get_user_articles', (async (req: express.Request<{}, {}, {}>, res: express.Response<getUsersArticlesResponse>) => {
  const token = req.header('Authentication');
  if (!token) {
    res.status(400).json({ success: false, error: 'Missing token' });
    return;
  }

  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const user = await findUserByUsername(loginInfo.username);
    if (!user) throw new Error('Cannot find user information');

    const articles = await getUserArticles(user._id.toString());

    const response: getUsersArticlesResponse = {
      success: true,
      data: {
        articles: articles.map(article => ({
          article_id: article._id.toString(),
          title: article.title,
          createdAt: article.createdAt.toISOString(),
        })),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({ success: false, error: (error as Error).message });
  }
}) as RequestHandler);


/*
  POST method
  request with /like_article
  header:
  Authentication: <token>
  body:
  {
    "article_id": "6812251120cbc77f8a604be3"
  }

  if success, return with 201 status code and a json message:
  {
    "success": true,
    "data": {
      "message": "successfully liked the article"
    }
  }

  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }

  if article id is not matched with any articles, return with 401 status code and a json message:
  {
    "error": "Article not found"
  }
*/
app.post('/like_article', (async (req: express.Request<{}, {}, LikeArticleBody>, res: express.Response<LikeArticleResponse | { error: string }>) => {
  const token = req.header('Authentication');
  let { article_id } = req.body;
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  if (!article_id) {
    res.status(400).json({ error: 'Missing article id' });
    return;
  }
  if (!(await articleExists(article_id))) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const user = await findUserByUsername(loginInfo.username);
    if (!user) throw new Error('User not found');

    const alternation_for_user = await likeArticleForUser(user._id.toString(), article_id);

    const afternation_for_article = await likeArticle(article_id);

    const response: LikeArticleResponse = {
      success: true,
      data: {
        message: "successfully liked the article",
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}) as RequestHandler);

/*
  POST method
  request with /unlike_article
  header:
  Authentication: <token>
  body:
  {
    "article_id": "6812251120cbc77f8a604be3"
  }

  if success, return with 201 status code and a json message:
  {
    "success": true,
    "data": {
      "message": "successfully unliked the article"
    }
  }

  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  (!untested) if user cannot be found by provided token, return with 401 status code and a json message:
  {
    "error": "User not found"
  }

  if article id is not matched with any articles, return with 401 status code and a json message:
  {
    "error": "Article not found"
  }
*/
app.post('/unlike_article', (async (req: express.Request<{}, {}, UnlikeArticleBody>, res: express.Response<UnlikeArticleResponse | { error: string }>) => {
  const token = req.header('Authentication');
  let { article_id } = req.body;
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  if (!article_id) {
    res.status(400).json({ error: 'Missing article id' });
    return;
  }
  if (!(await articleExists(article_id))) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const user = await findUserByUsername(loginInfo.username);
    if (!user) throw new Error('User not found');

    const alternation_for_user = await unlikeArticleForUser(user._id.toString(), article_id);

    const afternation_for_article = await unlikeArticle(article_id);

    const response: UnlikeArticleResponse = {
      success: true,
      data: {
        message: "successfully unliked the article",
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}) as RequestHandler);


/*
  POST method
  request with /upload_file
  header:
  Authentication: <token>
  body(form format):
    "file": <attached file>

  if success, return with 200 status code and a json message:
  {
    "success": true,
    "data": {
      "file_url": "/upload/1748358637888-.jpg"
    }
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if file is unattached or uploaded with wrong format, return with 400 status code and a json message:
  {
    "error": "Missing file"
  }
*/
app.post('/upload_file', upload.single('file'), (async (req: UploadFileBody, res: express.Response<UploadFileResponse>) => {
  const token = req.header('Authentication');
  if (!token) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, error: 'Missing token' });// if it does not have authentication, then delete the file 
    return;
  }
  const loginInfo = await findLoginInfoByToken(token);
  if (!loginInfo) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, error: 'Invalid token' });
    return;
  }
  if (!req.file) {
    res.status(400).json({ success: false, error: 'Missing file' });
    return;
  }

  res.status(200).json({ success: true, data: { file_url : "/uploads/" + req.file.filename} });
}) as RequestHandler);


/*
  DELETE method
  request with /delete_file
  header:
  Authentication: <token>
  body:
  {
    "file_url": <1.jpg>
  }

  if success, return with 200 status code and a json message:
  {
    "success": true,
    "data": {
      "message": "Successfully deleted the file"
    }
  }

  if token is empty, return with 400 status code and a jaon message:
  {
    "error": "Missing token"
  }

  if token is wrong, return with 401 status code and a json message:
  {
    "error": "Invalid token"
  }

  if file_url is blank, return with 404 status code and a json message:
  {
    "error": "File name is missing"
  }

  if the file does not exist, return with 404 status code and a json message:
  {
    "success": false,
    "error": "File does not exist"
  }
*/
app.delete('/delete_file', (async (req: express.Request<{}, {}, DeleteFileBody>, res: express.Response<DeleteFileRessponse | { error: string }>) => {
  const token = req.header('Authentication');
  let { file_url } = req.body;

  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  const loginInfo = await findLoginInfoByToken(token);
  if (!loginInfo) {
    res.status(400).json({ success: false, error: 'Invalid token' });
    return;
  }
  if (!file_url) {
    res.status(404).json({ success: false, error: 'File name is missing' });
    return;
  }

  const absolutePath = path.resolve(__dirname, '..', 'uploads', file_url);

  try {
    if (!fs.existsSync(absolutePath)) {
      res.status(404).json({ success: false, error: 'File does not exist' });
      return;
    }

    fs.unlinkSync(absolutePath);// if the file is exist

    const response: DeleteFileRessponse = {
      success: true,
      data: {
        message: 'Successfully deleted the file',
      },
    };
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    });
  }
}) as RequestHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
