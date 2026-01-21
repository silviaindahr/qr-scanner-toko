// ===============================
// KONFIGURASI
// ===============================
const URL_API = "https://script.google.com/macros/s/AKfycbwuyL75r42jv0Ip6WFT_PLfXr8bgz0JCnD-U06S01pwnZQ9CHUAy-zIZz94Be6QWwkobg/exec";

// ===============================
// AMBIL DATA TOKO
// ===============================
function ambilData() {
  const tokoId = document.getElementById("tokoId").value.trim();

  if (!tokoId) {
    alert("Scan QR dulu ya 👶");
    return;
  }

  fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getTokoData",
      tokoId: tokoId
    })
  })
  .then(res => res.json())
  .then(res => {
    if (!res.success) {
      document.getElementById("hasil").innerHTML = "❌ " + res.message;
      return;
    }
    tampilkanData(res.data);
  })
  .catch(() => {
    document.getElementById("hasil").innerHTML = "❌ Gagal koneksi ke server";
  });
}

// ===============================
// TAMPILKAN DATA
// ===============================
function tampilkanData(data) {
  const hasil = document.getElementById("hasil");
  hasil.innerHTML = "<h3>📊 Data Transaksi</h3>";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>Varian:</b> ${item.varian}<br>
      <b>Jumlah:</b> ${item.jumlah}<br>
      <b>Total:</b> Rp ${item.totalHarga}<br>
      <b>Status:</b> ${item.statusBayar}<br><br>
      <button onclick="updateStatus(${item.rowIndex})">
        Tandai LUNAS
      </button>
    `;
    hasil.appendChild(div);
  });
}

// ===============================
// UPDATE STATUS BAYAR
// ===============================
function updateStatus(rowIndex) {
  fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "updateStatus",
      rowIndex: rowIndex,
      newStatus: "LUNAS"
    })
  })
  .then(res => res.json())
  .then(res => alert(res.message))
  .catch(() => alert("❌ Gagal update status"));
}

// ===============================
// QR SCANNER
// ===============================
let videoStream = null;

function startScan() {
  const scanner = document.getElementById("scanner");
  const video = document.getElementById("video");

  scanner.style.display = "block";

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  })
  .then(stream => {
    videoStream = stream;
    video.srcObject = stream;
    video.play();
    scanLoop(video);
  })
  .catch(() => {
    alert("❌ Kamera tidak bisa diakses");
  });
}

function stopScan() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  document.getElementById("scanner").style.display = "none";
}

function scanLoop(video) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  function loop() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        document.getElementById("tokoId").value = code.data;
        stopScan();
        ambilData(); // LANGSUNG AMBIL DATA
        return;
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// ===============================
// SERVICE WORKER (PWA)
// ===============================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
