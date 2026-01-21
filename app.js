// ===============================
// KONFIGURASI
// ===============================
const URL_API = "https://script.google.com/macros/s/AKfycbwuyL75r42jv0Ip6WFT_PLfXr8bgz0JCnD-U06S01pwnZQ9CHUAy-zIZz94Be6QWwkobg/exec";

let qrScanner = null;

// ===============================
// AMBIL DATA TOKO
// ===============================
function ambilData() {
  const tokoId = document.getElementById("tokoId").value.trim();
  const hasil = document.getElementById("hasil");

  if (!tokoId) {
    alert("Scan QR dulu ya 🍼");
    return;
  }

  hasil.innerHTML = "⏳ Ambil data...";

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
      hasil.innerHTML = "❌ " + res.message;
      return;
    }
    tampilkanData(res.data);
  })
  .catch(() => {
    hasil.innerHTML = "❌ Gagal koneksi ke server";
  });
}

// ===============================
// TAMPILKAN DATA + WARNA + TOTAL
// ===============================
function tampilkanData(data) {
  const hasil = document.getElementById("hasil");
  hasil.innerHTML = "<h3>📊 Data Transaksi</h3>";

  let totalHutang = 0;

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    const lunas = item.statusBayar === "LUNAS";
    div.style.background = lunas ? "#dcfce7" : "#fee2e2";

    if (!lunas) {
      totalHutang += Number(item.totalHarga);
    }

    div.innerHTML = `
      <b>Varian:</b> ${item.varian}<br>
      <b>Jumlah:</b> ${item.jumlah}<br>
      <b>Total:</b> Rp ${Number(item.totalHarga).toLocaleString("id-ID")}<br>
      <b>Status:</b> ${item.statusBayar}<br><br>
      ${lunas ? "" : `<button onclick="updateStatus(${item.rowIndex})">Tandai LUNAS</button>`}
    `;

    hasil.appendChild(div);
  });

  // TOTAL HUTANG
  const totalDiv = document.createElement("div");
  totalDiv.className = "card";
  totalDiv.style.background = "#fff7ed";
  totalDiv.innerHTML = `
    <h3>💰 Total Hutang</h3>
    <h2>Rp ${totalHutang.toLocaleString("id-ID")}</h2>
  `;
  hasil.prepend(totalDiv);
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
  .then(res => {
    alert(res.message);
    ambilData();
  })
  .catch(() => alert("❌ Gagal update status"));
}

// ===============================
// TAMBAH DATA DARI HP
// ===============================
function tambahData() {
  const tokoId = document.getElementById("tokoId").value.trim();
  const varian = document.getElementById("varian").value.trim();
  const jumlah = document.getElementById("jumlah").value;
  const totalHarga = document.getElementById("totalHarga").value;

  if (!tokoId || !varian || !jumlah || !totalHarga) {
    alert("Lengkapi semua data ya 🍼");
    return;
  }

  fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "tambahData",
      data: {
        tokoId,
        varian,
        jumlah,
        totalHarga
      }
    })
  })
  .then(res => res.json())
  .then(res => {
    alert(res.message);
    document.getElementById("varian").value = "";
    document.getElementById("jumlah").value = "";
    document.getElementById("totalHarga").value = "";
    ambilData();
  })
  .catch(() => alert("❌ Gagal tambah data"));
}

// ===============================
// QR SCAN (html5-qrcode)
// ===============================
function startScan() {
  if (qrScanner) return;

  qrScanner = new Html5Qrcode("reader");

  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (text) => {
      document.getElementById("tokoId").value = text;
      qrScanner.stop();
      qrScanner = null;
      ambilData();
    }
  ).catch(err => {
    alert("❌ Kamera error: " + err);
  });
}

// ===============================
// SERVICE WORKER (PWA)
// ===============================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
