/* ===== MUSIK BERLAPIS ===== */
function mus(dt){if(!AC)return;I.pd=(I.pd||0)-dt;if(I.pd<=0){I.pd=4;const b=[55,65.4,49][(t/4|0)%3];[1,1.5,2].forEach(m=>tone(b*m,4.5,'triangle',.05))}
 if(boss){I.ch=(I.ch||0)-dt;if(I.ch<=0){I.ch=2;[220,277,330].forEach(f=>tone(f,2,'sawtooth',.04))}}}
