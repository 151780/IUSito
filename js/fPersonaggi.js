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
          <div class="col-2 d-flex justify-content-center align-items-center position-relative" style="width: 150px; height: 150px;">
            <img src="${l.img}" class="img-fluid img-thumbnail" style="object-fit: cover; width: 100%; height: 100%; cursor: pointer;" 
                data-bs-toggle="modal" data-bs-target="#modalImg-${index}">
            <div class="overlay-img d-flex align-items-center justify-content-center">
              Clicca per ingrandire
            </div>
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

      <!-- Modale per l'immagine -->
      <div class="modal fade" id="modalImg-${index}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${l.nome}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <img src="${l.img}" class="img-fluid" style="max-width: 100%;">
            </div>
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

document.addEventListener("DOMContentLoaded", function () {
  fetch("https://raw.githubusercontent.com/151780/IUSito/main/data/personaggi.csv")
      .then(response => response.text())
      .then(data => {
          const righe = data.split("\n").slice(1);
          const personaggi = righe.map(riga => riga.split(",")[0]).filter(nome => nome);

          const iniziali = [
              ...new Set(
                  personaggi.flatMap(nome => {
                      const nomi = nome.split(" ");
                      return nomi.map(parte => parte.charAt(0).toUpperCase());
                  })
              )
          ].sort();

          const accordionContainer = document.getElementById("accordionPersonaggi");
          accordionContainer.parentElement.classList.add("bg-filter", "p-4");

          accordionContainer.innerHTML = iniziali.map(iniziale => {
              const personaggiFiltrati = personaggi.filter(nome => {
                  const nomi = nome.split(" ");
                  return nomi.some(parte => parte.charAt(0).toUpperCase() === iniziale);
              });
              
              return `
                  <div class="accordion-item bg-white border-0">
                      <h2 class="accordion-header" id="heading${iniziale}">
                          <button class="accordion-button collapsed bg-white text-dark fw-bold border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${iniziale}" aria-expanded="false" aria-controls="collapse${iniziale}">
                              ${iniziale}
                          </button>
                      </h2>
                      <div id="collapse${iniziale}" class="accordion-collapse collapse" aria-labelledby="heading${iniziale}" data-bs-parent="#accordionPersonaggi">
                          <div class="accordion-body bg-white">
                              <ul class="list-unstyled">
                                  ${personaggiFiltrati.map(nome => `<li><a href="#personaggio-${nome.replace(/\s+/g, "-")}" class="mytext-link fw-bold text-decoration-none scroll-link">${nome}</a></li>`).join("")}
                              </ul>
                          </div>
                      </div>
                  </div>`;
          }).join("");

          // Riduzione dello scrolling per la navbar sticky-top
          document.querySelectorAll(".scroll-link").forEach(link => {
              link.addEventListener("click", function (e) {
                  e.preventDefault();
                  const targetId = this.getAttribute("href").substring(1);
                  const target = document.getElementById(targetId);
                  if (target) {
                      const navbarHeight = document.querySelector(".navbar").offsetHeight;
                      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;
                      window.scrollTo({ top: targetPosition, behavior: "smooth" });
                  }
              });
          });

          // Aggiunge l'effetto hover sui nomi
          document.querySelectorAll(".scroll-link").forEach(link => {
              link.addEventListener("mouseenter", function () {
                  this.classList.add("text-decoration-underline");
              });
              link.addEventListener("mouseleave", function () {
                  this.classList.remove("text-decoration-underline");
              });
          });
      });
});
