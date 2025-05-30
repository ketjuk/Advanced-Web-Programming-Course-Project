import mongoose from 'mongoose';
import Article from '../databaseModel/createArticleTable';
import Comment from '../databaseModel/createCommentTable';
import User from '../databaseModel/createUserTable';
import { SortOrder } from 'mongoose';

//examine if the article exist
export const articleExists = async (articleId: string): Promise<boolean> => {
  return await Article.exists({ _id: articleId }) !== null;
};

//create an article
export const createArticle = async (title: string, category: string, image: string[], content: string, authorId: string) => {
  const newPost = new Article({
    title,
    category,
    content,
    image,
    author: authorId,
    likes: 0,
    comments: [],
  });
  await newPost.save();
  return newPost;
};

export const deleteArticleByAuthor = async (userId: string, articleId: string) => {
    const article = await Article.findById(articleId);
    if (!article) throw new Error('Article not found');

    if (!article.author || article.author.toString() !== userId) 
      throw new Error('only author can delete this article');

    await Comment.deleteMany({ article: articleId });

    await Article.findByIdAndDelete(articleId);

    return article.image;
};

//create a comment
export const addComment = async (postId: string, userId: string, content: string) => {
  const post = await Article.findById(postId);
  if (!post) throw new Error('Article not found');

  const newComment = await Comment.create({
    article: postId,
    author: userId,
    content,
  });

  post.comments.push(newComment._id);
  await post.save();

  return newComment;
};

//delete a comment (by _id)
export const deleteCommentById = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');

  if (comment.author.toString() !== userId.toString()) {
    throw new Error('Unauthorized: You are not the author of this comment');
  }

  await Comment.findByIdAndDelete(commentId);

  await Article.findByIdAndUpdate(comment.article, {
    $pull: { comments: commentId }
  });

  return true;
};

//create a second level comment/reply
export const addSecondLevelComment = async (commentId: string, userId: string, content: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');

  const reply = {
    _id: new mongoose.Types.ObjectId(),
    author: userId,
    content,
    createdAt: new Date(),
  };

  comment.replies.push(reply);
  await comment.save();
  return reply;
};

//browse articles
export const getBrowseArticle = async (sortBy: 'time' | 'likes', start: number = 0, limit: number = 30, category?: string) => {
  const sortCondition: { [key: string]: SortOrder } = {};
  sortCondition[sortBy === 'time' ? 'createdAt' : 'likes'] = -1;

  const filter: any = {};
  if (category) {
    filter.category = category;
  }

  return await Article.find({})
    .select('_id title author image createdAt likes')//usually return _id as default, but needs to write it out when using select
    .sort(sortCondition)
    .skip(start)
    .limit(limit)
    .populate('author', 'username image');//username and user image
};

//get a specific article
export const getPostDetail = async (postId: string, currentUserId: string) => {
  const objectId = new mongoose.Types.ObjectId(postId);

  const post = await Article.findById(objectId)
  .select('title content image author likes createdAt comments')
    .populate('author', 'username image')
    .populate({
      path: 'comments',
      populate: [
        {
          path: 'author',
          select: 'username image',
        },
        {
          path: 'replies.author',
          select: 'username image',
        },
      ]
    });

  if (!post) throw new Error('Post not found');

  const user = await User.findById(currentUserId);
  const liked = user?.likedArticles?.some(id => id.toString() === postId) ?? false;
  const collected = user?.savedArticles?.some(id => id.toString() === postId) ?? false;

  const commentsWithOwnership = post.comments.map((comment: any) => {
    const isMine = (comment.author as any)._id.toString() === currentUserId;
  
    const replies = comment.replies.map((reply: any) => ({
      _id: reply._id.toString(),
      content: reply.content,
      author: {
        username: (reply.author as any).username,
        image: (reply.author as any).image,
      },
      createdAt: reply.createdAt,
      isMine: (reply.author as any)._id.toString() === currentUserId,
    }));
  
    return {
      _id: comment._id.toString(),
      content: comment.content,
      author: {
        username: (comment.author as any).username,
        image: (comment.author as any).image,
      },
      createdAt: comment.createdAt,
      isMine,
      replies,
    };
  });

  return {
    ...post.toObject(),
    liked,
    collected,
    comments: commentsWithOwnership,
  };
};

//specifically for getting all the articles from like/save list from an user
export async function getArticlesByUser(ids: string[]) {
  const articles = await Article.find({ _id: { $in: ids } })
    .select('title createdAt')
    .lean();

  return articles.map(article => ({
    article_id: article._id.toString(),
    title     : article.title,
    createdAt : new Date(article.createdAt).toISOString()
  }));
}

export const getUserArticles = async (userId: string) => {
  return await Article.find({ author: userId })
    .select('_id title createdAt likes content category image')
    .sort({ createdAt: -1 }); // time reverse
};


//specifically for getting all the comments from an user
export async function getUserComments(userId: string) {
  const comments = await Comment.find({ author: userId })
    .select('content createdAt article')
    .lean();

  return comments.map(comment => ({
    comment_id : comment._id.toString(),
    article_id : comment.article.toString(),
    content    : comment.content || '',
    createdAt  : new Date(comment.createdAt).toISOString()
  }));
}
  
//add like (+1) to the article
export const likeArticle = async (article_id: string) => {
  const updatedArticle = await Article.findByIdAndUpdate(
    article_id,
    { $inc: { likes: 1 } },
    { new: true }
  );
};

//decrease like (-1) to the article
export const unlikeArticle = async (article_id: string) => {
  const article = await Article.findById(article_id);
  if (!article) {
    throw new Error('Article not found');
  }

  const newLikes = Math.max(0, article.likes - 1);//prevent to be nagetive number of likes
  article.likes = newLikes;

  await article.save();
  return article.likes;
};