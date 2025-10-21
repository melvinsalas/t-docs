const API_BASE = "http://127.0.0.1:8787";

const form = document.getElementById("f");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const fd = new FormData(form);
    const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
    const txt = await res.text();
    alert(txt);
    await loadDocs(); // recarga el listado tras subir
  } catch (err) {
    console.error(err);
    alert("Error subiendo el archivo");
  }
});

async function loadDocs() {
  try {
    const params = new URLSearchParams();
    const y = document.getElementById("year").value;
    const t = document.getElementById("tag").value;
    if (y) params.set("year", y);
    if (t) params.set("tag", t);

    const res = await fetch(`${API_BASE}/list?` + params.toString());
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`List fallo: ${res.status} ${body}`);
    }

    const { docs } = await res.json();
    const ul = document.getElementById("list");
    ul.innerHTML = "";

    for (const d of docs) {
      const li = document.createElement("li");
      // el href usa API_BASE para descargar desde el worker
      li.innerHTML = `
        <strong>${d.file_name}</strong> (${d.year}) - ${d.tags.join(", ")}
        <a href="${API_BASE}/download/${d.id}" target="_blank" rel="noopener noreferrer">ver</a>
      `;
      ul.appendChild(li);
    }
  } catch (err) {
    console.error(err);
    alert("Error cargando la lista");
  }
}

document.getElementById("reload").onclick = loadDocs;
loadDocs();
