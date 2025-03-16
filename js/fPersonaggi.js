let personaggi = [];		// inizializzazione array personaggi
const imgBaseUrl = "https://raw.githubusercontent.com/151780/IUSito/main/img/";										// cartella contenente immagini
const caratteriBaseUrl = "https://raw.githubusercontent.com/151780/IUSito/main/data/caratteri/";	// cartella contenente i caratteri

// Lettura parametri URL
function getParametro(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Lettura file CSV personaggi e preparazione accordion
function caricaCSVPersonaggi() {
  $.get("https://raw.githubusercontent.com/151780/IUSito/main/data/personaggi.csv", function(data) {
    const righe = data.split("\n");
    caratteri = righe.slice(1).map(riga => {			// costruzione array di oggetti personaggio
        const [nome, genere, apparizione, img, link, ciclo] = riga.split(",");
        return {nome, genere, apparizione, img : imgBaseUrl + img, link : caratteriBaseUrl + link, ciclo, carattere:""};
    });                     

    const personaggi = caratteri.map(personaggio => personaggio.nome);
    const accordionContainer = document.getElementById("accordionPersonaggi");		// preparazione personaggi per inserimento nell'accordion
    accordionContainer.parentElement.classList.add("bg-filter", "p-4");						// formattazione sfondo colonna accordion

    accordionContainer.innerHTML = generaAccordionHTML(personaggi);		// generazione dell'accordion

    gestisciScroll(); 	// impostazione scroll del link personaggio
    gestisciHover();  	// impostazione hover dei link

		caricaCaratteri();  // caricamento dei caratteri associati a ogni personaggio
  });
}

// Lettura di tutti i file dei caratteri associati ai personaggi
function caricaCaratteri() {
  let richieste = caratteri.map(p =>  // costruzione array di richieste ajax
      $.get(p.link)                   // per ogni personaggio
      .then(carattere => {
          p.carattere = carattere;    // salvataggio nell'attributo carattere
      })
      .fail(() => {
          p.carattere = "Errore nel caricamento del file"; // Se il file non viene trovato
      })
  );
  Promise.all(richieste).then(aggiornaElenco);    // chiamata a tutte le richieste asincrone con attesa commit di tutte
}

// Gestione scroll al link del personaggio tenendo in considerazione sticky top navbar
function gestisciScroll() {
	document.querySelectorAll(".scroll-link").forEach(link => {		// per ogni elemento
			link.addEventListener("click", function (e) {
					e.preventDefault();
					const targetId = this.getAttribute("href").substring(1);
					const target = document.getElementById(targetId);
					if (target) {
							const navbarHeight = document.querySelector(".navbar").offsetHeight;	// definizione altezza navbar
							const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;	// settaggio scrollY con offset altezza navbar
							window.scrollTo({ top: targetPosition, behavior: "smooth" });
					}
			});
	});
}

// Gestione text decoration su hover dei link del personaggio on mouse enter e mouse leave
function gestisciHover() {
	document.querySelectorAll(".scroll-link").forEach(link => {
			link.addEventListener("mouseenter", function () {
					this.classList.add("text-decoration-underline");
			});
			link.addEventListener("mouseleave", function () {
					this.classList.remove("text-decoration-underline");
			});
	});
}

// Generazione accordion HTML
function generaAccordionHTML(personaggiFiltrati) {
	const iniziali = [		// set delle iniziali di nomi e cognomi ordinato
			...new Set(
					personaggiFiltrati.flatMap(nome => {
							const nomi = nome.split(" ");
							return nomi.map(parte => parte.charAt(0).toUpperCase());
					})
			)
	].sort();

	return iniziali.map(iniziale => {
			const personaggiConIniziale = personaggiFiltrati.filter(nome => {		// assegnazione dei personaggi alle singole iniziali nell'accordion
					const nomi = nome.split(" ");
					return nomi.some(parte => parte.charAt(0).toUpperCase() === iniziale);
			});
			// costruzione dell'accordion ciclando sulle possibili iniziali
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
													${personaggiConIniziale.map(nome => `<li><a href="#personaggio-${nome.replace(/\s+/g, "-")}" class="mytext-link fw-bold text-decoration-none scroll-link">${nome}</a></li>`).join("")}
											</ul>
									</div>
							</div>
					</div>`;
	}).join("");
}

// Aggiornamento accordion a fronte di aggiornamento dei filtri
function aggiornaAccordion(carFiltrati) {
  const personaggiFiltrati = carFiltrati.map(p => p.nome);  // array dei nomi dei personaggi filtrati
  const accordionContainer = document.getElementById("accordionPersonaggi");  // assegnazione elemento accordion alla variabile
  accordionContainer.innerHTML = generaAccordionHTML(personaggiFiltrati);     // creazione accordion

	gestisciScroll()		// impostazione scroll del link personaggio
	gestisciHover()			// impostazion hover dei link
}

 // Aggiornamento e scrittura personaggi filtrati
function aggiornaElenco() {
  const cicloFiltro = $("#filterCiclo").val().trim();				// definizione dei filtri
  const nomeFiltro = $("#filterName").val().toLowerCase();
  const genereFiltro = $("#filterGenere").val().trim(); 
  
  let carFiltrati = caratteri.filter(l => 									// array dei personaggi filtrati
    (nomeFiltro === "" || l.nome.toLowerCase().includes(nomeFiltro)) &&
    (cicloFiltro === "" || l.ciclo === cicloFiltro) &&
    (genereFiltro === "" || l.genere.trim() === genereFiltro)
    );
	// costruzione del catalogo HTML ciclando sui personaggi filtrati
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

  aggiornaAccordion(carFiltrati)	// aggiornamento dell'accordion solo sui caratteri filtrati
}

// Gestione evento on document loaded
document.addEventListener("DOMContentLoaded", function () {
	caricaCSVPersonaggi();			// caricamento file CSV dei personaggi e preparazione accordion iniziali

	const nomeFiltro = getParametro("filterName");		// acquisizione dei valori dei filtri
  const cicloFiltro = getParametro("filterCiclo");
  if (nomeFiltro) {
    $("#filterName").val(nomeFiltro);
  }
  if (cicloFiltro) {
    $("#filterCiclo").val(cicloFiltro);
  }

  $("#filterCiclo, #filterName, #filterGenere").on("change", aggiornaElenco); // attivazione evento su cambio dei filtri
});


