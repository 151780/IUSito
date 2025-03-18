let libri = [];           // array oggetti libro
let libriFiltrati = [];   // array oggetti libro filtrati in base a impostazione filtri
let libriPerPagina = 12;  // numero di libri per ogni pagina --> NB: CAMBIARE ANCHE IL PARAMETRO IN DETTAGLI
let paginaCorrente = 1;   // pagina iniziale di visualizzazione

const imgBaseUrl = "https://raw.githubusercontent.com/151780/IUSito/main/img/";   // cartella immagini
const sinossiBaseUrl = "https://raw.githubusercontent.com/151780/IUSito/main/data/sinossi/";   // cartella sinossi 

// Lettura file libri
function caricaCSVLibri() {
$.get("https://raw.githubusercontent.com/151780/IUSito/main/data/libri.csv", function(data) {
    const righe = data.split("\n");
    libri = righe.slice(1).map(riga => {  // costruzione array libri
        const [titolo, tipo, ciclo, ordine1, ordine2, isbn, img, link, anno, genere] = riga.split(",");
        return { titolo, tipo, ciclo, ordine1, ordine2, isbn, img : imgBaseUrl + img, link : sinossiBaseUrl + link, anno, genere};
    });

    // calcolo range anni e aggiornamento slider
    const anni = libri.map(l => l.anno);
    minAnno = Math.min(...anni);
    maxAnno = Math.max(...anni);
    slider.noUiSlider.updateOptions({
    range: { min: minAnno, max: maxAnno },
    start: [minAnno, maxAnno]
    });

    aggiornaCatalogoLibri();  // aggiornamento del catalogo
});
}

// inizializzazion slider noUI
let minAnno = 1900, maxAnno = 2100; 
const slider = document.getElementById("sliderAnno");

noUiSlider.create(slider, {
    start: [minAnno, maxAnno], 
    connect: true, 
    range: {
        "min": minAnno,
        "max": maxAnno
    },
    step: 1,
    tooltips: [true, true],
    format: {
        to: value => Math.round(value),
        from: value => Number(value)
    }
});

// Aggiornamento libri filtrati su valori anni della linea del tempo
slider.noUiSlider.on("update", function(values) {
    $("#annoRange").text(`${values[0]} - ${values[1]}`);
    aggiornaCatalogoLibri();
});

// Lettura parametri URL
function getParametro(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Aggiornamento e scrittura libri filtrati
function aggiornaCatalogoLibri() {
    const tipoFiltro = $("#filterTipo").val();
    const cicloFiltro = $("#filterCiclo").val();
    const ordine = $("#filterOrdine").val();
    const titoloFiltro = $("#filterTitle").val().toLowerCase();
    const genereFiltro = $("#filterGenere").val().trim(); 
    const [annoInizio, annoFine] = slider.noUiSlider.get().map(Number);

    libriFiltrati = libri.filter(l =>                                             // definizione libri filtrati in base a 
        (titoloFiltro === "" || l.titolo.toLowerCase().includes(titoloFiltro)) &&   // valore della casella di ricerca nel titolo
        (tipoFiltro === "" || l.tipo === tipoFiltro) &&                             // tipo
        (cicloFiltro === "" || l.ciclo === cicloFiltro) &&                          // ciclo
        (genereFiltro === "" || l.genere.trim() === genereFiltro) &&                // genere
        (l.anno >= annoInizio && l.anno <= annoFine)                                // anno di pubblicazione
    );

    libriFiltrati.sort((a, b) => a[`ordine${ordine}`] - b[`ordine${ordine}`]);    // e ordinamento a ordine1 o ordine2
    localStorage.setItem("libriFiltrati", JSON.stringify(libriFiltrati));         // salvataggio elenco libri per acquisizione successiva in dettagli

    paginaCorrente = 1;
    mostraPagina(paginaCorrente); // visualizzazione catalogo a partire dalla pagina corrente

    localStorage.setItem("libriFiltrati", JSON.stringify(libriFiltrati));
    // localStorage.setItem("paginaCorrente", paginaCorrente);
}

// Aggiornamento della visualizzazione degli elementi di paginazione
function aggiornaPaginazione() {
    let numPagine = Math.ceil(libriFiltrati.length / libriPerPagina);
    let paginazioneHTML = "";

    for (let i = 1; i <= numPagine; i++) {   // costruzione dei singoli elementi di paginazione HTML in base alla pagina corrente
        paginazioneHTML += `<li class="page-item ${i === paginaCorrente ? 'active' : ''}">
                            <a class="page-link" href="#" onclick="cambiaPagina(${i})">${i}</a>
                            </li>`;
    }
    // costruzione struttura completa HTML navigazione per pagine
    $("#paginazione").html(`<nav>
                                <ul class="pagination justify-content-center">
                                ${paginazioneHTML}
                                </ul>
                            </nav>`);
}

// Aggiornamento della pagina su on click paginazione
function cambiaPagina(pagina) {
    paginaCorrente = pagina;
    mostraPagina(paginaCorrente);
}

// Visualizzazione pagina del catalogo richiesta
function mostraPagina(pagina) {
    let start = (pagina - 1) * libriPerPagina;    // definizione dell'intervallo di libri da inserire nella pagina
    let end = start + libriPerPagina;
    let libriDaMostrare = libriFiltrati.slice(start, end);

    // costruzione del catalogo HTML ciclando sui libri filtrati
    $("#catalogo").html(libriDaMostrare.map((l, index) => `
        <div id="oggetto-${index}" class="col-md-3 mb-3 card-container">
        <div class="card">
            <a href="dettagli.html?titolo=${encodeURIComponent(l.titolo)}&tipo=${encodeURIComponent(l.tipo)}&ciclo=${encodeURIComponent(l.ciclo)}&ordine1=${l.ordine1}&ordine2=${l.ordine2}&isbn=${l.isbn}&img=${encodeURIComponent(l.img)}&link=${encodeURIComponent(l.link)}&anno=${encodeURIComponent(l.anno)}&genere=${encodeURIComponent(l.genere)}" target="_blank">
            <img src="${l.img}" class="card-img-top img-fluid" style="height: 200px; width: 100%; object-fit: contain;">
            </a>
            <div class="card-body text-center">
            <h6 class="DC.Title">${l.titolo}</h6>
            <h6 class="DC.Date">${l.anno}</h6>
            </div>
            </div>
        </div>
        </div>
    `).join(""));

    aggiornaPaginazione();    // aggiorna la paginazione

    localStorage.setItem("paginaCorrente", pagina); // salva la pagina corrente in locale
}

// Rimozione del catalogo libri dal local storage
window.addEventListener("beforeunload", function () {
    localStorage.removeItem("libriFiltrati");
});

// Gestione evento on document loaded
document.addEventListener("DOMContentLoaded", function () {
    caricaCSVLibri();   // caricamento file CSV dei libri in catalogo

    const titoloFiltro = getParametro("filterTitle"); // acquisizione dei valori dei filtri
    const cicloFiltro = getParametro("filterCiclo");

    if (titoloFiltro) {$("#filterTitle").val(titoloFiltro);}
    if (cicloFiltro) {$("#filterCiclo").val(cicloFiltro);}


    $("#filterTipo, #filterCiclo, #filterOrdine, #filterTitle, #filterGenere").on("change", aggiornaCatalogoLibri); // attivazione evento di cambio dei filtri
});


