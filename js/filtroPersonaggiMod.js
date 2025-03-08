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
  creaAccordionPersonaggi();

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

// Funzione per creare l'accordion con le iniziali
function creaAccordionPersonaggi() {
  const accordionContainer = document.getElementById("accordionPersonaggi");

  // Ordina i personaggi in ordine alfabetico per nome
  const personaggiOrdinati = caratteri.sort((a, b) => a.nome.localeCompare(b.nome));

  // Crea un oggetto per raccogliere i personaggi per iniziale
  const personaggiPerIniziale = {};

  personaggiOrdinati.forEach(personaggio => {
    const iniziale = personaggio.nome.charAt(0).toUpperCase();
    if (!personaggiPerIniziale[iniziale]) {
      personaggiPerIniziale[iniziale] = [];
    }
    personaggiPerIniziale[iniziale].push(personaggio);
  });

  // Costruisci l'accordion con le iniziali
  Object.keys(personaggiPerIniziale).forEach((iniziale, index) => {
    const id = `collapse${iniziale}`;
    const headerId = `heading${iniziale}`;

    const accordionItem = document.createElement("div");
    accordionItem.classList.add("accordion-item");

    // Creazione dell'intestazione dell'accordion
    const accordionHeader = document.createElement("h2");
    accordionHeader.classList.add("accordion-header");
    accordionHeader.id = headerId;

    const accordionButton = document.createElement("button");
    accordionButton.classList.add("accordion-button");
    accordionButton.setAttribute("type", "button");
    accordionButton.setAttribute("data-bs-toggle", "collapse");
    accordionButton.setAttribute("data-bs-target", `#${id}`);
    accordionButton.setAttribute("aria-expanded", "true");
    accordionButton.setAttribute("aria-controls", id);
    accordionButton.textContent = iniziale;

    accordionHeader.appendChild(accordionButton);

    const accordionCollapse = document.createElement("div");
    accordionCollapse.id = id;
    accordionCollapse.classList.add("accordion-collapse", "collapse");
    if (index === 0) accordionCollapse.classList.add("show");

    const accordionBody = document.createElement("div");
    accordionBody.classList.add("accordion-body");

    // Aggiungi i nomi dei personaggi
    personaggiPerIniziale[iniziale].forEach(personaggio => {
      const personaggioLink = document.createElement("a");
      personaggioLink.href = `#personaggio-${personaggio.nome.replace(/\s+/g, "-")}`;
      personaggioLink.classList.add("text-decoration-none");
      personaggioLink.textContent = personaggio.nome;
      
      // Aggiungi un evento per scrollare alla posizione del personaggio
      personaggioLink.addEventListener("click", function(event) {
        event.preventDefault();
        const targetId = personaggioLink.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const navbarHeight = document.querySelector(".navbar") ? document.querySelector(".navbar").offsetHeight : 0;
          const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;
          window.scrollTo({ top: elementPosition, behavior: "smooth" });
        }
      });

      accordionBody.appendChild(personaggioLink);
      accordionBody.appendChild(document.createElement("br"));
    });

    accordionCollapse.appendChild(accordionBody);
    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(accordionCollapse);
    accordionContainer.appendChild(accordionItem);
  });
}



