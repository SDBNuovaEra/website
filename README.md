# Sito Nuova Era — Scuola di Ballo

Sito vetrina statico. Nessuna dipendenza, nessun build: sono solo file.

## Struttura
```
index.html          → la pagina (tutte le sezioni)
css/style.css       → stili e design system
js/main.js          → interazioni (menu, reveal, slider, lightbox)
assets/img/         → logo e foto (ottimizzate per il web)
PRODUCT.md          → contesto e contenuti del progetto
```

## Vederlo in locale
Apri `index.html` nel browser. Oppure, per un'anteprima fedele con un mini-server:
```bash
python -m http.server 8817
```
poi apri http://127.0.0.1:8817

## Pubblicarlo online (gratis)
Il sito è statico, quindi va su qualsiasi hosting gratuito:
- **Netlify / Cloudflare Pages:** trascina la cartella `Sito Nuovo` nella dashboard. Dominio e HTTPS gratis.
- **GitHub Pages:** carica i file in un repository, attiva Pages, punta il dominio `scuoladiballonuovaera.it`.

Ricorda: mantenere i record MX del dominio per non perdere l'email.

## Da personalizzare
- Foto reali dei maestri → sezione "I maestri" in `index.html`.
- Link Instagram/Facebook reali → cerca `data-social` in `index.html`.
