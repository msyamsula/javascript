const ObjectId = require("mongodb").ObjectID;
const postsCollection = require("../db").db.collection("posts");
const sanitizeHTML = require("sanitize-html");

let Post = function (data) {
  this.data = data;
  this.errors = [];
};

Post.prototype.validate = function () {
  if (!this.data.title) {
    this.errors.push("Title is empty");
  }

  if (!this.data.body) {
    this.errors.push("Body is empty");
  }

  if (typeof this.data.title != "string") {
    this.errors.push("Title must be string");
  }

  if (typeof this.data.body != "string") {
    this.errors.push("Body must be string");
  }
};

Post.prototype.cleanUp = function () {
  let wib = new Date();
  wib.setHours(wib.getHours() + 7);
  this.data = {
    title: this.data.title.trim(),
    body: sanitizeHTML(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    created_at: wib,
    author: ObjectId(this.data.author),
  };
};

Post.prototype.makePost = function () {
  return new Promise(async (resolve, reject) => {
    this.validate();
    this.cleanUp();
    if (this.errors.length > 0) {
      reject(this.errors);
    }

    try {
      await postsCollection.insertOne(this.data);
      resolve("Post created");
    } catch (err) {
      reject("Connection error");
    }
  });
};

Post.prototype.findById = function (id) {
  return new Promise(async (resolve, reject) => {
    if (typeof id != "string" || !ObjectId.isValid(id)) {
      reject("id must be string and valid");
    }
    try {
      let post = await postsCollection
        .aggregate([
          { $match: { _id: ObjectId(id) } },
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "additional",
            },
          },
        ])
        .toArray();
      let ans = post[0];
      ans.username = ans.additional[0].username;
      ans.authorId = ans.additional[0]._id;
      ans.avatar = ans.additional[0].avatar;
      ans.additional = undefined;
      if (!post) {
        reject("404 not found");
      }
      resolve(ans);
    } catch (err) {
      reject("404 not found");
    }
  });
};

Post.prototype.findByAuthor = function (authorId) {
  return new Promise(async (resolve, reject) => {
    try {
      let posts = await postsCollection.aggregate([
        { $match: { author: ObjectId(authorId) } },
        { $sort: { created_at: -1 } },
      ]);
      resolve(posts.toArray());
    } catch (err) {
      reject("connection error");
    }
  });
};

Post.prototype.updateById = function (id, data) {
  return new Promise(async (resolve, reject) => {
    try {
      let newData = {
        _id: ObjectId(id),
        title: data.title,
        body: data.body,
        created_at: new Date(),
        author: ObjectId(data.authorId),
      };
      let filter = {
        _id: ObjectId(id),
      };
      // console.log("filer", filter);
      await postsCollection.replaceOne(filter, newData);
      resolve();
    } catch (err) {
      reject();
    }
  });
};

Post.prototype.deleteById = function (id) {
  return new Promise(async (resolve, reject) => {
    const query = { _id: ObjectId(id) };
    try {
      await postsCollection.deleteOne(query, { justOne: true });
      resolve("Success deleting post");
    } catch (err) {
      reject("Connection error");
    }
  });
};

Post.prototype.searchText = function (text) {
  return new Promise(async (resolve, reject) => {
    if (typeof text != "string") reject();
    try {
      console.log("object: ", text);
      // search by text is broken
      let result1 = await postsCollection
        .aggregate([{ $match: { body: text } }])
        .toArray();

      let result2 = await postsCollection
        .aggregate([{ $match: { title: text } }])
        .toArray();

      let result = result1;
      for (let i = 0; i < result2.length; i++) {
        result.push(result2[i]);
      }

      console.log("result from object: ", result);
      resolve(result);
    } catch (err) {
      reject("error");
    }
  });
};

module.exports = Post;
