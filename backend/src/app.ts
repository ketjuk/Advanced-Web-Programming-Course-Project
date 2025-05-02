import express, { RequestHandler } from 'express';
import { LoginBody, SignupBody, CreateArticleBody, CreateCommentBody, BrowseArticleBody, ArticleDetailBody } from './types/request';
import connectDB from './db';
import { loginUser, signupUser, createCode, checkCode, findUserByUsername, findLoginInfoByToken } from './databaseService/userService';
import { createArticle, addComment, getBrowseArticle, getPostDetail } from './databaseService/articleService';
import { CodeResponse, LoginResponse, SignupResponse, CreateArticleResponse, CreateCommentResponse, BrowseArticlesResponse, ArticleDetailResponse } from './types/response';

const app = express();
const port = 3000;
app.use(express.json());
app.use(require('cors')())
//connect to Mongo database
connectDB();


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
app.post('/log_in', (async (req: express.Request<{}, {}, LoginBody>, res: express.Response<LoginResponse>) => {
  const { username, password, _id, code } = req.body;

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'username, password or id should not be blank' });
    return;
  }
  if (!_id || !code) {
    res.status(400).json({ success: false, error: '_id and code should not be blank' });
    return;
  }

  try {
    await checkCode(_id, code);
    const result = await loginUser(username, password); //
    res.status(200).json({ success: true, data: { message: 'login success', ...result } });
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
app.post('/sign_up', (async (req: express.Request<{}, {}, SignupBody>, res: express.Response<SignupResponse>) => {
  const { username, password, _id, code } = req.body;
  if (!username || !password || !_id) {
    res.status(400).json({ success: false, error: 'username and password should not be blank' });
    return;
  }
  if (!_id || !code) {
    res.status(400).json({ success: false, error: '_id and code should not be blank' });
    return;
  }

  try {
    await checkCode(_id, code);
    const result = await signupUser(username, password);
    res.status(200).json({ success: true, data: { message: 'signup success' } });
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
app.get('/request_code', (async (req: express.Request<{}, {}, {}>, res: express.Response<CodeResponse>) => {
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
        article_id : article._id.toString(),
        title: article.title,
        category: article.category?? '',
        content: article.content?? '',
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

  const {article_id, content} = req.body;
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

    const comment = await addComment(article_id, user._id.toString(),content);

    const response: CreateCommentResponse = {
      success: true,
      data: {
        article_id : comment._id.toString(),
        author: user.username,
        content: comment.content?? '',
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
  const token = req.header('Authentication');
  let {sort_by, start, limit, category} = req.body;
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }
  if (sort_by !== 'time' && sort_by !== 'likes') {
    sort_by = 'time';
  }
  try {
    const loginInfo = await findLoginInfoByToken(token);
    if (!loginInfo) throw new Error('Invalid token');

    const articles = await getBrowseArticle(sort_by, start, limit, category);

    const response: BrowseArticlesResponse = {
      success: true,
      data: {
        articles: articles.map(article => ({
          article_id : article._id.toString(),
          title      : article.title,
          author     : {
            username: (article.author as any).username,
            image: (article.author as any).image,
          },
          likes      : article.likes,
          createdAt  : article.createdAt.toISOString(),
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
  const {article_id} = req.body;
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
    if(!article) throw new Error('Article not exist');

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
        },
        liked: article.liked,
        collected: article.collected,
        comments: article.comments,
      },
    };
    
    res.status(200).json(response);
  }
  catch(error) {
    res.status(401).json({ error: (error as Error).message });
  }
}) as RequestHandler);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});