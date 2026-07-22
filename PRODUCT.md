# Nuova Era — Scuola di Ballo

**Register:** brand (sito vetrina, single-page). Il design È il prodotto.

## Cos'è
Sito vetrina statico (HTML/CSS/JS puro, zero dipendenze, zero build) per la Scuola di Ballo Nuova Era di Conversano (BA). Pensato per hosting gratuito (GitHub Pages / Netlify / Cloudflare Pages) e dominio `scuoladiballonuovaera.it`. Rifà il vecchio sito conservando contenuti e identità, in chiave moderna.

## Pubblico
Persone di Conversano e dintorni, tutte le età (bambini, adulti, over), che vogliono imparare a ballare. Conversione principale: contatto via **WhatsApp** / lezione di prova.

## Contenuti reali (fonte: sito live)
- Fondata nel **1996** da **Vito e Rita**. Prima scuola di ballo a Conversano.
- Diplomi ANMB in Danze Standard, Liscio, Ballo da Sala, Latino-Americani.
- Discipline: Latino-Americano/Caraibici, Tango, Liscio & Ballo da Sala, Kizomba, Balli di Gruppo, Pilates.
- Numeri: 5 gruppi, 5 istruttori, 28+ anni, 2500+ studenti.
- Percorso: Scopri → Impara → Danza.
- Eventi ricorrenti: Grumento Nova (Nov), Weekend di Fine Estate (Set), Milonga de la Playa (Giu).
- Bonus benvenuto: fino a 6 settimane in omaggio.
- Contatti: Via degli Svevi 35, Conversano (BA) · tel/WhatsApp +39 338 186 6161 · ritanuovaera@libero.it · Lun-Ven 18:00-22:00.

## Identità visiva
- **Colori:** vermiglio `#E23C24` (primario) + lime `#C6D62E` (accento), su base bianca alternata a sezioni notturne `#131117`. Atmosfera "milonga di notte": drammatica, calda, energica. (Palette derivata dal logo/brand esistente — identity preservation.)
- **Font:** Bricolage Grotesque (display), Poppins (testo/UI, font storico del brand), Norican (script — flourish caldo dei kicker).
- **Tono:** famiglia, passione, accoglienza. Non corporate.

## Da completare (input dalla cliente)
- **Foto maestri reali** → sezione `#maestri` (ora placeholder con iniziali). Vedi commento in `index.html`.
- **Handle social reali** → link Instagram/Facebook marcati con `data-social` in `index.html` (ora puntano ai domini generici).
- `ballo-liscio.jpg` è a bassa risoluzione (555px): sostituire con una foto migliore se disponibile.

## Note tecniche
- Nessun backend: i form di contatto sono sostituiti da WhatsApp/telefono/email (adatto a hosting statico).
- Immagini ottimizzate (~2,2 MB totali). Mappa via iframe Google Maps (lazy).
- Accessibile: skip-link, focus-visible, alt text, `prefers-reduced-motion`, reveal non bloccanti (visibili anche senza JS).
