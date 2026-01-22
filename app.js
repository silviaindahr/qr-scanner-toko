const URL_API = "https://script.google.com/macros/s/AKfycbxfkKaPyY50Is_ICGHM-pD_DLnfugLJF3hQqf75yBO1-f_Xxka_JsNh00fr6TkJx_Tu9g/exec";

let qr;

function startScan() {
  const reader = document.getElementById("reader");
  reader.classList.remove("hidden");
  reader.innerHTML = "";

  qr = new Html5Qrcode("reader");

  qr.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (text) => {
      document.getElementById("tokoId").value = text;
      qr.stop();
      reader.classList.add("hidden");
      ambilDataToko(text);
    }
  ).catch(err => {
    alert("KAMERA ERROR: " + err);
  });
}

function ambilDataToko(tokoId) {
  fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getTokoInfo",
      tokoId: tokoId
    })
  })
  .then(r => r.json())
  .then(d => {
    if (!d.success) {
      alert(d.message);
      return;
    }
    document.getElementById("displayTokoId").textContent = d.data.tokoId;
    document.getElementById("displayNamaToko").textContent = d.data.namaToko;
    document.getElementById("step2").classList.remove("hidden");
  })
  .catch(e => alert(e));
}
