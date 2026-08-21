const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Inserisci qui la tua chiave segreta reale di Stripe
const stripe = require('stripe')('sk_test_51BTB0sD9Nx771uEpxxxxxxxxxx'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione CORS totale per sbloccare i telefoni
app.use(cors({
  origin: 'https://novelloalessandro194-max.github.io/ai-toro/',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Gestione pre-flight per CORS (mossa di sicurezza)
app.options('*', cors());

// Inizializzazione del client Supabase (lascia i tuoi dati reali qui sotto)
const supabaseUrl = 'https://supabase.co'; 
const supabaseKey = 'sb_publishable_I_zkxxxxxxxxx'; 
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

// ROTTA CHECKOUT STRIPE
app.post('/api/monetizzazione/checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: { name: 'AI ToRØ Premium' },
                    unit_amount: 399,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://github.io{CHECKOUT_SESSION_ID}',
            cancel_url: 'https://github.io',
        });
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});
