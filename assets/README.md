# Audio Files za Mafia Igru

Dodajte .mp3 audio datoteke u ovaj direktorij i **odkomentirajte** odgovarajuće linije u `src/utils/audioManager.js`.

---

## Potrebne datoteke

### Noćna naracija

| Datoteka          | Tekst za snimanje                                               | Kada se reproducira      |
| ----------------- | --------------------------------------------------------------- | ------------------------ |
| `night_start.mp3` | _"Noć je pala na grad... Svi zatvaraju oči i miruju u tišini."_ | Početak svake noći       |
| `day_start.mp3`   | _"Jutro je nastupilo. Svi se bude i otvaraju oči."_             | Kraj noći / početak dana |

---

### Mafija

| Datoteka          | Tekst za snimanje                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| `mafia_wake.mp3`  | _"Mafija se budi. Otvorite oči i odaberite žrtvu za ovu noć. Pokažite na osobu, zatim zatvorite šake."_ |
| `mafia_sleep.mp3` | _"Mafija je odabrala. Zatvorite oči i spavajte."_                                                       |

---

### Doktor

| Datoteka           | Tekst za snimanje                                                                |
| ------------------ | -------------------------------------------------------------------------------- |
| `doctor_wake.mp3`  | _"Doktor se budi. Doktore, otvorite oči i pokažite koga ćete spasiti ove noći."_ |
| `doctor_sleep.mp3` | _"Doktor je odlučio. Zatvorite oči i spavajte."_                                 |

---

### Policajac

| Datoteka           | Tekst za snimanje                                                           |
| ------------------ | --------------------------------------------------------------------------- |
| `police_wake.mp3`  | _"Policajac se budi. Policajče, otvorite oči i pokažite koga istražujete."_ |
| `police_sleep.mp3` | _"Policajac je istražio. Zatvorite oči i spavajte."_                        |

---

### Dama

| Datoteka         | Tekst za snimanje                                                            |
| ---------------- | ---------------------------------------------------------------------------- |
| `lady_wake.mp3`  | _"Dama se budi. Damo, otvorite oči i odaberite koga ćete ušutiti ove noći."_ |
| `lady_sleep.mp3` | _"Dama je odabrala. Zatvorite oči i spavajte."_                              |

---

## Kako dodati audio

1. Snimite audio u .mp3 formatu (preporučeni bitrate: 128kbps)
2. Stavite datoteke u ovaj direktorij (`assets/audio/`)
3. Otvorite `src/utils/audioManager.js`
4. **Odkomentirajte** linije koje odgovaraju vašim datotekama:

```js
// Primjer - odkomentirajte ove linije:
night_start: require('../../assets/audio/night_start.mp3'),
mafia_wake: require('../../assets/audio/mafia_wake.mp3'),
// itd...
```

---

## Napomene

- Aplikacija radi **bez audio datoteka** — prikazuje tekstualni narrator umjesto zvuka
- Preporučeno trajanje audio zapisa: 3-8 sekundi po datoteci
- Ton: miran, tih, atmosferičan (za noćnu atmosferu)
- Jezik: prilagodite prema potrebi (hr/en/...)
