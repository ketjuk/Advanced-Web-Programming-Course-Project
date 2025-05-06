export type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface SignupRes {
  message: string;
}

export interface LoginRes {
  message: string;
  username: string;
  token: string;
}

export interface CodeRes {
  _id: string;
  code: string;
}

export type SignupResponse = APIResponse<SignupRes>;
export type LoginResponse = APIResponse<LoginRes>;
export type CodeResponse = APIResponse<CodeRes>;
