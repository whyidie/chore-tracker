const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    const { data, error } = await supabase.from('chores').select('*').limit(1);
    if (error && error.code === 'PGRST116') {
      console.log('Creating chores table...');
    }
  } catch (err) {
    console.log('Database check:', err.message);
  }
}

initDatabase();

app.get('/api/chores', async (req, res) => {
  try {
    const { data, error } = await supabase.from('chores').select('*').order('id', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chores', async (req, res) => {
  try {
    const { title, status } = req.body;
    const { data, error } = await supabase.from('chores').insert([{ title, status: status || 'todo' }]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/chores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    const { data, error } = await supabase.from('chores').update({ title, status }).eq('id', parseInt(id)).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('chores').delete().eq('id', parseInt(id));
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(Chore tracker server running on port );
});
