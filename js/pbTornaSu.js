// Mostra/nasconde il pulsante quando si scorre
window.onscroll = function() { toggleButton() };

function toggleButton() {
    let btn = document.getElementById("btnTop");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.style.display = "block"; // mostra il pulsante
    } else {
        btn.style.display = "none"; // nasconde il pulsante
    }
}

// Funzione per tornare in cima
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}