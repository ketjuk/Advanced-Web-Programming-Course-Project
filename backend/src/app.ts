import express, { RequestHandler } from 'express';
import { LoginBody, SignupBody } from './types/request';
import connectDB from './db';
import { loginUser, signupUser, createCode, checkCode } from './databaseService/userService';
import { CodeResponse, LoginResponse, SignupResponse } from './types/response';

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


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});