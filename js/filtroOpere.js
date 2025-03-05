
let libri = [];
// Cartella immagini
const imgBaseUrl = "https://raw.githubusercontent.com/151780/IUSito/main/img/";
// Cartella sinossi
const sinossiBaseUrl = "https://raw.githubusercontent.com/151780/IUSito/main/data/sinossi/";

// Lettura file libri
function caricaCSVLibri() {
  $.get("https://raw.githubusercontent.com/151780/IUSito/main/data/libri.csv", function(data) {
      const righe = data.split("\n");
    libri = righe.slice(1).map(riga => {
        const [titolo, tipo, ciclo, ordine1, ordine2, isbn, img, link, anno, genere] = riga.split(",");
        return { titolo, tipo, ciclo, ordine1, ordine2, isbn, img : imgBaseUrl + img, link : sinossiBaseUrl + link, anno, genere};
    });

    // Range anni e aggiornamento slider
    const anni = libri.map(l => l.anno).filter(a => !isNaN(a));
    minAnno = Math.min(...anni);
    maxAnno = Math.max(...anni);
    slider.noUiSlider.updateOptions({
      range: { min: minAnno, max: maxAnno },
      start: [minAnno, maxAnno]
    });

    aggiornaCatalogoLibri();
  });
}

// Slider
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

// Aggiornamento e scrittura libri filtrati su valori anni della linea del tempo
slider.noUiSlider.on("update", function(values) {
  $("#annoRange").text(`${values[0]} - ${values[1]}`);
  aggiornaCatalogoLibri();
});

// Funzione per leggere i parametri URL
function getParametro(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

 // Aggiornamento e scrittura libri filtrati
function aggiornaCatalogoLibri() {
  const tipo = $("#filterTipo").val();
  const ciclo = $("#filterCiclo").val();
  const ordine = $("#filterOrdine").val();
  const titoloFiltro = $("#filterTitle").val().toLowerCase();
  const genereFiltro = $("#filterGenere").val().trim(); 
  const [annoInizio, annoFine] = slider.noUiSlider.get().map(Number);
  
  let libriFiltrati = libri.filter(l => 
    (titoloFiltro === "" || l.titolo.toLowerCase().includes(titoloFiltro)) &&
    (tipo === "" || l.tipo === tipo) && 
    (ciclo === "" || l.ciclo === ciclo) &&
    (genereFiltro === "" || l.genere.trim() === genereFiltro) &&
    (l.anno >= annoInizio && l.anno <= annoFine)
    );
  
  libriFiltrati.sort((a, b) => a[`ordine${ordine}`] - b[`ordine${ordine}`]);
  
  $("#catalogo").html(libriFiltrati.map(l => `
    <div class="col-md-3 mb-3">
      <div class="card">
        <a href="dettagli.html?titolo=${encodeURIComponent(l.titolo)}&tipo=${encodeURIComponent(l.tipo)}&ciclo=${encodeURIComponent(l.ciclo)}&ordine1=${l.ordine1}&ordine2=${l.ordine2}&isbn=${l.isbn}&img=${encodeURIComponent(l.img)}&link=${encodeURIComponent(l.link)}&anno=${encodeURIComponent(l.anno)}&genere=${encodeURIComponent(l.genere)}" target="_blank">
          <img src="${l.img}" class="card-img-top img-fluid" style="height: 200px; width: 100%; object-fit: contain;" data-dc-title="${l.titolo}">
        </a>
        <div class="card-body text-center">
          <h6 class="card-title">${l.titolo}</h6>
        </div>
      </div>
    </div>
  `).join(""));
}

$(document).ready(function() {
  caricaCSVLibri();

  // Acquisisce valori dei filtri Titolo e ciclo
  const titoloFiltro = getParametro("filterTitle");
  const cicloFiltro = getParametro("filterCiclo");

  // Se esiste un valore, imposta il campo input e aggiorna il catalogo
  if (titoloFiltro) {
      $("#filterTitle").val(titoloFiltro);
      aggiornaCatalogoLibri();  // Chiama la funzione che aggiorna i libri filtrati
  }
  if (cicloFiltro) {
      $("#filterCiclo").val(cicloFiltro);
      aggiornaCatalogoLibri();  // Chiama la funzione che aggiorna i libri filtrati
  }


  $("#filterTipo, #filterCiclo, #filterOrdine, #filterTitle, #filterGenere").on("change", aggiornaCatalogoLibri);
});

