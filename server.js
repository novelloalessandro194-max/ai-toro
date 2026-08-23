const express = require('express');
const cors = require('cors');
// Configurazione di Stripe con la chiave segreta da Render
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Configurazione di Supabase con le chiavi che hai appena salvato
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Abilita i CORS per parlare con GitHub Pages senza blocchi di sicurezza
app.use(cors());
app.use(express.json());

// Inizializzazione del client Supabase tramite le variabili d'ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rotta di test iniziale per verificare che il server sia attivo
app.get('/', (req, res) => {
    res.send({ 
        status: "online", 
        system: "AI ToRØ Core Backend ready.",
        database: supabaseUrl ? "connected" : "missing_url"
    });
});

// Endpoint per creare la sessione di pagamento Stripe Checkout
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                // Prende l'ID del prezzo ricorrente salvato su Render (price_...)
                price: process.env.STRIPE_PRICE_ID, 
                quantity: 1,
            }],
            mode: 'subscription', // Imposta la modalità abbonamento ricorrente
            success_url: 'https://github.io',
            cancel_url: 'https://github.io',
        });
        
        res.json({ id: session.id });
    } catch (error) {
        console.error("Errore Stripe Checkout:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Rotta d'esempio se in futuro vorrai salvare i dati del quiz su Supabase
app.post('/save-profile', async (req, res) => {
    const { name, goal, height, weight, age, issue } = req.body;
    try {
        const { data, error } = await supabase
            .from('profiles') // Assicurati di avere una tabella chiamata 'profiles' su Supabase
            .insert([{ name, goal, height, weight, age, issue }]);

        if (error) throw error;
        res.json({ status: "success", data });
    } catch (error) {
        console.error("Errore Supabase:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Configurazione della porta dinamica per Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`[SYSTEM] Server attivo ed in ascolto sulla porta ${PORT}`);
});
