const express = require('express');
const cors = require('cors');
// Legge la chiave segreta direttamente dalla cassaforte di Render
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const app = express();

app.use(cors());
app.use(express.json());

// DATABASE IN MEMORIA PER L'IMPERO DEI MINOTAURI
let utenti = {}; 
let messaggiChat = [];

// SCALA REALE DEI 9 RANK UFFICIALI SENZA AGGIUNTE
const ELITE_RANKS = ['Legno', 'Bronzo', 'Argento', 'Oro', 'Diamante', 'Assassino', 'Colosso', 'Divino', 'MINOTAURO'];

// CONFIGURAZIONE BOSS CRESCENTI: NOMI NUMERICI, VITA E GRANDEZZA (SCALA)
const INFO_BOSS = {
    0: { nome: "Boss Rank 1", hp: 120, danno: 10, oro: 1, scala: 1.0 },       // Per andare a Bronzo
    1: { nome: "Boss Rank 2", hp: 350, danno: 25, oro: 2, scala: 1.4 },       // Per andare a Argento
    2: { nome: "Boss Rank 3", hp: 850, danno: 50, oro: 3, scala: 1.9 },       // Per andare a Oro
    3: { nome: "Boss Rank 4", hp: 1800, danno: 110, oro: 4, scala: 2.3 },     // Per andare a Diamante
    4: { nome: "Boss Rank 5", hp: 3200, danno: 180, oro: 5, scala: 2.8 },     // Per andare a Assassino
    5: { nome: "Boss Rank 6", hp: 5500, danno: 280, oro: 6, scala: 3.2 },     // Per andare a Colosso
    6: { nome: "Boss Rank 7", hp: 9000, danno: 450, oro: 7, scala: 3.8 },     // Per andare a Divino
    7: { nome: "Boss Rank 8 Final", hp: 16000, danno: 800, oro: 10, scala: 4.5 } // Per il grado supremo MINOTAURO
};

// 1. ROTTA DI TEST PER VERIFICARE SE IL SERVER È LIVE
app.get('/', (req, res) => {
    res.json({ message: "Ancubu Core Backend Online" });
});

// 2. REGISTRAZIONE UTENTE DOPO I QUESTIONARI IN STILE LIFTOFF
app.post('/api/minotauro/registrazione', (req, res) => {
    const { userId, livelloIniziale, tempoSessione, giorniAllenamento } = req.body;
    utenti[userId] = {
        userId,
        livelloIniziale,
        tempoSessione,
        giorniAllenamento,
        rankIndex: 0, 
        rankAttuale: 'Legno',
        oroGioco: 0,
        statistiche: { vita: 100, forza: 10, velocita: 10 },
        coloreMinotauro: 'Default',
        spadeOro: [],
        isVip: false,
        spadaAntimateria: false
    };
    res.json({ success: true, data: utenti[userId] });
});

// 3. RECUPERO DATI DEL BOSS CRESCENTE IN BASE AL RANK ATTUALE
app.get('/api/minotauro/info-boss/:rankIndex', (req, res) => {
    const rankIndex = parseInt(req.params.rankIndex);
    const boss = INFO_BOSS[rankIndex];
    if (!boss) return res.json({ message: "Sei già al grado supremo di MINOTAURO!" });
    res.json(boss);
});

// 4. CONFERMA VITTORIA BOSS: SALVATAGGIO ORO E RANK UP NELLA SCALA A 9 LIVELLS
app.post('/api/minotauro/conferma-rankup', (req, res) => {
    const { userId } = req.body;
    let utente = utenti[userId];
    if (!utente) return res.status(404).json({ error: "Utente non trovato" });

    const bossAttuale = INFO_BOSS[utente.rankIndex];
    if (!bossAttuale) return res.json({ success: false, message: "Rank Massimo raggiunto!" });

    utente.oroGioco += bossAttuale.oro;
    utente.rankIndex += 1;
    utente.rankAttuale = ELITE_RANKS[utente.rankIndex];

    res.json({ success: true, nuovoRank: utente.rankAttuale, oroAttuale: utente.oroGioco });
});

// 5. POTENZIAMENTO ATTRIBUTI CON ORO DEL GIOCO
app.post('/api/minotauro/upgrade-stat', (req, res) => {
    const { userId, stat } = req.body;
    let utente = utenti[userId];
    if (!utente) return res.status(404).json({ error: "Utente non trovato" });

    if (utente.oroGioco >= 1) {
        utente.statistiche[stat] += 10;
        utente.oroGioco -= 1;
        res.json({ success: true, statistiche: utente.statistiche, oro: utente.oroGioco });
    } else {
        res.json({ success: false, message: "Oro del gioco insufficiente! Abbatti un Boss!" });
    }
});

// 6. CHAT GLOBAL COMMUNITY CON TAG ORO VIP
app.post('/api/chat/invia', (req, res) => {
    const { userId, testo, donazione } = req.body;
    const utente = utenti[userId] || { isVip: false };
    
    const nuovoMessaggio = {
        userId,
        tag: utente.isVip ? '[VIP] ' : '',
        testo: testo,
        donazione: donazione || 0,
        timestamp: new Date()
    };
    
    messaggiChat.push(nuovoMessaggio);
    res.json({ success: true, chat: messaggiChat });
});

// 7. STRIPE INTEGRATION: PAGAMENTO RICORRENTE ABBONAMENTO VIP (3,99€)
app.post('/api/checkout/vip', async (req, res) => {
    const { userId } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                // Legge l'ID del prezzo direttamente dalla Dashboard di Render
                price: process.env.STRIPE_PRICE_ID, 
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `https://github.io{CHECKOUT_SESSION_ID}&userId=${userId}&type=vip`,
            cancel_url: 'https://github.io',
        });
        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. STRIPE INTEGRATION: ACQUISTO PREMIUM SPADA ANTIMATERIA (3,00€ UNA TANTUM)
app.post('/api/checkout/spada-antimateria', async (req, res) => {
    const { userId } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Spada Antimateria Premium',
                        description: 'Sblocca forma Angelo Oscuro, linea viola che taglia il cielo, immortalità per 5s e schivata assoluta.',
                    },
                    unit_amount: 300, // 300 centesimi = 3,00€
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `https://github.io{CHECKOUT_SESSION_ID}&userId=${userId}&type=spada`,
            cancel_url: 'https://github.io',
        });
        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MESSA IN ASCOLTO DEL SERVER SULLA PORTA DEFAULT DI RENDER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server dell'Impero Minotauro attivo sulla porta ${PORT}`));
