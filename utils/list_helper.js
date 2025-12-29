const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  const favorite = blogs.reduce((prev, current) => {
    return prev.likes > current.likes ? prev : current;
  });

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;

  const authorCounts = _.countBy(blogs, "author");
  const topAuthor = _.maxBy(
    _.keys(authorCounts),
    (author) => authorCounts[author]
  );

  return {
    author: topAuthor,
    blogs: authorCounts[topAuthor],
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;

  // Agrupar blogs por autor
  const groupedBlogs = _.groupBy(blogs, "author");

  // Transformar el objeto agrupado en un array de objetos { author, likes }
  const authorsWithLikes = _.map(groupedBlogs, (authorBlogs, authorName) => {
    return {
      author: authorName,
      // Sumamos los likes de todos los blogs de este autor
      likes: _.sumBy(authorBlogs, "likes"),
    };
  });

  // Devolver el que tenga más likes
  return _.maxBy(authorsWithLikes, "likes");
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
