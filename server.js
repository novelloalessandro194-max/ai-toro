const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Inserisci qui la tua chiave segreta reale di Stripe
const stripe = require('stripe')('sk_test_51U6B2QJ1WKMqawcdDfM3mM3MgNrNbN8baUUKvpswtxO8EC5gyiM9x5pxj2rrNZtBhJwh5FJkjlXr0lh51qekTNYk00pt5HVA5H'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione CORS totale per sbloccare i telefoni
app.use(cors({
  origin:'https://novelloalessandro194-max.github.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Gestione pre-flight per CORS (mossa di sicurezza)
app.options('*', cors());

// Inizializzazione del client Supabase (lascia i tuoi dati reali qui sotto)
const supabaseUrl = 'https://supabase.co'; 
const supabaseKey = 'sb_secret_PZ6VTGClcm1a-t91S1pMXg_mj7HbFqU'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// Rotta principale per il controllo di connessione dell'app
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('OK');
});

// GESTIONE DELLA CHAT COMMUNITY
app.post('/api/community/invia', async (req, res) => {
    const { utente_id, username, messaggio, is_vip } = req.body;
    const paroleProibite = ['schifo', 'fallito'];
    const contieneInsulto = paroleProibite.some(parola => messaggio.toLowerCase().includes(parola));

    if (contieneInsulto) {
        return res.status(400).json({
            status: 'blocked',
            error: 'Messaggio intercettato dal sistema.',
            coach_msg: 'Qui si costruisce, non si distrugge.'
        });
    }

    try {
        const { data, error } = await supabase
            .from('messaggi_chat')
            .insert([{ utente_id, username, messaggio, is_vip }]);
        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ROTTA PER CREARE LA SESSIONE DI ABBONAMENTO STRIPE
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: 'price_1U7B1OJ1WKMqawcdP0vAcYgD',
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: 'https://github.io',
            cancel_url: 'https://github.io',
        });

        res.json({ id: session.id, url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});
