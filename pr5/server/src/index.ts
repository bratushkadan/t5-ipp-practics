import cors from 'cors'
import express, { Request, Response } from 'express';
import mongoose, { Document } from 'mongoose';

const MONGO_HOST = process.env.MONGO_HOST || 'localhost'

interface IContact extends Document {
  username: string;
  email: string;
  mobile: string;
  home: string;
}

const contactSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  home: { type: String, required: true },
});

const Contact = mongoose.model<IContact>('Contact', contactSchema);

const app = express();
app.use(cors())
app.use(express.json());

app.get('/api/contacts', async (_req: Request, res: Response) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/contacts', async (req: Request, res: Response) => {
  const { username, email, mobile, home } = req.body;
  try {
    const contact = await Contact.create({ username, email, mobile, home });
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/contacts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/contacts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, mobile, home } = req.body;
  try {
    const contact = await Contact.findByIdAndUpdate(id, { username, email, mobile, home }, { new: true });
    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }
    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/contacts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

mongoose.connect(`mongodb://${MONGO_HOST}:27017`, {
  user: 'admin',
  pass: 'password',
})
  .then(() => {
    app.listen(8080, () => {
      console.log('Server started on http://localhost:8080');
    });
  })
  .catch((error) => console.error(error));