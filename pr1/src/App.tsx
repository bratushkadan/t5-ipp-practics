import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import './App.css';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

const UserCard = styled.div`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
`;

const UserComponent: React.FC<{ user: User; deleteUser: (userId: number) => void }> = ({ user, deleteUser }) => {
  const handleDeleteUser = useCallback(() => {
    const shouldDelete = confirm(`Удалить пользователя ${user.name}?`)

    if (!shouldDelete) {
      return
    }

    fetch('https://jsonplaceholder.typicode.com/users/' + user.id, {
      method: 'DELETE',
    }).then((response) => {
      if (response.status < 400) {
        deleteUser(user.id)
        setTimeout(() => alert(`Пользователь ${user.name} удален`))
      } else {
        alert('произошла ошибка: ' + response.text)
      }
    });
  }, [user.id]);

  return (
    <UserCard onClick={handleDeleteUser}>
      <h2>{user.name}</h2>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Phone:</strong> {user.phone}
      </p>
      <p>
        <strong>Website:</strong> {user.website}
      </p>

      <h3>Address</h3>
      <p>
        <strong>Street:</strong> {user.address.street}
      </p>
      <p>
        <strong>Suite:</strong> {user.address.suite}
      </p>
      <p>
        <strong>City:</strong> {user.address.city}
      </p>
      <p>
        <strong>Zipcode:</strong> {user.address.zipcode}
      </p>
      <p>
        <strong>Latitude:</strong> {user.address.geo.lat}
      </p>
      <p>
        <strong>Longitude:</strong> {user.address.geo.lng}
      </p>

      <h3>Company</h3>
      <p>
        <strong>Name:</strong> {user.company.name}
      </p>
      <p>
        <strong>Catch Phrase:</strong> {user.company.catchPhrase}
      </p>
      <p>
        <strong>Business:</strong> {user.company.bs}
      </p>
    </UserCard>
  );
};

const UsersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
`;

function App() {
  const [users, setUsers] = useState<User[]>([]);

  const deleteUser = useCallback(
    (userId: number) => {
      setUsers((users) => users.filter((user) => user.id !== userId));
    },
    [setUsers]
  );

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.json())
      .then(setUsers);
  }, []);

  return (
    <>
      <UsersContainer>
        {users.map((user) => (
          <UserComponent key={user.id} deleteUser={deleteUser} user={user} />
        ))}
      </UsersContainer>
    </>
  );
}

export default App;
