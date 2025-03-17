// Acquisizione parametri in apertura pagina
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        titolo: params.get("titolo"),
        tipo: params.get("tipo"),
        ciclo: params.get("ciclo"),
        ordine1: params.get("ordine1"),
        ordine2: params.get("ordine2"),
        isbn: params.get("isbn"),
        img: params.get("img"),
        link: params.get("link"),
        anno: params.get("anno"),
        genere: params.get("genere")
    };
}

// Utility di trasformazione dei link in formato HTML
function formatLinks(text) {
      return text.replace(/<link\s+\"(.*?)\">(.*?)<\/link>/g, '<a href="$1" target="_blank" class="mytext-link">$2</a>');
}

// Caricamento dettaglio libro precedente o successivo
function cambiaDettaglioLibro(offset) {
    let libriFiltrati = JSON.parse(localStorage.getItem("libriFiltrati"));      // acquisizione archivio locale
    let paginaCorrente = parseInt(localStorage.getItem("paginaCorrente")) || 1; // acquisizione pagina corrente

    // if (!libriFiltrati || libriFiltrati.length === 0) {
    //     alert("Nessun altro libro disponibile.");
    //     return;
    // }

    let libriPerPagina = 12;  // impostazione numero di libri per pagina
    let numPagine = Math.ceil(libriFiltrati.length / libriPerPagina);   // calcolo numero pagine
    const libroCorrente = getQueryParams();     // indice del libro corrente
    let indiceAttuale = libriFiltrati.findIndex(l => l.titolo === libroCorrente.titolo);

    let nuovoIndice = indiceAttuale + offset;   // indice del libro da visualizzare

    // Se si esce dai limiti, revolving
    if (nuovoIndice < 0) {nuovoIndice = libriFiltrati.length - 1;}
    if (nuovoIndice >= libriFiltrati.length) {nuovoIndice = 0;}

    let nuovaPagina = Math.floor(nuovoIndice / libriPerPagina) + 1; // calcolo della nuova pagina
    if (nuovaPagina !== paginaCorrente) {localStorage.setItem("paginaCorrente", nuovaPagina);}  // aggiorna lo storage se pagina cambiata
    let nuovoLibro = libriFiltrati[nuovoIndice];    // acquisisci il nuovo libro da visualizzare

    const nuovaURL = `dettagli.html?titolo=${encodeURIComponent(nuovoLibro.titolo)}&tipo=${encodeURIComponent(nuovoLibro.tipo)}&ciclo=${encodeURIComponent(nuovoLibro.ciclo)}&ordine1=${nuovoLibro.ordine1}&ordine2=${nuovoLibro.ordine2}&isbn=${nuovoLibro.isbn}&img=${encodeURIComponent(nuovoLibro.img)}&link=${encodeURIComponent(nuovoLibro.link)}&anno=${encodeURIComponent(nuovoLibro.anno)}&genere=${encodeURIComponent(nuovoLibro.genere)}`;
    window.history.pushState({}, "", nuovaURL); // aggiornamento URL senza ricaricare

    mostraDettagli();
}




// Preparazione dei dati per la visualizzazione
function mostraDettagli() {
    const libro = getQueryParams();                                     // acquisizione dati libro
    const dataCompleta = libro.anno ? `${libro.anno}-01-01` : "";       // impostazione data a formato YYYY-MM-DD a partire dal solo anno
    const cicloLink = document.getElementById("cicloLink");             // assegnazione variabile del ciclo di appartenenza

    document.getElementById("titolo").innerText = libro.titolo;         // assegnazione dei singoli dati
    document.getElementById("tipo").innerText = libro.tipo;
    document.getElementById("ciclo").innerText = libro.ciclo;
    document.getElementById("ordine1").innerText = libro.ordine1;
    document.getElementById("ordine2").innerText = libro.ordine2 > 1000 ? "-" : libro.ordine2;
    document.getElementById("isbn").innerText = libro.isbn;
    document.getElementById("copertina").src = libro.img;
    document.getElementById("anno").innerText = libro.anno;
    document.getElementById("genere").innerText = libro.genere;

    document.querySelector('meta[name="DC.Title"]').setAttribute("content", libro.titolo);      // assegnazione dei campi DC variabili
    document.querySelector('meta[name="DC.Subject"]').setAttribute("content", libro.genere);
    document.querySelector('meta[name="DC.Description"]').setAttribute("content", libro.ciclo);
    document.querySelector('meta[name="DC.Date"]').setAttribute("content", dataCompleta);
    document.querySelector('meta[name="DC.Type"]').setAttribute("content", libro.tipo);

    if (libro.ciclo && libro.ciclo.toLowerCase() !== "nessuno") {       // costruzione link alla pagina del ciclo
        url = "ciclo" + encodeURIComponent(libro.ciclo) + ".html";
        cicloLink.href = url;
        cicloLink.style.display = "inline";
    } else {
        cicloLink.style.display = "none";
    }				

    // caricamento della sinossi se esiste
    fetch(libro.link)
        .then(response => response.text())
        .then(data => {
            document.getElementById("sinossi").innerHTML = formatLinks(data);
            document.querySelector('meta[name="DC.Description"]').setAttribute("content", data);
        })
        .catch(error => {
            document.getElementById("sinossi").innerText = "Sinossi non disponibile.";
        });

    // gestione dei pulsanti con sostituzione del pulsante per evitare persistenza click
    document.getElementById("pulsPrecedente").replaceWith(document.getElementById("pulsPrecedente").cloneNode(true));
    document.getElementById("pulsSuccessivo").replaceWith(document.getElementById("pulsSuccessivo").cloneNode(true));

    document.getElementById("pulsPrecedente").addEventListener("click", () => cambiaDettaglioLibro(-1));    // su click vai al precedente
    document.getElementById("pulsSuccessivo").addEventListener("click", () => cambiaDettaglioLibro(1));     // su click vai al successivo
    document.getElementById("pulsIndietro").addEventListener("click", function () {window.close();});       // su click chiudi e torna a catalogo
}

