# Hayaati v19 — kya badla

**Hero panel**
1. Panel ab **side mein chauda** (height nahi badhi). Desktop par left kinare se orb tak, tablet/"desktop mode" par lagbhag screen ke dono kinaro tak. Text normal size ka, sirf zyada phaila hua.
2. Buttons: Explore upar, Jarvis + Projects ek line mein, isliye panel lamba nahi hota.
3. Panel **90% transparent** — peeche ka andhera parda halka kiya, ab background animation panel ke andar dikhti hai. Panel ke andar khud ki animation bhi: chalti grid, rangeen aurora, scan line.
4. Jarvis chalu/band hone par panel ab **smooth glide** karta hai (atakta nahi).

**Jarvis**
5. **Jaldi connect**: page khulte hi aur button par mouse aate hi server pehle se jaag jaata hai; server ke limit checks aur Google token ek saath (pehle ek ke baad ek, ~14 network round trips the); Google server se connection pehle se khula; history + greeting ek hi message mein.
6. **Mic behtar**: awaaz ab device ki asli quality se sahi 16 kHz mein badli jaati hai, 2x jaldi bheji jaati hai, bolna shuru karte hi pakad leta hai, Jarvis ke bolne ke turant baad bhi sunta hai.
7. **Awaaz saaf**: browser ko bada audio buffer, network der hone par buffer khud badhta hai, shuru mein "click" khatam — atakna / noise khatam.
8. **Bhasha badalte hi** Jarvis turant nayi bhasha mein dobara introduction deta hai, purani chat screen se hat jaati hai (v17 wala feature wapas).
9. **Greeting**: "As-salāmu ʿalaykum" poora aur sahi (Assala walekum nahi), Sat Sri Akal, Namaste wagaira har bhasha mein sahi uchcharan.
10. **Website ki jaankari**: Jarvis ab jaanta hai site under development kyun hai aur phir bhi live kyun hai, kya kaam ho gaya, kya baaki hai, kitni photos lagi hain, hero par kya likha hai (activate karte waqt page se khud padhta hai). Owner Aliya Khan ki details (`lib/jarvisKnowledge.ts` mein, wahi badalni hain).

**Speed / animation** (koi animation hataya nahi)
11. Background animation ka rang: neon cyan, violet, magenta, iridescent globe lines. Bhaari hissa chhoti canvas par banta hai (16x kam kaam), DPR thoda kam.
12. Non-English visitor ke liye page chhupne ka max time 2.5s se 1.2s.

**Advert**
13. Naye modern font (Unbounded / Sora / JetBrains Mono), 3D word reveal, neon shimmer, glowing label.
