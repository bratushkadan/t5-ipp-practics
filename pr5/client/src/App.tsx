import axios from 'axios';
import { useEffect, useState } from 'react';

import './App.css'

interface Contact {
  _id: string
  username: string
  email: string
  mobile: string
  home: string
}

const defaultNewContact: Omit<Contact, '_id'> = {
  username: '',
  email: '',
  mobile: '',
  home: '',
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState(defaultNewContact);

  // Получение всех контактов
  const fetchContacts = async () => {
    try {
      const response = await axios.get('/ipp-pr5/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {

    fetchContacts();
  }, []);

  const handleInputChange = (e: any) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const handleAddContact = async () => {
    try {
      const response = await axios.post('/ipp-pr5/api/contacts', newContact);
      setContacts(contacts => [...contacts, response.data])
      setNewContact(defaultNewContact);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await axios.delete(`/ipp-pr5/api/contacts/${id}`);
      await fetchContacts();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Contacts</h1>
      <ul>
        {contacts.map((contact) => (
          <li key={contact._id}>
            <div>
              <strong>Username:</strong> {contact.username}
            </div>
            <div>
              <strong>Email:</strong> {contact.email}
            </div>
            <div>
              <strong>Mobile:</strong> {contact.mobile}
            </div>
            <div>
              <strong>Home:</strong> {contact.home}
            </div>
            <button onClick={() => handleDeleteContact(contact._id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2>Add Contact</h2>
      <div>
        <label>Username:</label>
        <input type="text" name="username" value={newContact.username} onChange={handleInputChange} />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={newContact.email} onChange={handleInputChange} />
      </div>
      <div>
        <label>Mobile:</label>
        <input type="text" name="mobile" value={newContact.mobile} onChange={handleInputChange} />
      </div>
      <div>
        <label>Home:</label>
        <input type="text" name="home" value={newContact.home} onChange={handleInputChange} />
      </div>
      <button onClick={handleAddContact}>Add</button>
    </div>
  );
};

function App() {
  return (
    <>
      <Contacts/>
    </>
  )
}

export default App
