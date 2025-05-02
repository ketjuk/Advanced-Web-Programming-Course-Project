import mongoose from 'mongoose';
import Article from '../databaseModel/createArticleTable';
import Comment from '../databaseModel/createCommentTable';
import User from '../databaseModel/createUserTable';
import { SortOrder } from 'mongoose';

export const createArticle = async (title: string, category: string, content: string, authorId: string) => {
  const newPost = new Article({
    title,
    category,
    content,
    author: authorId,
    likes: 0,
    comments: [],
  });
  await newPost.save();
  return newPost;
};


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

export const addSecondLevelComment = async (commentId: string, userId: string, content: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');

  const reply = {
    author: userId,
    content,
    createdAt: new Date(),
  };

  comment.replies.push(reply);
  await comment.save();
  return reply;
};

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


export const getPostDetail = async (postId: string, currentUserId: string) => {
  const objectId = new mongoose.Types.ObjectId(postId);

  const post = await Article.findById(objectId)
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



  
  