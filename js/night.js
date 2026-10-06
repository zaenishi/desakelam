/* ===== MALAM BERIKUTNYA (ENDLESS) ===== */
function newNight(b,txt){if(INR)leave();score+=b;updatePlayerStat('night',night,1);night++;gt=0;wave=0;wT=20;boss=0;P.art=0;P.hp=Math.min(P.mh,P.hp+40);P.sn=Math.min(100,P.sn+30);SFX.lvl();popC();say(`${txt} Malam ${night}: monster lebih kuat!`,5);FD=1;savePlayerProfile()}
