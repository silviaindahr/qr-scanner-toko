self.addEventListener("install", () => {
  console.log("Service Worker installed");
});

self.addEventListener("fetch", () => {
});
function startScan() {
  const html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      document.getElementById("tokoId").value = decodedText;
      html5QrCode.stop();
      ambilData(); // langsung ambil data
    }
  );
}
;
