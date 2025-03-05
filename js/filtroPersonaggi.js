let personaggi = [];
// Cartella immagini
const imgBaseUrl = "https://raw.githubusercontent.com/151780/IUSito/main/img/";
// const imgBaseUrl = "img/";
// Cartella caratteri
const caratteriBaseUrl = "https://raw.githubusercontent.com/151780/IUSito/main/data/caratteri/";
// const caratteriBaseUrl = "caratteri/";

// Lettura file libri
function caricaCSVPersonaggi() {
  $.get("https://raw.githubusercontent.com/151780/IUSito/main/data/personaggi.csv", function(data) {
  // $.get("data/personaggi.csv", function(data) {
    const righe = data.split("\n");
    caratteri = righe.slice(1).map(riga => {
        const [nome, genere, apparizione, img, link, ciclo] = riga.split(",");
        return {nome, genere, apparizione, img : imgBaseUrl + img, link : caratteriBaseUrl + link, ciclo, carattere:""};
    });
    caricaCaratteri();
  });
}


// Funzione per leggere i parametri URL
function getParametro(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function caricaCaratteri() {
  let richieste = caratteri.map(p => 
      $.get(p.link)
      .then(carattere => {
          p.carattere = carattere; // Salva il contenuto del file
      })
      .fail(() => {
          p.carattere = "Errore nel caricamento del file"; // Se il file non viene trovato
      })
  );
  Promise.all(richieste).then(aggiornaCatalogo);
}

 // Aggiornamento e scrittura libri filtrati
function aggiornaCatalogo() {
  const cicloFiltro = $("#filterCiclo").val().trim();
  const nomeFiltro = $("#filterName").val().toLowerCase();
  const genereFiltro = $("#filterGenere").val().trim(); 
  
  let carFiltrati = caratteri.filter(l => 
    (nomeFiltro === "" || l.nome.toLowerCase().includes(nomeFiltro)) &&
    (cicloFiltro === "" || l.ciclo === cicloFiltro) &&
    (genereFiltro === "" || l.genere.trim() === genereFiltro)
    );

  $("#catalogo").html(carFiltrati.map((l, index) => `
      <div class="col-md-12 d-flex align-items-center" id="personaggio-${l.nome.replace(/\s+/g, "-")}">
        <div class="row w-100 mb-3">
          <div class="col-2 d-flex justify-content-center align-items-center" style="width: 150px; height: 150px;">
            <img src="${l.img}" class="img-fluid" style="object-fit: cover; width: 100%; height: 100%;">
          </div>
          <div class="col-10">
            <p>
              <span style="display: inline-block; width: 250px;">Nome: <strong>${l.nome}</strong></span> 
              <span style="display: inline-block; width: 250px;">Genere: <strong>${l.genere}</strong></span>
              <span style="display: inline-block; width: 250px;">Ciclo: <strong>${l.ciclo}</strong></span>
            </p>
            <p>
              ${l.carattere}
            </p>
          </div>
        </div>
      </div>
  `).join(""));
}

$(document).ready(function() {
  caricaCSVPersonaggi();

  // Acquisisce valori dei filtri Titolo e ciclo
  const titoloFiltro = getParametro("filterName");
  const cicloFiltro = getParametro("filterCiclo");

  // Se esiste un valore, imposta il campo input e aggiorna il catalogo
  if (titoloFiltro) {
      $("#filterName").val(titoloFiltro);
      // aggiornaCatalogo();  // Chiama la funzione che aggiorna i libri filtrati
  }
  if (cicloFiltro) {
      $("#filterCiclo").val(cicloFiltro);
      // aggiornaCatalogo();  // Chiama la funzione che aggiorna i libri filtrati
  }


  $("#filterCiclo, #filterName, #filterGenere").on("change", aggiornaCatalogo);
});