# Squad Games — App Overview

### Za marketinški tim

---

## O aplikaciji

**Squad Games** je mobilna party-gaming aplikacija namijenjena grupama prijatelja koji žele zabavnu večer. Aplikacija u sebi sadrži **4 različite društvene igre** koje se igraju na jednom uređaju, dodajući se redom — bez potrebe za internetom, posebnim karticama ili opremom.

Aplikacija je dostupna na **10 jezika** i dizajnirana je da se osjeća kao premium noćni iskustvo — tamno, neonski, energično.

**Tagline:** _"Spremi se za noć punu intrige, laži i smijeha."_

---

## Vizualni identitet i dizajn

### Osjećaj aplikacije

Squad Games ima **premium dark-mode estetiku** inspiriranu neonskim svjetlima, noćnim klubovima i retro-futurizmom. Svaki element — od pozadine do tipografije — komunicira ekskluzivnost i uzbuđenje. Aplikacija je namijenjena večernjim sesijama u grupi.

### Paleta boja

| Naziv                | Hex       | Primjena                                     |
| -------------------- | --------- | -------------------------------------------- |
| **Neon ljubičasta**  | `#cf96ff` | Primarna boja, naslovi, istaknuti elementi   |
| **Tamna ljubičasta** | `#a533ff` | Gradijenti, gumbi, akcenti                   |
| **Neon narančasta**  | `#fd9000` | Alias igra, score chips, sekundarna boja     |
| **Neon zelena**      | `#8eff71` | Spectrum igra, pobjeda, pozitivni rezultati  |
| **Neon crvena**      | `#ff6e84` | Greške, opasnost, Mafia tim                  |
| **Pozadina**         | `#0d0118` | Osnovna boja ekrana (duboka ljubičasto-crna) |
| **Surface**          | `#1b0424` | Kartice i paneli                             |
| **Card Dark**        | `#2a0b35` | Unutarnji paneli                             |
| **Text Primary**     | `#fbdbff` | Bijeli tekst s ljubičastom nijansom          |
| **Text Secondary**   | `#c39fca` | Opisni tekst, oznake                         |

### Tipografija

- **Naslovi:** Ultra-bold, italic, tightly tracked — agresivan i moderan stil
- **Body tekst:** Clean sans-serif, lako čitljiv na tamnoj pozadini
- **Gumbi:** All caps, heavy weight, prošireno razmaknutje slova

### Animacije i haptika

- Svaki klik u igri prati **haptic feedback** (vibracija)
- Spring animacije kod prikaza rezultata i trofeja
- Pulse efekti na imenima igrača pri predaji uređaja
- Gradient sjene i glow efekti na interaktivnim elementima

---

## Podržani jezici

Aplikacija je u potpunosti lokalizirana na **10 jezika**:

| #   | Jezik     | Zastava |
| --- | --------- | ------- |
| 1   | Bosanski  | 🇧🇦      |
| 2   | Hrvatski  | 🇭🇷      |
| 3   | Srpski    | 🇷🇸      |
| 4   | English   | 🇬🇧      |
| 5   | Español   | 🇪🇸      |
| 6   | Português | 🇧🇷      |
| 7   | Français  | 🇫🇷      |
| 8   | Deutsch   | 🇩🇪      |
| 9   | Italiano  | 🇮🇹      |
| 10  | Polski    | 🇵🇱      |

Jezik se mijenja jednim dodirom sa početnog ekrana, bez restartanja aplikacije.

---

## Navigacija

Sve igre dostupne su s **Home screena** koji prikazuje:

- App bar s logom i gumbom za odabir jezika
- Hero naslov "IZABERI SVOJU IGRU"
- Istaknuta Mafia kartica (featured)
- Lista ostalih igara u redovima s ikonama i PLAY gumbima

---

## Igre

---

### 🔴 MAFIA — Klasična igra skrivenih uloga

**Tip igre:** Socijalna dedukcija, blefiranje
**Broj igrača:** 4 – 20
**Trajanje:** 20–60 minuta

#### Opis

Mafia je najpoznatija party igra na svijetu. Unutar grupe prijatelja kriju se mafioši čiji je cilj ukloniti sve civile. Civili moraju otkriti tko su mafioši i glasanjem ih eliminirati prije nego postanu manjina.

#### Uloge

| Uloga         | Tim    | Sposobnost                                                              |
| ------------- | ------ | ----------------------------------------------------------------------- |
| **Mafioš**    | Mafia  | Svake noći eliminira jednog civilnog igrača                             |
| **Don**       | Mafia  | Vođa mafije; policiji se prikazuje kao nevin                            |
| **Civilista** | Civili | Nema posebnu sposobnost; glasanjem eliminira sumnjivce                  |
| **Doktor**    | Civili | Svake noći može zaštititi jednog igrača od ubojstva                     |
| **Policajac** | Civili | Svake noći istražuje jednog igrača (saznaje je li mafia ili nevin)      |
| **Ledi**      | Civili | Svake noći može ušutkati jednog igrača (ne smije govoriti sljedeći dan) |

#### Tijek igre

1. **Setup ekran** — Moderator postavlja broj igrača i raspoređuje uloge
2. **Ekran dodjele uloga** — Svaki igrač redom gleda telefon i saznaje svoju tajnu ulogu
3. **Noćna faza** — Ekran moderatora; mafija bira žrtvu, doktor čuva, policajac istražuje, ledi ušutkava
4. **Dnevna faza** — Diskusija, optužbe, glasanje za eliminaciju
5. **Rezultat runde** — Objava tko je eliminiran; igra se ponavlja dok jedna strana ne pobijedi
6. **Kraj igre** — Prikazuje se pobjednički tim i sve otkrivene uloge

