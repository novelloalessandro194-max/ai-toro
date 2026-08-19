const stripe = require('stripe')('sk_test_51U6B2QJ1WKMqawcdDfM3mM3MgNrNbN8baUUKvpswtxO8EC5gyiM9x5pxj2rrNZtBhJwh5FJkjlXr0lh51qekTNYk00pt5HVA5H');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Inizializzazione del client Supabase usando le variabili d'ambiente di Render per sicurezza
const supabaseUrl = 'https://locdwwpthdnxqsssjeug.supabase.co';
const supabaseKey = 'sb_publishable_I_zk2KGDlzSpWlS1VuU8cw_SBkgd0-H';
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint di test per verificare che il server sia online
app.get('/', (req, res) => {
    res.send('AI ToRØ Server online e operativo!');
});

// GESTIONE DELLA CHAT COMMUNITY E BLOCCO DEGLI HATER
app.post('/api/community/invia', async (req, res) => {
    const { utente_id, username, messaggio, is_vip } = req.body;
    
    // Filtro anti-hater hardcore (Filtro Insicurezze)
    const paroleProibite = ['schifo', 'fallito', 'insulto', 'pippa'];
    const contieneInsulto = paroleProibite.some(parola => messaggio.toLowerCase().includes(parola));

    if (contieneInsulto) {
        // Enforce block and route to recovery
        return res.status(400).json({ 
            status: 'blocked', 
            error: 'Messaggio intercettato.',
            coach_msg: 'Qui si costruisce, non si distrugge. Quale insicurezza ti spinge a insultare? Parliamone nella Chat di Recupero.'
        });
    }

    // Se il messaggio è pulito, viene registrato nel database Supabase vero
    const { data, error } = await supabase
        .from('messaggi_community')
        .insert([{ utente_id, username, messaggio, is_vip }]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ status: 'success', data });
});

// Porta dinamica richiesta da Render per l'hosting
const PORT = process.env.PORT || 5000;
app.post('/api/monetizzazione/checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'AI ToRØ Premium [VIP]',
                        description: 'Accesso ai Rank d Elite e Badge Hardcore',
                    },
                    unit_amount: 399, // 3.99€ in centesimi
                    recurring: { interval: 'month' },
                },
                quantity: 1,
            }],
            success_url: 'https://stripe.com',
            cancel_url: 'https://google.com',
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.listen(PORT, () => console.log(`AI ToRØ Server in ascolto sulla porta ${PORT}`));
