import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, InMemoryCache, ApolloClient, ApolloProvider } from '@apollo/client';
import { gql } from 'graphql-tag';

import './App.css'

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
});

const GET_SHOPPING_LIST = gql`
  query GetShoppingList($userId: ID!) {
    shoppingList(userId: $userId) {
      id
      text
      qty
      completed
    }
  }
`;

const ADD_ITEM = gql`
  mutation AddItem($text: String!, $qty: Int!, $completed: Boolean!, $userId: ID!) {
    addItem(text: $text, qty: $qty, completed: $completed, userId: $userId) {
      text
      qty
      completed
      userId
    }
  }
`;

const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $text: String, $qty: Int, $completed: Boolean, $userId: ID!) {
    updateItem(id: $id, text: $text, qty: $qty, completed: $completed, userId: $userId) {
      id
      text
      qty
      completed
      userId
    }
  }
`;

const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!, $userId: ID!) {
    deleteItem(id: $id, userId: $userId)
  }
`;

function ShoppingList() {

  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const userId = /^#!\/userId=(?<userId>[\w\d]+)/.exec(window.location.hash)?.groups?.userId
    if (userId) {
      setUserId(userId)
    }
  }, [])


  const { loading, error, data, refetch: refreshShoppingListPositions } = useQuery(GET_SHOPPING_LIST, {
    variables: {
      userId,
    }
  });
  const [addItem] = useMutation(ADD_ITEM, {
    variables: {
      userId,
    }
  });
  const [updateItem] = useMutation(UPDATE_ITEM, {
    variables: {
      userId,
    }
  });
  const [deleteItem] = useMutation(DELETE_ITEM, {
    variables: {
      userId,
    }
  });

  const [newItemText, setNewItemText] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const handleAddItem = async () => {
    if (newItemText.trim() === '') {
      return;
    }
    
    try {
      await addItem({
        variables: {
          text: newItemText,
          qty: newItemQty,
          completed: false,
          userId,
        },
      });
      setNewItemText('');
      setNewItemQty(1);
      await refreshShoppingListPositions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteItem = async (id, completed) => {
    try {
      await updateItem({
        variables: {
          id,
          completed: !completed,
          userId,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem({
        variables: {
          id,
          userId,
        },
      });
      await refreshShoppingListPositions();
    } catch (error) {
      console.error(error);
    }
  };

  if (userId === null) {
    return <p>В урле нужно передать userId следующим образом: /#!/userId={'['}:userId{']'}</p>
  }

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>Ошибка: {error.message}</p>;
  }

  return (
    <div>
      <h1>Список покупок userId {userId}</h1>
      <div>
        <input
          type="text"
          value={newItemText}
          placeholder="Имя продукта"
          onChange={(e) => setNewItemText(e.target.value)}
        />
        <input
          type="number"
          value={newItemQty}
          onChange={(e) => setNewItemQty(parseInt(e.target.value))}
        />
        <button onClick={handleAddItem}>Добавить</button>
      </div>
        {data.shoppingList.map((item) => (
          <div key={item.id}>
            <input
              type="checkbox"
              checked={item.completed}
              onClick={() => handleCompleteItem(item.id, item.completed)}
              style={{cursor: 'pointer'}}
            />
            <span
              style={{ textDecoration: item.completed ? 'line-through' : 'none' }}
            >
              {item.text}: х{item.qty}
              {' '}
            </span>
            <button onClick={() => handleDeleteItem(item.id)}>Удалить</button>
          </div>
        ))}
    </div>
  );
}



function App() {
  return (
    <ApolloProvider client={client}>
      <ShoppingList />
    </ApolloProvider>
  )
}

export default App