#### Posebne mehanike

- Moderator ekran jasno vodi svaku noćnu akciju korak po korak
- Doktor ne može štititi istu osobu dvije noći zaredom
- Don se lažno prikazuje policajcu kao nevin civilista

---

### 🟣 IMPOSTER — Igra tajnih pojmova

**Tip igre:** Blefiranje, dedukcija
**Broj igrača:** 3 – 12
**Trajanje:** 5–15 minuta po rundi

#### Opis

Svi igrači dobivaju isti tajni pojam — osim jednog Impostera koji dobiva samo kategoriju. Igrači opisuju pojam a da ga ne imenuju direktno. Imposter pokušava ostati neotkriven koristeći nejasne opise. Na kraju, tim glasa tko je Imposter.

#### Tijek igre

1. **Setup ekran** — Unos broja igrača i odabir kategorija pojmova
2. **Ekran otkrivanja** — Svaki igrač redom gleda telefon i saznaje pojam (ili samo kategoriju ako je Imposter)
3. **Ekran igre** — Svaki igrač daje kratki opis; diskusija i glasanje
4. **Rezultat** — Otkriva se tko je bio Imposter i pravi pojam

#### Pobjeda

- **Tim pobjeđuje** ako eliminira glasanjem pravog Impostera
- **Imposter pobjeđuje** ako tim eliminira krivog igrača ili ga ne otkrije

---

### 🟠 ALIAS — Igra opisivanja pojmova

**Tip igre:** Timska, brza, word-guessing
**Broj igrača:** 2+ (timovi)
**Trajanje:** 15–30 minuta

#### Opis

Alias je timska igra u kojoj jedan igrač opisuje pojmove riječima (bez direktnog imenovanja, bez prevođenja, bez gestama), a ostali iz tima pogađaju. Cilj je opisati što više pojmova u zadanom vremenu.

#### Tijek igre

1. **Setup ekran** — Timovi unose ime (tim 1, tim 2), biraju trajanje runde (60/90/120 sekundi)
2. **Ready ekran** — Aktivni tim se priprema; predaja telefona
3. **Game ekran** — Opisivač vidi pojam; timer odbraja; pojmovi se prihvaćaju ili preskakaju
4. **Score ekran** — Poeni za rundu, ukupni poredak; izmjena timova

#### Pobjeda

Tim s najviše bodova na kraju rundi pobjeđuje.

---

### 🟢 SPECTRUM — Igra pozicioniranja na spektru

**Tip igre:** Kooperativna dedukcija, procjena
**Broj igrača:** 2 – 10
**Trajanje:** 10–20 minuta

#### Opis

Spectrum je igra inspirirana Wavelength-om. Na spektru između dva suprotna pojma (npr. VRUĆE ↔ HLADNO) postoji tajni cilj. Opisivač vidi gdje se cilj nalazi i mora jednom riječju naznačiti poziciju. Svi ostali igrači pogađaju gdje pada ta naznaka na spektru.

#### Tijek igre

1. **Setup ekran** — Unos igrača (2–10); promjena naziva po potrebi
2. **Transition ekran** — Telefon se predaje opisivaču; pulsira njegovo ime, prikazuje se "PRIPREMI SE" animacija
3. **Clue ekran** — Opisivač vidi vertikalni spektar s označenom tajnom zonom; unosi jednu naznaku
4. **Transition ekran (za pogađače)** — Telefon se predaje sljedećem pogađaču
5. **Guess ekran** — Pogađač pomiče slider lijevo-desno i potvrđuje pogodak; svaki igrač pogađa zasebno
6. **Result ekran** — Prikazuje se spektar s tajnom zonom i svačijim pogotkom; klikom na igrača u ljestvici vidi se njegov pogodak
7. **Final ekran** — Nakon što svi igrači odrade rundu kao opisivač, prikazuje se pobjednik s trofejom i punom ljestvicom

#### Bodovanje

| Udaljenost od cilja | Bodovi                     |
| ------------------- | -------------------------- |
| ≤ 10                | ⭐⭐⭐⭐ 4 boda — Pogodak! |
| 11 – 20             | ⭐⭐ 2 boda — Blizu        |
| 21 – 30             | ⭐ 1 bod — Solidno         |
| > 30                | 0 bodova — Promašaj        |

#### Posebne mehanike

- Svaki igrač je opisivač jednu rundu; igra završava kad svi prođu
- Na result screenu se može kliknuti na bilo kojeg pogađača i vidjeti gdje je on postavio slider
- Bodovi se akumuliraju po svakom pogačaču
- Finalni ekran prikazuje trofej s bounce animacijom, ime pobjednika s neon glow efektom i cijelu ljestvicu

---

## Sažetak

| Igra        | Igrači | Trajanje  | Tip                   |
| ----------- | ------ | --------- | --------------------- |
| 🔴 Mafia    | 4–20   | 20–60 min | Socijalna dedukcija   |
| 🟣 Imposter | 3–12   | 5–15 min  | Blefiranje            |
| 🟠 Alias    | 2+     | 15–30 min | Timska, brzinska      |
| 🟢 Spectrum | 2–10   | 10–20 min | Kooperativna procjena |

**Ukupno ekrana u aplikaciji:** 19+
**Podržani jezici:** 10
**Platforma:** iOS i Android (React Native / Expo)
**Internet veza:** Nije potrebna

---

_Squad Games — jedna aplikacija, beskonačno noći._
