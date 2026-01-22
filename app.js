const URL_API = "https://script.google.com/macros/s/AKfycbxfkKaPyY50Is_ICGHM-pD_DLnfugLJF3hQqf75yBO1-f_Xxka_JsNh00fr6TkJx_Tu9g/exec";
let codeReader = new ZXing.BrowserQRCodeReader();
let tokoData = null;

function startScan(){
  document.getElementById("scanBox").style.display="block";
  codeReader.decodeOnceFromVideoDevice(undefined,"videoElement")
  .then(res=>{
    document.getElementById("tokoId").value = res.text;
    document.getElementById("scanBox").style.display="none";
    ambilData(res.text);
  })
  .catch(e=>console.log(e));
}

function ambilData(tokoId){
  fetch(URL_API,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ action:"getTokoData", tokoId })
  })
  .then(r=>r.json())
  .then(r=>{
     if(!r.success || r.data.length === 0){
       alert("Data tidak ditemukan!");
       return;
     }

     tokoData = r.data[0]; // ambil baris pertama
     document.getElementById("varian").value = tokoData[2];
     document.getElementById("jumlahLama").value = tokoData[3];
  });
}

function hitungBaru(){
  let lama = Number(document.getElementById("jumlahLama").value);
  let ubah = Number(document.getElementById("perubahan").value);
  document.getElementById("jumlahBaru").value = lama + ubah;
}

function confirmData(){
  let idToko = document.getElementById("tokoId").value;
  let lama = document.getElementById("jumlahLama").value;
  let ubah = document.getElementById("perubahan").value;
  let baru = document.getElementById("jumlahBaru").value;
  let status = document.getElementById("statusBayar").value;

  let ok = confirm(
    `Konfirmasi Transaksi:\n\n`+
    `ID Toko: ${idToko}\n`+
    `Jumlah Lama: ${lama}\n`+
    `Perubahan: ${ubah}\n`+
    `Jumlah Baru: ${baru}\n`+
    `Status Bayar: ${status}\n\n`+
    `Kirim ke Spreadsheet?`
  );

  if(ok){ kirimData(idToko,baru,status); }
}

function kirimData(id,baru,status){
  fetch(URL_API,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      action:"updateJumlahFix",
      tokoId:id,
      jumlahBaru:baru,
      statusBayar:status,
      varian:tokoData[2]
    })
  })
  .then(r=>r.json())
  .then(r=>alert(r.message));
}
