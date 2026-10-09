# Hayaati v18 — kya badla

1. **Jarvis activate par hang** — orb ka particle animation ab GPU par chalta hai, ring ke ~150 alag hisse 3 me jode, awaaz ka level ab har frame poore panel ko dobara nahi banata, captions ek saath aate hain, background canvas har frame page layout nahi naapta.
2. **Language popup** — blur hata diya, 30 cards ka bhari animation hata kar halka CSS animation, bhasha popup band hone ke baad lagti hai, peeche ke animation popup ke time ruk jaate hain.
3. **Awaaz atakna** — awaaz ke tukdon ke liye chhota buffer (0.12 s), isse beech ke gap/click khatam. Bina live session wali browser awaaz ab sabse natural voice chunti hai.
4. **Greeting** — har bhasha ka apna greeting: Hindi "Namaste", Urdu/Arabic "Assalam-o-Alaikum", Punjabi "Sat Sri Akal", Tamil "Vanakkam", wagaira (30 bhasha).
5. **Local bol-chaal** — shuddh/kitabi bhasha nahi; Hindi me aam Hinglish jaisi, baaki bhashao me bhi roz ki bol-chaal.
6. **Hero panel** — phone par dono taraf screen ke border tak.
7. **System Online badge** — thoda bada, panel ke andar hi.
8. **Desh ke hisaab se bhasha** — India: Hindi, USA: English, Saudi: Arabic, Pakistan: Urdu ... (device ke time zone se, koi server call nahi). Visitor ne khud bhasha chuni ho to wahi rehti hai.
9. **Website khulte hi hang** — 3D orb page dikhne ke baad banta hai, background canvas kam pixel/fps par, edge light runners GPU par.
10. **Naam se pehchaan** — visitor naam bataye to usi tarah greet (Aamir → Assalam-o-Alaikum, Rajkumar → Namaste ji, Gurpreet → Sat Sri Akal ji); dharm kabhi bola ya guess nahi kiya jaata.

Backend (app/api) me koi badlav nahi.
