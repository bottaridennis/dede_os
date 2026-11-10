# DennisOS portfolio

Portfolio statico: aprire `index.html` nel browser oppure servire la cartella con un server HTTP statico. Non richiede API key né installazione di dipendenze. Conservare `playground.js`, `playground.css` e la cartella `public/` accanto a `index.html`.

## Console

Aprire il Terminale dal dock e scrivere `help`. ↑/↓ richiamano la cronologia; Tab completa i comandi pubblici. Progressi e preferenze rimangono nel browser su questo dispositivo.

- `quests`: missioni di esplorazione.
- `inspect nerdshelf`: scheda tecnica e collegamenti del progetto.
- `jukebox list`, `jukebox play 1`, `jukebox play <titolo>`, `jukebox pause`, `jukebox next`: controlli musicali.
- `roll 2d20`: tira da 1 a 20 dadi, ciascuno con 2–1000 facce.
- `adventure`: avventura testuale. Esplora con `adventure web`, `adventure hardware`, `adventure music`, poi `adventure core`. Disponibili anche look, restart e quit.
- `pet on`, `pet off`, `pet feed`, `pet sleep`, `pet wake`: mascotte sul desktop.
- `fortune`: curiosità e indizi.
- `cowsay ciao`: messaggio ASCII.
- `achievement`: obiettivi sbloccati.
- `credits`: strumenti e collaborazioni.
- `history`: cronologia dei comandi.
- `effects on/off`: controlla animazioni ed effetti.
- `sound on/off`: suoni dell’interfaccia, separati dalla musica e disattivati inizialmente.

I temi e i relativi comandi si scoprono digitando `secret` nella console. Non compaiono in help, ricerca o autocompletamento. Le anteprime durano 10 secondi; `theme save` conserva la scelta. Si tratta di easter egg: il sorgente di un sito statico resta ispezionabile.

## Verifica

Con Node.js installato: `node --check playground.js` e `node --test tests/playground.test.cjs`.

I test verificano cronologia, autocompletamento, temi temporanei e salvati, missioni, avventura, dadi, playlist, mascotte e preferenze. Non sostituiscono la verifica visiva e audio nel browser.
