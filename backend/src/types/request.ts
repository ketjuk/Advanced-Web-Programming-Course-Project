import type { Request } from 'express';

export interface LoginBody {
  username    : string;
  password    : string;
  _id         : string;
  code        : string;
}
  
export interface ChangeUserImageBody {
  image       : string;
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
  image       : string[];
}

export interface DeleteArticleBody {
  article_id  : string;
}

export interface CreateCommentBody {
  article_id  : string;
  content     : string;
}

export interface DeleteCommentBody {
  comment_id  : string;
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

export interface LikeArticleBody {
  article_id  : string;
}

export interface UnlikeArticleBody {
  article_id  : string;
}

export type UploadFileBody = Request<{}, {}, any> & {
  file        : Express.Multer.File;
};

export interface DeleteFileBody {
  file_url    : string;
}