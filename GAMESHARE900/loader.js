function execute(PLfile) {
var req = new XMLHttpRequest();
req.responseType = "arraybuffer";
req.open("GET", PLfile ,true);
 req.send();
 req.onreadystatechange = function () {
  if (req.readyState == 4) {
   PLD = req.response;
   var payload_buffer = chain.syscall(477, 0, PLD.byteLength*4 , 7, 0x1002, -1, 0);
   var pl = p.array_from_address(payload_buffer, PLD.byteLength*4);
   var padding = new Uint8Array(4 - (req.response.byteLength % 4) % 4);
   var tmp = new Uint8Array(req.response.byteLength + padding.byteLength);
   tmp.set(new Uint8Array(req.response), 0);
   tmp.set(padding, req.response.byteLength);
   var shellcode = new Uint32Array(tmp.buffer);
   pl.set(shellcode,0);
   var pthread = p.malloc(0x10);
   chain.call(libKernelBase.add32(OFFSET_lk_pthread_create), pthread, 0x0, payload_buffer, 0);
  }
 };
 allset();
}
function allset() {
    ShowMSG = "You're all Set!";
    loadmsg();
}
function exploit_done() {
  ShowMSG = "Jailbreak Done !! Now load payload :)";
  loadmsg();
  document.getElementById("btnDiv").style.display = "";
  document.getElementById("log2").style.display = "none";
}

function CalcTime(dur) {
  hrs=Math.floor(dur/1000/60/60);
  min=Math.floor(dur/1000/60-hrs*60);
  sec=Math.floor(dur/1000-min*60);
  mil=dur.toString().slice(-3);
  if (min!=0) {
    ShowDuration = " - Webkit Exploited In : " + min + " minute" + (min==1?"":"s") + ", " + sec + " second" + (sec==1?"":"s");
  }else {
    ShowDuration = " - Webkit Exploited In: " + sec + " second" + (sec==1?"":"s");
  }
}
function StartTimer() {
  StartTime = Date.now();
  document.getElementById("log2").innerHTML = "Please wait, Triggering Exploit...";
  loadmsg();
}
function EndTimer() {
  EndTime = Date.now();
  CalcTime(EndTime-StartTime);
  top.document.title += ShowDuration;
}