import path from 'node:path';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import grpc from '@grpc/grpc-js';
import loader from '@grpc/proto-loader';

const shoppingListPackageDefinition = loader.loadSync(path.resolve('..', 'proto', 'shopping-list.proto'));

const ShoppingListService = grpc.loadPackageDefinition(shoppingListPackageDefinition).shoppinglist.ShoppingList;

const client = new ShoppingListService('localhost:50051', grpc.credentials.createInsecure());

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/api/items', (req, res) => {
  if (!req.query.userId) {
    return res.status(400).end();
  }
  client.getItemsByUserId({ userId: req.query.userId }, (error, { items = [] }) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.details });
    }

    res.status(200).json({ items });
  });
});
app.post('/api/items', (req, res) => {
  client.addItem(
    {
      userId: req.body.userId,
      qty: req.body.qty,
      text: req.body.text,
      completed: req.body.completed,
    },
    (error, item) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.details });
      }

      res.status(200).json(item);
    }
  );
});
app.patch('/api/items', (req, res) => {
  client.updateItem(
    {
      id: req.body.id,
      userId: req.body.userId,
      qty: req.body.qty,
      text: req.body.text,
      completed: req.body.completed,
    },
    (error, item) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.details });
      }

      res.status(200).json(item);
    }
  );
});
app.delete('/api/items', (req, res) => {
  client.deleteItem(
    {
      id: req.body.id,
    },
    (error, item) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.details });
      }

      res.status(200).json(item);
    }
  );
});

app.listen(3030, () => {
  console.log('listening on http://localhost:3030/');
});
