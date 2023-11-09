import path from 'node:path';

import grpc from '@grpc/grpc-js';
import loader from '@grpc/proto-loader';
import mongoose from 'mongoose';

const shoppingListPackageDefinition = loader.loadSync(path.resolve('..', 'proto', 'shopping-list.proto'));

const shoppingList = grpc.loadPackageDefinition(shoppingListPackageDefinition).shoppinglist;

mongoose
  .connect('mongodb://localhost:27017', {
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

function main() {
  const server = new grpc.Server();

  server.addService(shoppingList.ShoppingList.service, {
    addItem,
    updateItem,
    deleteItem,
    getItemsByUserId,
  });

  server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Ошибка при привязке сервера:', err);
      return;
    }
    server.start();
    console.log(`Сервер запущен на порту ${port}`);
  });
}

async function addItem(call, callback) {
  const item = new Item(call.request);

  try {
    const savedItem = await item.save();
    console.log('added item', changeMongooseId(savedItem));
    callback(null, changeMongooseId(savedItem));
  } catch (error) {
    console.error(error);
    callback(error);
  }
}

async function updateItem(call, callback) {
  try {
    const { id: _id, ...props } = call.request;
    const item = new Item({ _id, ...props });

    const updatedItem = await Item.findOneAndUpdate({ _id: item.id }, item, { new: true }).lean().exec();

    console.log('updatedItem', updatedItem);

    callback(null, changeMongooseId(updatedItem));
  } catch (error) {
    console.error(error);
    callback(error);
  }
}

async function deleteItem(call, callback) {
  try {
    const deletedItem = await Item.findByIdAndDelete(call.request.id).lean().exec();

    if (!deletedItem) {
      return callback(new Error('not found'));
    }

    console.log('deleted item', deleteItem);

    callback(null, changeMongooseId(deletedItem));
  } catch (error) {
    console.error(error);
    callback(error);
  }
}

async function getItemsByUserId(call, callback) {
  const userId = call.request.userId;

  try {
    const items = await Item.find({ userId }).lean().exec();

    console.log('items of user', userId, items);

    callback(null, { items: items.map(({ _id: id, ...rest }) => ({ ...rest, id })) });
  } catch (error) {
    console.error(error);
    callback(error);
  }
}

function changeMongooseId(model: any) {
  const { _id: id, ...rest } = model.toJSON ? model.toJSON() : model;
  return { ...rest, id, };
}

main();
