const fs = require('node:fs')
const path = require('node:path')

const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose')

const gqlSchema = fs.readFileSync(path.join(__dirname, '..', 'gql-schemas', 'schema.graphqls'))

const typeDefs = gql`${gqlSchema}`;

mongoose.connect('mongodb://localhost:27017', {
  user: 'admin',
  pass: 'password',
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connecting to MongoDB:', error));

const itemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  qty: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true },
});

const Item = mongoose.model('Item', itemSchema);

const resolvers = {
  Query: {
    shoppingList: async (_, {userId}) => {
      try {
        const items = await Item.find({userId});
        return items;
      } catch (error) {
        console.error(error)
        throw new Error('Ошибка при получении списка покупок.');
      }
    },
  },
  Mutation: {
    addItem: async (_, { text, qty, completed, userId }) => {
      try {
        const newItem = await Item.create({
          text,
          qty,
          completed,
          userId,
        });
        return newItem;
      } catch (error) {
        console.error(error)
        throw new Error('Ошибка при добавлении элемента в список покупок.');
      }
    },
    updateItem: async (_, { id, text, qty, completed, userId }) => {
      try {
        const updatedItem = await Item.findByIdAndUpdate(id, {
          text,
          qty,
          completed,
          userId
        }, { new: true });

        return updatedItem;
      } catch (error) {
        console.error(error)
        throw new Error('Ошибка при обновлении элемента списка покупок.');
      }
    },
    deleteItem: async (_, { id }) => {
      try {
        await Item.findByIdAndDelete(id);
        return id;
      } catch (error) {
        console.error(error)
        throw new Error('Ошибка при удалении элемента из списка покупок.');
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});