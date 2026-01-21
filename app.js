const URL_API = "https://script.google.com/macros/s/XXXXXX/exec";

function ambilData() {
  const tokoId = document.getElementById("tokoId").value;
  if (!tokoId) {
    alert("ID Toko wajib diisi");
    return;
  }

  fetch(URL_API, {
    method: "POST",
    body: JSON.stringify({
      action: "getTokoData",
      tokoId: tokoId
    })
  })
  .then(res => res.json())
  .then(res => {
    if (!res.success) {
      alert(res.message);
      return;
    }
    tampilkanData(res.data);
  })
  .catch(err => alert("Error koneksi"));
}

function tampilkanData(data) {
  const hasil = document.getElementById("hasil");
  hasil.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>${item.varian}</b><br>
      Jumlah: ${item.jumlah}<br>
      Total: Rp ${item.totalHarga}<br>
      Status: ${item.statusBayar}<br><br>
      <button onclick="updateStatus(${item.rowIndex})">
        Tandai Lunas
      </button>
    `;
    hasil.appendChild(div);
  });
}

function updateStatus(rowIndex) {
  fetch(URL_API, {
    method: "POST",
    body: JSON.stringify({
      action: "updateStatus",
      rowIndex: rowIndex,
      newStatus: "LUNAS"
    })
  })
  .then(res => res.json())
  .then(res => alert(res.message))
  .catch(() => alert("Gagal update"));
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
let videoStream = null;

function startScan() {
  const scanner = document.getElementById("scanner");
  const video = document.getElementById("video");
  scanner.style.display = "block";

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      videoStream = stream;
      video.srcObject = stream;
      scanLoop(video);
    })
    .catch(err => {
      alert("Kamera tidak bisa diakses");
    });
}

function stopScan() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
  }
  document.getElementById("scanner").style.display = "none";
}

function scanLoop(video) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scan = () => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        document.getElementById("tokoId").value = code.data;
        stopScan();
        ambilData();
        return;
      }
    }
    requestAnimationFrame(scan);
  };
  scan();
}
let videoStream = null;

function startScan() {
  const scanner = document.getElementById("scanner");
  const video = document.getElementById("video");

  scanner.style.display = "block";

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  }).then(stream => {
    videoStream = stream;
    video.srcObject = stream;
    video.play();
    scanLoop(video);
  }).catch(err => {
    alert("Kamera tidak bisa dibuka");
  });
}

function scanLoop(video) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  function loop() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        document.getElementById("tokoId").value = code.data;

        stopScan();
        ambilData();
        return;
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
}

function stopScan() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  document.getElementById("scanner").style.display = "none";
}
