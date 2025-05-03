export interface LoginBody {
  username    : string;
  password    : string;
  _id         : string;
  code        : string;
}
  
export interface SignupBody {
  username    : string;
  password    : string;
  _id         : string;
  code        : string;
}

export interface CreateArticleBody {
  title       : string;
  category    : string;
  content     : string;
}

export interface CreateCommentBody {
  article_id  : string;
  content     : string;
}

export interface CreateReplyBody {
  comment_id: string;
  content: string;
}

export interface BrowseArticleBody {
  sort_by?    : 'time' | 'likes';
  start?      : number;
  limit?      : number;
  category?   : string;
}

export interface ArticleDetailBody {
  article_id  : string;
}

export interface SearchUserBody {
  username    : string;
}