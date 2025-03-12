function openPopup(title, imgSrc, text) {
    document.getElementById('popupModalLabel').innerText = title;
    document.getElementById('popupImage').src = imgSrc;
    document.getElementById('popupText').innerText = text;
    var modal = new bootstrap.Modal(document.getElementById('popupModal'));
    modal.show();
}

function showTooltip(event) {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "block";
    moveTooltip(event);
}

function moveTooltip(event) {
    var tooltip = document.getElementById("tooltip");
    var image = document.getElementById("mappa");

    // Otteniamo la posizione del mouse rispetto alla pagina
    var mouseX = event.pageX;
    var mouseY = event.pageY;

    // Calcoliamo la posizione dell'immagine relativamente alla pagina
    var imageRect = image.getBoundingClientRect();

    // Aggiungiamo gli offset relativi all'immagine centrata
    var offsetX = 15;
    var offsetY = 15;

    // Consideriamo lo scroll verticale della pagina
    var scrollY = window.scrollY || document.documentElement.scrollTop;

    // Calcoliamo la posizione del tooltip in base all'immagine, al mouse e allo scroll
    var tooltipX = mouseX - imageRect.left + offsetX;
    var tooltipY = mouseY - imageRect.top + offsetY - scrollY;

    // Posizioniamo il tooltip
    tooltip.style.left = tooltipX + "px";
    tooltip.style.top = tooltipY + "px";
}

function hideTooltip() {
    document.getElementById("tooltip").style.display = "none";
}