 type APIResponse<T> = T | { error: string };

 interface LoginRes {
  message   : string;
  success  : boolean;
}


export type LoginResponse = APIResponse<LoginRes>;