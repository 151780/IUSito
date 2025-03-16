// Apertura popup modale richiesto
function openPopup(title, imgSrc, text) {
    document.getElementById('popupModalLabel').innerText = title;
    document.getElementById('popupImage').src = imgSrc;
    document.getElementById('popupText').innerText = text;
    var modal = new bootstrap.Modal(document.getElementById('popupModal'));
    modal.show();
}

// Visualizzazione e cancellazione dei tooltip sulle aree della mappa
function showTooltip(event) {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "block";
    moveTooltip(event);
}

function hideTooltip() {
    document.getElementById("tooltip").style.display = "none";
}

// Posizionamento del tooltip
function moveTooltip(event) {
    var tooltip = document.getElementById("tooltip");
    var image = document.getElementById("mappa");

    var mouseX = event.pageX;   // acquisizione della posizione del mouse
    var mouseY = event.pageY;
    var imageRect = image.getBoundingClientRect();  // acquisizione posizione della mappa nel suo container
    var scrollY = window.scrollY || document.documentElement.scrollTop;     // acquisizione valore scroll dall'alto

    var offsetX = -55;  // assegnazione offset del tooltip rispetto al mouse
    var offsetY = 0;
    var tooltipX = mouseX - imageRect.left + offsetX;           // calcolo posizione tooltip
    var tooltipY = mouseY - imageRect.top + offsetY - scrollY;

    tooltip.style.left = tooltipX + "px";   // impostazione posizione tooltip in pixel
    tooltip.style.top = tooltipY + "px";
}