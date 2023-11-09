import React, { useEffect, useState, useCallback } from 'react';

import './App.css';

function ShoppingList() {
  const [userId, setUserId] = useState<string>(null as unknown as string);

  useEffect(() => {
    const userId = /^#!\/userId=(?<userId>[\w\d]+)/.exec(window.location.hash)?.groups?.userId;
    if (userId) {
      setUserId(userId as any); // FIXME:
    }
  }, [setUserId]);

  const [items, setItems] = useState<any>([]);

  const [newItemText, setNewItemText] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const getItems = useCallback(async () => {
    if (userId === null) {
      return;
    }

    const response = await fetch(`http://localhost:3030/api/items?${new URLSearchParams({ userId })}`, {
      method: 'GET',
    });
    const { items } = await response.json();

    setItems(items);
  }, [items, setItems, userId]);

  useEffect(() => {
    getItems();
  }, [userId]);

  const addItem = useCallback(async () => {
    if (newItemText.trim() === '') {
      return;
    }

    try {
      const response = await fetch('http://localhost:3030/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newItemText,
          qty: newItemQty,
          completed: false,
          userId,
        }),
      });

      const addedItem = await response.json();

      setNewItemText('');
      setNewItemQty(1);
      setItems((items: any) => [...items, addedItem]);
    } catch (error) {
      console.error(error);
    }
  }, [items, setItems, userId, newItemText, newItemQty, setNewItemText, setNewItemQty]);
  const updateItem = useCallback(
    async (item: any) => {
      try {
        const response = await fetch('http://localhost:3030/api/items', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: item.id,
            text: item.text,
            qty: item.qty,
            completed: !item.completed,
            userId,
          }),
        });

        const updatedItem = await response.json();

        setItems((items: any) => items.map((curItem: any) => (curItem.id === item.id ? updatedItem : curItem)));
      } catch (error) {
        console.error(error);
      }
    },
    [items, setItems, userId]
  );
  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        const response = await fetch('http://localhost:3030/api/items', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: itemId,
          }),
        });

        await response.json();

        setItems((items: any) => items.filter((item: any) => item.id !== itemId));
      } catch (error) {
        console.error(error);
      }
    },
    [items, setItems, userId]
  );

  if (userId === null) {
    return (
      <p>
        В урле нужно передать userId следующим образом: /#!/userId={'['}:userId{']'}
      </p>
    );
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
        <input type="number" value={newItemQty} onChange={(e) => setNewItemQty(parseInt(e.target.value))} />
        <button onClick={addItem}>Добавить</button>
      </div>
      {items.map((item: any) => (
        <div key={item.id}>
          <input
            type="checkbox"
            checked={item.completed}
            onClick={() => updateItem(item)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
            {item.text}: х{item.qty}{' '}
          </span>
          <button onClick={() => removeItem(item.id)}>Удалить</button>
        </div>
      ))}
    </div>
  );
}

function App() {
  return <ShoppingList />;
}

export default App;
