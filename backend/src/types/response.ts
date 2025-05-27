
export type APIResponse<T> = {
  success         : boolean;
  data?           : T;
  error?          : string;
};

export interface SignupRes {
  message         : string;
}

export interface LoginRes {
  message         : string;
  username        : string;
  token           : string;
}

export interface CodeRes {
  _id             : string;
  code            : string;
}

export interface CreateArticleRes {
  article_id      : string;
  title           : string;
  category?       : string;
  content?        : string;
  author          : string;
  likes           : number;
  comments        : never[];
}

export interface CreateCommentRes {
  article_id      : string,
  author          : string,
  content         : string,
  replies         : never[]
}

export interface DeleteCommentRes {
  message         : string;
}

export interface BrowseArticleRes {//single article
  article_id      : string;
  title           : string;
  author          : {
    username      : string;
    image         : string;
  };
  likes           : number;
  createdAt       : string;
  image         : string;
}

export interface BrowseArticlesRes {//return several articles browsing
  articles        : BrowseArticleRes[];
}

export interface getUsersArticlesRes {//return the articles published by specific author
  articles: {
    article_id: string;
    title: string;
    createdAt: string;
  }[];
}

export interface CommentReplyRes {//second level comment
  _id             : string;
  content         : string;
  author          : {
    username      : string;
    image         : string;
  };
  createdAt       : string;
  isMine          : boolean;
}

export interface BrowseCommentRes {//first level comment
  _id             : string;
  content         : string;
  author          : {
    username      : string;
    image         : string;
  };
  createdAt       : string;
  isMine          : boolean;
  replies         : CommentReplyRes[];
}

export interface ArticleDetailRes {//return signle detailed article
  article         : BrowseArticleRes;
  liked           : boolean;
  collected       : boolean;
  comments        : BrowseCommentRes[];
}

export interface SearchUserRes {
  username        : string;
  image?          : string;

  writtenComments : {
    comment_id    : string;
    article_id    : string;
    content       : string;
    createdAt     : string;
  }[];

  likedArticles   : {
    article_id    : string;
    title         : string;
    createdAt     : string;
  }[];

  savedArticles   : {
    article_id    : string;
    title         : string;
    createdAt     : string;
  }[];

  following       : {
    username      : string;
    image?        : string;
  }[];
}

export interface LikeArticleRes {
  message         : string;
}

export interface UnlikeArticleRes {
  message         : string;
}

export interface UploadFileRes {
  file_url        : string;
}

export interface DeleteFileRes {
  message         : string;
}


export type SignupResponse              = APIResponse<SignupRes>;
export type LoginResponse               = APIResponse<LoginRes>;
export type CodeResponse                = APIResponse<CodeRes>;
export type CreateArticleResponse       = APIResponse<CreateArticleRes>;
export type CreateCommentResponse       = APIResponse<CreateCommentRes>;
export type DeleteCommentResponse       = APIResponse<DeleteCommentRes>;
export type CommentReplyResponse        = APIResponse<CommentReplyRes>;
export type BrowseArticlesResponse      = APIResponse<BrowseArticlesRes>;
export type ArticleDetailResponse       = APIResponse<ArticleDetailRes>;
export type getUsersArticlesResponse    = APIResponse<getUsersArticlesRes>;
export type SearchUserResponse          = APIResponse<SearchUserRes>;
export type LikeArticleResponse         = APIResponse<LikeArticleRes>;
export type UnlikeArticleResponse       = APIResponse<UnlikeArticleRes>;
export type UploadFileResponse          = APIResponse<UploadFileRes>;
export type DeleteFileRessponse          = APIResponse<DeleteFileRes>;