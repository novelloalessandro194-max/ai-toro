const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Inizializzazione del client Supabase usando le variabili d'ambiente di Render per sicurezza
const supabaseUrl = process.env.SUPABASE_URL || 'URL_SUPABASE_REALE';
const supabaseKey = process.env.SUPABASE_KEY || 'CHIAVE_ANON_REALE';
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
app.listen(PORT, () => console.log(`AI ToRØ Server in ascolto sulla porta ${PORT}`));
