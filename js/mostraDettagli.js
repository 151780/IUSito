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

function formatLinks(text) {
      return text.replace(/<link\s+\"(.*?)\">(.*?)<\/link>/g, '<a href="$1" target="_blank" class="mytext-link">$2</a>');
}

function mostraDettagli() {
    const libro = getQueryParams();
    const dataCompleta = libro.anno ? `${libro.anno}-01-01` : "";
    const cicloLink = document.getElementById("cicloLink");

    document.getElementById("titolo").innerText = libro.titolo;
    document.getElementById("tipo").innerText = libro.tipo;
    document.getElementById("ciclo").innerText = libro.ciclo;
    document.getElementById("ordine1").innerText = libro.ordine1;
    document.getElementById("ordine2").innerText = libro.ordine2 > 1000 ? "-" : libro.ordine2;
    document.getElementById("isbn").innerText = libro.isbn;
    document.getElementById("copertina").src = libro.img;
    document.getElementById("anno").innerText = libro.anno;
    document.getElementById("genere").innerText = libro.genere;

    document.querySelector('meta[name="DC.Title"]').setAttribute("content", libro.titolo);
    document.querySelector('meta[name="DC.Subject"]').setAttribute("content", libro.genere);
    document.querySelector('meta[name="DC.Description"]').setAttribute("content", libro.ciclo);
    document.querySelector('meta[name="DC.Date"]').setAttribute("content", dataCompleta);
    document.querySelector('meta[name="DC.Type"]').setAttribute("content", libro.tipo);

    if (libro.ciclo && libro.ciclo.toLowerCase() !== "nessuno") {
        url = "ciclo" + encodeURIComponent(libro.ciclo) + ".html";
        cicloLink.href = url;
        cicloLink.style.display = "inline";
    } else {
        cicloLink.style.display = "none";
    }				

    // Carica la sinossi
    fetch(libro.link)
        .then(response => response.text())
        .then(data => {
            document.getElementById("sinossi").innerHTML = formatLinks(data);
            document.querySelector('meta[name="DC.Description"]').setAttribute("content", data);
        })
        .catch(error => {
            document.getElementById("sinossi").innerText = "Sinossi non disponibile.";
        });
}