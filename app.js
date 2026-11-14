/* Storm-Shield: satellite rainfall -> school risk level -> spoken alert + checklist.
   No backend, no API keys. Data: NASA POWER (satellite-derived rainfall), Open-Meteo (3-day outlook). */

const PRESETS = [
  { g: "Bangladesh pilot", items: [
    { n: "Hatiya, Noakhali", lat: 22.37, lon: 91.10 },
    { n: "Bhola Sadar", lat: 22.69, lon: 90.65 },
    { n: "Cox's Bazar", lat: 21.45, lon: 91.97 },
    { n: "Koyra, Khulna", lat: 22.34, lon: 89.31 },
    { n: "Sunamganj", lat: 25.07, lon: 91.40 } ] },
  { g: "Global", items: [
    { n: "Manila, Philippines", lat: 14.60, lon: 120.98 },
    { n: "Miami, USA", lat: 25.76, lon: -80.19 },
    { n: "Mumbai, India", lat: 19.08, lon: 72.88 },
    { n: "Jakarta, Indonesia", lat: -6.20, lon: 106.85 },
    { n: "Lagos, Nigeria", lat: 6.52, lon: 3.38 } ] }
];

const VOICE = { en: "en-US", bn: "bn-BD", es: "es-ES", hi: "hi-IN" };
const LEVELS = ["low", "mid", "high"];

const T = {
  en: {
    tagline: "Satellite rain data → a clear alert any school can act on",
    lang: "Language", school: "School location", geo: "Use my location", check: "Check risk",
    risk: "School risk now", sat: "Satellite rainfall · last 7 days", checklist: "Safety checklist", quiz: "Kids' safety quiz",
    listen: "🔊 Listen", how: "How the score works",
    share: "Share without internet", copy: "Copy", copied: "Copied", sms: "Open SMS", print: "Print poster", smsAlert: "Storm-Shield alert", savedNote: "Saved data (offline)", posterTitle: "School storm alert", posterWhat: "What to do", shareNote: "Plain SMS text and a printable poster work on any phone, with no app or internet.",
    level: { low: "Low", mid: "Elevated", high: "High" },
    msg: {
      low: "Low risk. Normal school day. Review your emergency plan this week.",
      mid: "Elevated risk. Heavy rain is building. Charge phones, move supplies up off the floor and brief students.",
      high: "High risk. Heavy rain is likely. Follow local authority warnings, keep students indoors and prepare shelter routes." },
    list: {
      low: ["Know the shelter route", "Keep a charged phone and a torch", "Share the plan with students"],
      mid: ["Charge phones and power banks", "Move books and equipment off the floor", "Tell parents the pick-up plan"],
      high: ["Keep students indoors, stop outdoor activity", "Move to the shelter route if authorities say so", "Check on younger students, keep the contact list ready"] },
    quizData: [
      { q: "During a cyclone warning, where should students stay?", o: ["Near the windows", "In a strong inner room, away from windows", "Under a tree"], a: 1, w: "Flying glass and debris are the main danger, so stay away from windows." },
      { q: "Is it safe to walk through floodwater?", o: ["Yes, if it is shallow", "No, it can hide holes and be dirty or fast", "Yes, with sandals"], a: 1, w: "Even shallow floodwater can hide holes, wires and strong currents." } ],
    drill: "Practice drill", drillStart: "Start 5-minute drill", drillEnd: "End drill", drillDone: "Drill complete", drillNote: "Rehearse the high-risk steps against a timer. Needs no data, so it works offline.",
    mm: "mm", total7: "7-day total", maxDay: "Wettest day", outlook: "3-day outlook",
    liveNote: "Live satellite data", demoNote: "Demo data (live feed unreachable from this browser)", latest: "Latest satellite day",
    noVoice: "No voice for this language on this device; read the text instead.",
    locating: "Finding your location…", loading: "Loading satellite data…", geoFail: "Could not get your location.",
    how_html: "Score 0–100 = 45% × 7-day rainfall (÷120 mm) + 30% × wettest day (÷70 mm) + 25% × next-3-day forecast (÷80 mm), each capped at 1. If the forecast is unavailable the other two are rescaled. Below 35 is low, 35–64 elevated, 65+ high. Thresholds are simple on purpose so a teacher can understand them; local authorities may use different ones.",
    disclaimer: "Storm-Shield is an awareness aid, not an official warning. Always follow your national weather service and local authorities." },
  bn: {
    tagline: "স্যাটেলাইটের বৃষ্টির তথ্য → প্রতিটি স্কুলের জন্য স্পষ্ট সতর্কবার্তা",
    lang: "ভাষা", school: "স্কুলের অবস্থান", geo: "আমার অবস্থান", check: "ঝুঁকি দেখুন",
    risk: "এখন স্কুলের ঝুঁকি", sat: "স্যাটেলাইটে বৃষ্টি · গত ৭ দিন", checklist: "নিরাপত্তা চেকলিস্ট", quiz: "শিশুদের নিরাপত্তা কুইজ",
    listen: "🔊 শুনুন", how: "স্কোর কীভাবে হিসাব হয়",
    share: "ইন্টারনেট ছাড়াই জানান", copy: "কপি", copied: "কপি হয়েছে", sms: "এসএমএস খুলুন", print: "পোস্টার প্রিন্ট", smsAlert: "Storm-Shield সতর্কতা", savedNote: "সংরক্ষিত তথ্য (অফলাইন)", posterTitle: "স্কুল ঝড়ের সতর্কতা", posterWhat: "কী করবেন", shareNote: "সাধারণ এসএমএস লেখা ও প্রিন্টযোগ্য পোস্টার যেকোনো ফোনে চলে, অ্যাপ বা ইন্টারনেট লাগে না।",
    level: { low: "কম", mid: "বাড়ছে", high: "বেশি" },
    msg: {
      low: "ঝুঁকি কম। স্কুল স্বাভাবিক চলবে। এই সপ্তাহে জরুরি পরিকল্পনাটি একবার দেখে নিন।",
      mid: "ঝুঁকি বাড়ছে। ভারী বৃষ্টির সম্ভাবনা। ফোন চার্জ দিন, জিনিসপত্র মেঝে থেকে উঁচুতে রাখুন, শিক্ষার্থীদের জানিয়ে দিন।",
      high: "ঝুঁকি বেশি। ভারী বৃষ্টির আশঙ্কা। স্থানীয় প্রশাসনের সতর্কবার্তা মানুন, শিক্ষার্থীদের ঘরের ভেতরে রাখুন, আশ্রয়ের পথ প্রস্তুত রাখুন।" },
    list: {
      low: ["আশ্রয়কেন্দ্রের পথ চিনে রাখুন", "চার্জ দেওয়া ফোন ও টর্চ রাখুন", "শিক্ষার্থীদের পরিকল্পনাটি জানান"],
      mid: ["ফোন ও পাওয়ার ব্যাংক চার্জ দিন", "বই ও সরঞ্জাম মেঝে থেকে উঁচুতে তুলুন", "অভিভাবকদের ছুটির পরিকল্পনা জানান"],
      high: ["শিক্ষার্থীদের ঘরের ভেতরে রাখুন, বাইরের কাজ বন্ধ করুন", "প্রশাসন বললে আশ্রয়ের পথে যান", "ছোট শিক্ষার্থীদের খেয়াল রাখুন, যোগাযোগের তালিকা হাতে রাখুন"] },
    quizData: [
      { q: "ঘূর্ণিঝড়ের সতর্কতায় শিক্ষার্থীরা কোথায় থাকবে?", o: ["জানালার পাশে", "জানালা থেকে দূরে মজবুত ভেতরের ঘরে", "গাছের নিচে"], a: 1, w: "উড়ন্ত কাচ ও ভাঙা জিনিস সবচেয়ে বিপজ্জনক, তাই জানালা থেকে দূরে থাকুন।" },
      { q: "বন্যার পানিতে হাঁটা কি নিরাপদ?", o: ["হ্যাঁ, পানি কম হলে", "না, নিচে গর্ত থাকতে পারে, পানি নোংরা বা স্রোতযুক্ত হতে পারে", "হ্যাঁ, স্যান্ডেল পরলে"], a: 1, w: "অল্প পানিতেও গর্ত, তার বা স্রোত লুকিয়ে থাকতে পারে।" } ],
    drill: "মহড়া", drillStart: "৫ মিনিটের মহড়া শুরু", drillEnd: "মহড়া শেষ", drillDone: "মহড়া সম্পন্ন", drillNote: "টাইমার ধরে উচ্চ ঝুঁকির ধাপগুলো অনুশীলন করুন। কোনো তথ্য লাগে না, তাই অফলাইনেও চলে।",
    mm: "মিমি", total7: "৭ দিনের মোট", maxDay: "সবচেয়ে ভেজা দিন", outlook: "আগামী ৩ দিন",
    liveNote: "লাইভ স্যাটেলাইট তথ্য", demoNote: "ডেমো তথ্য (এই ব্রাউজার থেকে লাইভ তথ্য পাওয়া যায়নি)", latest: "সর্বশেষ স্যাটেলাইট দিন",
    noVoice: "এই ডিভাইসে এই ভাষার ভয়েস নেই; লেখাটি পড়ে নিন।",
    locating: "আপনার অবস্থান খোঁজা হচ্ছে…", loading: "স্যাটেলাইট তথ্য আসছে…", geoFail: "অবস্থান পাওয়া যায়নি।",
    how_html: "স্কোর ০–১০০ = ৪৫% × ৭ দিনের বৃষ্টি (÷১২০ মিমি) + ৩০% × সবচেয়ে ভেজা দিন (÷৭০ মিমি) + ২৫% × আগামী ৩ দিনের পূর্বাভাস (÷৮০ মিমি); প্রতিটির সর্বোচ্চ মান ১। পূর্বাভাস না পেলে বাকি দুটি অনুপাতে বাড়ানো হয়। ৩৫-এর নিচে কম, ৩৫–৬৪ বাড়ছে, ৬৫+ বেশি। নিয়মগুলো ইচ্ছা করেই সহজ রাখা হয়েছে; স্থানীয় কর্তৃপক্ষের মানদণ্ড ভিন্ন হতে পারে।",
    disclaimer: "Storm-Shield একটি সচেতনতার সহায়ক, সরকারি সতর্কবার্তা নয়। সবসময় আবহাওয়া অধিদপ্তর ও স্থানীয় প্রশাসনের নির্দেশ মানুন।" },
  es: {
    tagline: "Datos satelitales de lluvia → una alerta clara para cualquier escuela",
    lang: "Idioma", school: "Ubicación de la escuela", geo: "Mi ubicación", check: "Ver riesgo",
    risk: "Riesgo escolar ahora", sat: "Lluvia por satélite · últimos 7 días", checklist: "Lista de seguridad", quiz: "Quiz de seguridad",
    listen: "🔊 Escuchar", how: "Cómo se calcula el puntaje",
    share: "Compartir sin internet", copy: "Copiar", copied: "Copiado", sms: "Abrir SMS", print: "Imprimir cartel", smsAlert: "Alerta Storm-Shield", savedNote: "Datos guardados (sin conexión)", posterTitle: "Alerta de tormenta escolar", posterWhat: "Qué hacer", shareNote: "El texto SMS y el cartel imprimible funcionan en cualquier teléfono, sin app ni internet.",
    level: { low: "Bajo", mid: "Moderado", high: "Alto" },
    msg: {
      low: "Riesgo bajo. Jornada escolar normal. Revisen el plan de emergencia esta semana.",
      mid: "Riesgo moderado. Se acumula lluvia intensa. Carguen los teléfonos, suban los materiales del suelo e informen al alumnado.",
      high: "Riesgo alto. Es probable lluvia intensa. Sigan las alertas de las autoridades, mantengan al alumnado en interiores y preparen rutas a refugios." },
    list: {
      low: ["Conocer la ruta al refugio", "Tener un teléfono cargado y una linterna", "Compartir el plan con el alumnado"],
      mid: ["Cargar teléfonos y baterías externas", "Subir libros y equipos del suelo", "Informar a las familias cómo será la salida"],
      high: ["Mantener al alumnado adentro y suspender actividades al aire libre", "Ir a la ruta de refugio si lo indican las autoridades", "Atender al alumnado más pequeño y tener a mano la lista de contactos"] },
    quizData: [
      { q: "Durante una alerta de ciclón, ¿dónde debe quedarse el alumnado?", o: ["Junto a las ventanas", "En una sala interior resistente, lejos de las ventanas", "Bajo un árbol"], a: 1, w: "Los vidrios y objetos voladores son el mayor peligro; alejarse de las ventanas." },
      { q: "¿Es seguro caminar por el agua de una inundación?", o: ["Sí, si es poco profunda", "No, puede ocultar huecos y estar sucia o con corriente", "Sí, con sandalias"], a: 1, w: "Incluso poca agua puede ocultar huecos, cables y corrientes fuertes." } ],
    drill: "Simulacro", drillStart: "Iniciar simulacro de 5 minutos", drillEnd: "Terminar simulacro", drillDone: "Simulacro completado", drillNote: "Ensaye los pasos de riesgo alto con un temporizador. No necesita datos, funciona sin conexión.",
    mm: "mm", total7: "Total 7 días", maxDay: "Día más lluvioso", outlook: "Pronóstico 3 días",
    liveNote: "Datos satelitales en vivo", demoNote: "Datos de demostración (sin acceso a datos en vivo desde este navegador)", latest: "Último día satelital",
    noVoice: "No hay voz para este idioma en este dispositivo; lea el texto.",
    locating: "Buscando su ubicación…", loading: "Cargando datos satelitales…", geoFail: "No se pudo obtener su ubicación.",
    how_html: "Puntaje 0–100 = 45% × lluvia de 7 días (÷120 mm) + 30% × día más lluvioso (÷70 mm) + 25% × pronóstico de 3 días (÷80 mm), cada uno con tope 1. Sin pronóstico, los otros dos se reescalan. Menos de 35 es bajo, 35–64 moderado, 65+ alto. Los umbrales son simples a propósito; las autoridades locales pueden usar otros.",
    disclaimer: "Storm-Shield es una ayuda de concienciación, no una alerta oficial. Siga siempre al servicio meteorológico nacional y a las autoridades locales." },
  hi: {
    tagline: "उपग्रह से बारिश का डेटा → हर स्कूल के लिए साफ़ चेतावनी",
    lang: "भाषा", school: "स्कूल का स्थान", geo: "मेरा स्थान", check: "जोखिम देखें",
    risk: "स्कूल का जोखिम अभी", sat: "उपग्रह से बारिश · पिछले 7 दिन", checklist: "सुरक्षा चेकलिस्ट", quiz: "बच्चों की सुरक्षा क्विज़",
    listen: "🔊 सुनें", how: "स्कोर कैसे बनता है",
    share: "बिना इंटरनेट साझा करें", copy: "कॉपी", copied: "कॉपी हुआ", sms: "SMS खोलें", print: "पोस्टर प्रिंट", smsAlert: "Storm-Shield अलर्ट", savedNote: "सहेजा गया डेटा (ऑफ़लाइन)", posterTitle: "स्कूल तूफ़ान चेतावनी", posterWhat: "क्या करें", shareNote: "सादा SMS पाठ और प्रिंट करने योग्य पोस्टर किसी भी फोन पर चलते हैं, ऐप या इंटरनेट नहीं चाहिए।",
    level: { low: "कम", mid: "बढ़ता", high: "अधिक" },
    msg: {
      low: "जोखिम कम है। स्कूल सामान्य रूप से चलेगा। इस सप्ताह आपातकालीन योजना देख लें।",
      mid: "जोखिम बढ़ रहा है। भारी बारिश की संभावना है। फोन चार्ज करें, सामान फर्श से ऊपर रखें और बच्चों को बता दें।",
      high: "जोखिम अधिक है। भारी बारिश की आशंका है। स्थानीय प्रशासन की चेतावनी मानें, बच्चों को भीतर रखें और आश्रय का रास्ता तैयार रखें।" },
    list: {
      low: ["आश्रय का रास्ता जानें", "चार्ज फोन और टॉर्च रखें", "बच्चों के साथ योजना साझा करें"],
      mid: ["फोन और पावर बैंक चार्ज करें", "किताबें और उपकरण फर्श से ऊपर रखें", "अभिभावकों को छुट्टी की योजना बताएँ"],
      high: ["बच्चों को भीतर रखें, बाहर की गतिविधि रोकें", "प्रशासन कहे तो आश्रय के रास्ते पर जाएँ", "छोटे बच्चों का ध्यान रखें, संपर्क सूची तैयार रखें"] },
    quizData: [
      { q: "चक्रवात की चेतावनी में बच्चे कहाँ रहें?", o: ["खिड़कियों के पास", "खिड़कियों से दूर मज़बूत भीतरी कमरे में", "पेड़ के नीचे"], a: 1, w: "उड़ता काँच और मलबा सबसे बड़ा खतरा है, इसलिए खिड़कियों से दूर रहें।" },
      { q: "क्या बाढ़ के पानी में चलना सुरक्षित है?", o: ["हाँ, अगर कम पानी हो", "नहीं, नीचे गड्ढे हो सकते हैं और पानी गंदा या तेज़ हो सकता है", "हाँ, चप्पल पहनकर"], a: 1, w: "कम पानी में भी गड्ढे, तार और तेज़ बहाव छिपे हो सकते हैं।" } ],
    drill: "अभ्यास ड्रिल", drillStart: "5 मिनट की ड्रिल शुरू करें", drillEnd: "ड्रिल समाप्त", drillDone: "ड्रिल पूरी", drillNote: "टाइमर के साथ उच्च जोखिम के कदमों का अभ्यास करें। डेटा नहीं चाहिए, ऑफ़लाइन भी चलता है।",
    mm: "मिमी", total7: "7 दिन का कुल", maxDay: "सबसे गीला दिन", outlook: "अगले 3 दिन",
    liveNote: "लाइव उपग्रह डेटा", demoNote: "डेमो डेटा (इस ब्राउज़र से लाइव डेटा नहीं मिला)", latest: "नवीनतम उपग्रह दिन",
    noVoice: "इस डिवाइस पर इस भाषा की आवाज़ नहीं है; कृपया पाठ पढ़ें।",
    locating: "आपका स्थान खोज रहे हैं…", loading: "उपग्रह डेटा लोड हो रहा है…", geoFail: "आपका स्थान नहीं मिला।",
    how_html: "स्कोर 0–100 = 45% × 7 दिन की बारिश (÷120 मिमी) + 30% × सबसे गीला दिन (÷70 मिमी) + 25% × अगले 3 दिन का पूर्वानुमान (÷80 मिमी), हर एक की अधिकतम सीमा 1। पूर्वानुमान न मिले तो बाकी दो को पुनः मापा जाता है। 35 से कम कम, 35–64 बढ़ता, 65+ अधिक। सीमाएँ जानबूझकर सरल रखी हैं; स्थानीय प्राधिकरण अलग मानक अपना सकते हैं।",
    disclaimer: "Storm-Shield जागरूकता का साधन है, आधिकारिक चेतावनी नहीं। हमेशा राष्ट्रीय मौसम सेवा और स्थानीय प्रशासन की बात मानें।" }
};

Object.assign(T.en, {
  calTitle: "Calibrate to your school", calNote: "Teachers know the local flood history. Enter the rainfall that last flooded your school and the score will use it instead of the generic default.",
  calWeek: "7-day rain that flooded us (mm)", calDay: "One-day rain that flooded us (mm)", calSave: "Save for this place", calReset: "Use default",
  calOn: "Calibrated to this school's flood marks", calOff: "Using generic default marks (120 mm / week, 70 mm / day)", calPct: "Share of your flood mark", calBad: "Enter two numbers above 0.",
});
T.en.how_html += " Schools can replace the 120 mm and 70 mm marks with the rainfall that actually flooded them; the score then measures this week against their own history.";
Object.assign(T.bn, {
  calTitle: "আপনার স্কুলের জন্য মানদণ্ড ঠিক করুন", calNote: "স্থানীয় বন্যার ইতিহাস শিক্ষকরাই জানেন। যে বৃষ্টিতে স্কুলে পানি উঠেছিল তা লিখুন; স্কোর তখন সাধারণ মানের বদলে এটি ব্যবহার করবে।",
  calWeek: "যে ৭ দিনের বৃষ্টিতে পানি উঠেছিল (মিমি)", calDay: "যে একদিনের বৃষ্টিতে পানি উঠেছিল (মিমি)", calSave: "এই স্থানের জন্য সংরক্ষণ", calReset: "সাধারণ মান ব্যবহার",
  calOn: "এই স্কুলের বন্যার চিহ্ন অনুযায়ী ঠিক করা", calOff: "সাধারণ মান ব্যবহার হচ্ছে (সপ্তাহে ১২০ মিমি / দিনে ৭০ মিমি)", calPct: "আপনার বন্যা-চিহ্নের কত অংশ", calBad: "০-র বেশি দুটি সংখ্যা দিন।",
});
T.bn.how_html += " স্কুল ১২০ ও ৭০ মিমি-র বদলে নিজেদের বন্যার সময়ের বৃষ্টি বসাতে পারে; তখন স্কোর এই সপ্তাহকে তাদের নিজস্ব ইতিহাসের সঙ্গে মাপে।";
Object.assign(T.es, {
  calTitle: "Calibrar para su escuela", calNote: "Los docentes conocen el historial local de inundaciones. Ingrese la lluvia que inundó su escuela y el puntaje la usará en lugar del valor genérico.",
  calWeek: "Lluvia de 7 días que nos inundó (mm)", calDay: "Lluvia de un día que nos inundó (mm)", calSave: "Guardar para este lugar", calReset: "Usar valor genérico",
  calOn: "Calibrado con las marcas de inundación de esta escuela", calOff: "Usando marcas genéricas (120 mm / semana, 70 mm / día)", calPct: "Porcentaje de su marca de inundación", calBad: "Ingrese dos números mayores que 0.",
});
T.es.how_html += " Las escuelas pueden reemplazar los 120 mm y 70 mm por la lluvia que realmente las inundó; el puntaje mide entonces esta semana frente a su propia historia.";
Object.assign(T.hi, {
  calTitle: "अपने स्कूल के लिए सेट करें", calNote: "स्थानीय बाढ़ का इतिहास शिक्षक जानते हैं। जिस बारिश से स्कूल में पानी भरा था वह लिखें; स्कोर सामान्य मान की जगह इसे इस्तेमाल करेगा।",
  calWeek: "जिन 7 दिनों की बारिश से पानी भरा (मिमी)", calDay: "जिस एक दिन की बारिश से पानी भरा (मिमी)", calSave: "इस स्थान के लिए सहेजें", calReset: "सामान्य मान लें",
  calOn: "इस स्कूल के बाढ़ चिह्नों के अनुसार सेट", calOff: "सामान्य मान इस्तेमाल हो रहे हैं (120 मिमी / सप्ताह, 70 मिमी / दिन)", calPct: "आपके बाढ़ चिह्न का हिस्सा", calBad: "0 से बड़ी दो संख्याएँ दें।",
});
T.hi.how_html += " स्कूल 120 और 70 मिमी की जगह अपनी असली बाढ़ वाली बारिश रख सकते हैं; तब स्कोर इस सप्ताह को उनके अपने इतिहास से मापता है।";

const DEMO = [4.1, 12.4, 31.0, 55.2, 23.5, 8.0, 2.2];

const $ = (id) => document.getElementById(id);
let lang = "en";
let state = null; // { daily:[{d,v}], forecast:number|null, live:boolean, score, level }

/* ---------- pure logic (exported for tests) ---------- */
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function computeRisk(total7, maxDay, forecast3, cal) {
  // cal = optional school-set flood marks: { week: mm of 7-day rain that flooded the school, day: mm in one day }
  const wk = cal && cal.week > 0 ? cal.week : 120;
  const dy = cal && cal.day > 0 ? cal.day : 70;
  const fr = wk * (80 / 120);
  const a = clamp01(total7 / wk) * 45;
  const b = clamp01(maxDay / dy) * 30;
  let score;
  if (forecast3 == null || Number.isNaN(forecast3)) score = ((a + b) / 75) * 100;
  else score = a + b + clamp01(forecast3 / fr) * 25;
  score = Math.round(Math.max(0, Math.min(100, score)));
  const level = score >= 65 ? "high" : score >= 35 ? "mid" : "low";
  return { score, level };
}

function parsePower(json) {
  const p = json && json.properties && json.properties.parameter && json.properties.parameter.PRECTOTCORR;
  if (!p) throw new Error("no data");
  const rows = Object.keys(p).sort().map((k) => ({ d: k, v: p[k] })).filter((r) => typeof r.v === "number" && r.v >= 0);
  if (rows.length < 3) throw new Error("too few days");
  return rows.slice(-7);
}

if (typeof module !== "undefined") module.exports = { computeRisk, parsePower };
if (typeof document === "undefined") { /* node: stop here */ } else {

/* ---------- data ---------- */
const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");

async function withTimeout(url, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) throw new Error("http " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function fetchNasa(lat, lon) {
  const end = new Date(), start = new Date(Date.now() - 12 * 864e5);
  const url = "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR&community=AG" +
    `&longitude=${lon}&latitude=${lat}&start=${ymd(start)}&end=${ymd(end)}&format=JSON`;
  return parsePower(await withTimeout(url, 15000));
}

async function fetchForecast(lat, lon) {
  try {
    const j = await withTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&forecast_days=3&timezone=auto`, 8000);
    const v = j.daily.precipitation_sum.filter((x) => typeof x === "number");
    return v.length ? v.reduce((s, x) => s + x, 0) : null;
  } catch (e) { return null; }
}

/* ---------- render ---------- */
const fmt = (n) => (Math.round(n * 10) / 10).toString();

function renderStatic() {
  const t = T[lang];
  document.documentElement.lang = lang;
  $("tagline").textContent = t.tagline;
  $("lbl-lang").textContent = t.lang;
  $("lbl-school").textContent = t.school;
  $("btn-geo").textContent = t.geo;
  $("btn-check").textContent = t.check;
  $("h-risk").textContent = t.risk;
  $("h-sat").textContent = t.sat;
  $("h-check").textContent = t.checklist;
  $("h-quiz").textContent = t.quiz;
  $("h-how").textContent = t.how;
  $("how-body").textContent = t.how_html;
  $("disclaimer").textContent = t.disclaimer;
  $("btn-listen").textContent = t.listen;
  renderQuiz();
  renderDrill();
  if (state) renderResult();
}

function renderResult() {
  const t = T[lang], s = state;
  const card = $("risk-card");
  card.dataset.level = s.level;
  $("score").textContent = s.score;
  $("level").textContent = t.level[s.level];
  $("arc").setAttribute("stroke-dasharray", `${s.score} 100`);
  $("alert-text").textContent = t.msg[s.level];

  // checklist
  const ul = $("checklist");
  ul.innerHTML = "";
  t.list[s.level].forEach((txt, i) => {
    const li = document.createElement("li");
    li.innerHTML = '<label><input type="checkbox"><span></span></label>';
    li.querySelector("span").textContent = txt;
    ul.appendChild(li);
  });

  // chart
  const W = 320, H = 150, n = s.daily.length, bw = 28, gap = (W - n * bw) / (n + 1);
  const max = Math.max(10, ...s.daily.map((r) => r.v));
  let bars = "";
  s.daily.forEach((r, i) => {
    const h = Math.max(2, (r.v / max) * 96), x = gap + i * (bw + gap), y = 118 - h;
    bars += `<rect class="bar" x="${x}" y="${y}" width="${bw}" height="${h}" rx="6"/>` +
      `<text class="val" x="${x + bw / 2}" y="${y - 5}">${fmt(r.v)}</text>` +
      `<text x="${x + bw / 2}" y="134">${r.d.slice(6)}/${r.d.slice(4, 6)}</text>`;
  });
  $("chart").innerHTML = `<svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs>${bars}</svg>`;
  $("chart").setAttribute("aria-label", t.sat);

  const total = s.daily.reduce((a, r) => a + r.v, 0), wet = Math.max(...s.daily.map((r) => r.v));
  $("stats").innerHTML =
    `<li>${t.total7}<b>${fmt(total)} ${t.mm}</b></li>` +
    `<li>${t.maxDay}<b>${fmt(wet)} ${t.mm}</b></li>` +
    `<li>${t.outlook}<b>${s.forecast == null ? "–" : fmt(s.forecast) + " " + t.mm}</b></li>` +
    (s.cal ? `<li>${t.calPct}<b>${Math.round((total / s.cal.week) * 100)}%</b></li>` : "");
  const last = s.daily[s.daily.length - 1].d;
  const tag = s.live ? "LIVE" : s.saved ? "SAVED" : "DEMO";
  const lastTxt = `${t.latest}: ${last.slice(0, 4)}-${last.slice(4, 6)}-${last.slice(6)}`;
  $("src-note").innerHTML = `<span class="badge ${s.live ? "live" : "demo"}">${tag}</span>` +
    (s.live ? `${t.liveNote} · ${lastTxt}` : s.saved ? `${t.savedNote} · ${lastTxt}` : t.demoNote);
  renderShare();
  renderCal();
}

function smsText() {
  const t = T[lang], s = state;
  return `${t.smsAlert} · ${s.place}: ${t.level[s.level]} ${s.score}/100. ${t.list[s.level][0]}.`;
}

function renderShare() {
  const t = T[lang], s = state, txt = smsText();
  $("h-share").textContent = t.share;
  $("sms").value = txt;
  $("btn-copy").textContent = t.copy;
  $("btn-sms").textContent = t.sms;
  $("btn-sms").href = "sms:?body=" + encodeURIComponent(txt);
  $("btn-print").textContent = t.print;
  $("share-note").textContent = t.shareNote;
  const items = t.list[s.level].map((x) => `<li>${esc(x)}</li>`).join("");
  $("poster").innerHTML = `<div class="p-head">Storm-Shield</div><h1>${esc(t.posterTitle)}</h1>` +
    `<h2>${esc(s.place)}</h2><div class="p-level p-${s.level}">${esc(t.level[s.level])} · ${s.score}/100</div>` +
    `<p class="p-msg">${esc(t.msg[s.level])}</p><h3>${esc(t.posterWhat)}</h3><ul>${items}</ul>` +
    `<p class="p-foot">${esc(t.disclaimer)} · ${new Date().toISOString().slice(0, 10)}</p>`;
}

function esc(x) { return String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ---------- practice drill ---------- */
let drill = null;
const fmtClock = (n) => String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
const drillLeft = () => Math.max(0, Math.ceil((drill.end - Date.now()) / 1000));

function startDrill() {
  drill = { start: Date.now(), end: Date.now() + 300000, done: new Set(), over: false, elapsed: 0 };
  drill.timer = setInterval(() => {
    if (!drill) return;
    const c = $("drill-clock");
    if (c && !drill.over) c.textContent = fmtClock(drillLeft());
    if (!drill.over && drillLeft() === 0) finishDrill();
  }, 500);
  renderDrill();
}
function finishDrill() {
  drill.over = true;
  drill.elapsed = Math.min(300, Math.round((Date.now() - drill.start) / 1000));
  clearInterval(drill.timer);
  renderDrill();
}
function stopDrill() { if (drill) clearInterval(drill.timer); drill = null; renderDrill(); }

function renderDrill() {
  const t = T[lang], box = $("drill-body"), steps = t.list.high;
  $("h-drill").textContent = t.drill;
  box.innerHTML = "";
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  if (!drill) {
    const b = mk("button", "primary", t.drillStart); b.type = "button"; b.id = "btn-drill"; b.onclick = startDrill;
    box.append(mk("p", "note", t.drillNote), b);
    return;
  }
  const clock = mk("div", "clock" + (drill.over ? " done" : ""), drill.over ? `${t.drillDone}: ${drill.done.size}/${steps.length} · ${fmtClock(drill.elapsed)}` : fmtClock(drillLeft()));
  clock.id = "drill-clock";
  const ul = mk("ul", "checklist");
  steps.forEach((txt, i) => {
    const li = mk("li"), lab = mk("label"), inp = mk("input"), sp = mk("span", null, txt);
    inp.type = "checkbox"; inp.checked = drill.done.has(i); inp.disabled = drill.over;
    inp.onchange = () => { if (inp.checked) drill.done.add(i); else drill.done.delete(i); if (drill.done.size === steps.length) finishDrill(); };
    lab.append(inp, sp); li.append(lab); ul.append(li);
  });
  const end = mk("button", "ghost", t.drillEnd); end.type = "button"; end.onclick = stopDrill;
  box.append(clock, ul, end);
}

function renderQuiz() {
  const box = $("quiz");
  box.innerHTML = "";
  T[lang].quizData.forEach((q) => {
    const wrap = document.createElement("div");
    wrap.className = "q";
    const p = document.createElement("p"); p.textContent = q.q; wrap.appendChild(p);
    const why = document.createElement("p"); why.className = "why"; why.hidden = true; why.textContent = q.w;
    q.o.forEach((o, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.textContent = o;
      b.onclick = () => {
        wrap.querySelectorAll(".opt").forEach((x) => x.classList.remove("ok", "bad"));
        b.classList.add(i === q.a ? "ok" : "bad");
        if (i === q.a) why.hidden = false;
      };
      wrap.appendChild(b);
    });
    wrap.appendChild(why);
    box.appendChild(wrap);
  });
}

/* ---------- school calibration ---------- */
const calKey = (lat, lon) => "ss:cal:" + lat + "," + lon;
function loadCal(lat, lon) {
  try {
    const c = JSON.parse(localStorage.getItem(calKey(lat, lon)));
    if (c && c.week > 0 && c.day > 0) return { week: +c.week, day: +c.day };
  } catch (e) { /* none */ }
  return null;
}
function renderCal() {
  const t = T[lang], cal = state ? state.cal : null;
  $("h-cal").textContent = t.calTitle;
  $("cal-note").textContent = t.calNote;
  $("lbl-cal-week").textContent = t.calWeek;
  $("lbl-cal-day").textContent = t.calDay;
  $("btn-cal-save").textContent = t.calSave;
  $("btn-cal-reset").textContent = t.calReset;
  if (!$("cal-week").dataset.touched) { $("cal-week").value = cal ? cal.week : ""; $("cal-day").value = cal ? cal.day : ""; }
  $("cal-status").textContent = cal ? t.calOn : t.calOff;
  $("cal-status").className = "note cal-" + (cal ? "on" : "off");
}
function saveCal() {
  const week = parseFloat($("cal-week").value), day = parseFloat($("cal-day").value);
  if (!(week > 0 && day > 0)) { $("cal-status").textContent = T[lang].calBad; return; }
  try { localStorage.setItem(calKey(state.lat, state.lon), JSON.stringify({ week, day })); } catch (e) { /* storage unavailable */ }
  $("cal-week").dataset.touched = "";
  recompute(week > 0 ? { week, day } : null);
}
function resetCal() {
  try { localStorage.removeItem(calKey(state.lat, state.lon)); } catch (e) { /* ignore */ }
  $("cal-week").value = ""; $("cal-day").value = ""; $("cal-week").dataset.touched = "";
  recompute(null);
}
function recompute(cal) {
  const s = state, total = s.daily.reduce((a, r) => a + r.v, 0), wet = Math.max(...s.daily.map((r) => r.v));
  const r = computeRisk(total, wet, s.forecast, cal);
  state = Object.assign({}, s, { score: r.score, level: r.level, cal });
  renderResult();
}

/* ---------- actions ---------- */
async function check() {
  const lat = parseFloat($("lat").value), lon = parseFloat($("lon").value);
  if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)) return;
  $("src-note").textContent = T[lang].loading;
  $("btn-check").disabled = true;
  let daily, live = true;
  const [nasa, fc] = await Promise.allSettled([fetchNasa(lat, lon), fetchForecast(lat, lon)]);
  let saved = false;
  const key = "ss:" + lat + "," + lon;
  if (nasa.status === "fulfilled") {
    daily = nasa.value;
    try { localStorage.setItem(key, JSON.stringify({ daily })); } catch (e) { /* storage unavailable */ }
  } else {
    live = false;
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(key)); } catch (e) { cached = null; }
    if (cached && Array.isArray(cached.daily) && cached.daily.length) { daily = cached.daily; saved = true; }
    else {
      const now = new Date();
      daily = DEMO.map((v, i) => ({ d: ymd(new Date(now.getTime() - (DEMO.length - i) * 864e5)), v }));
    }
  }
  const forecast = fc.status === "fulfilled" ? fc.value : null;
  const total = daily.reduce((a, r) => a + r.v, 0), wet = Math.max(...daily.map((r) => r.v));
  const cal = loadCal(lat, lon);
  const { score, level } = computeRisk(total, wet, forecast, cal);
  const opt = $("place").selectedOptions[0];
  const place = opt && opt.value === lat + "," + lon ? opt.textContent : lat.toFixed(2) + ", " + lon.toFixed(2);
  state = { daily, forecast, live, saved, score, level, place, lat, lon, cal };
  renderResult();
  $("btn-check").disabled = false;
}

function listen() {
  const t = T[lang];
  if (!("speechSynthesis" in window) || !state) { $("voice-note").textContent = t.noVoice; return; }
  const code = VOICE[lang];
  const u = new SpeechSynthesisUtterance(t.msg[state.level]);
  u.lang = code;
  const v = speechSynthesis.getVoices().find((x) => x.lang.replace("_", "-").toLowerCase().startsWith(code.slice(0, 2)));
  if (v) { u.voice = v; $("voice-note").textContent = ""; } else $("voice-note").textContent = t.noVoice;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function init() {
  const sel = $("place");
  PRESETS.forEach((g) => {
    const og = document.createElement("optgroup"); og.label = g.g;
    g.items.forEach((p) => {
      const o = document.createElement("option");
      o.value = p.lat + "," + p.lon; o.textContent = p.n; og.appendChild(o);
    });
    sel.appendChild(og);
  });
  const setLL = () => { const [la, lo] = sel.value.split(","); $("lat").value = la; $("lon").value = lo; };
  sel.onchange = () => { setLL(); check(); };
  setLL();
  $("btn-check").onclick = check;
  $("btn-listen").onclick = listen;
  $("btn-cal-save").onclick = saveCal;
  $("btn-cal-reset").onclick = resetCal;
  ["cal-week", "cal-day"].forEach((id) => { $(id).oninput = () => { $("cal-week").dataset.touched = "1"; }; });
  $("btn-print").onclick = () => window.print();
  $("btn-copy").onclick = async () => {
    try { await navigator.clipboard.writeText($("sms").value); } catch (e) { $("sms").select(); document.execCommand("copy"); }
    const b = $("btn-copy"), old = b.textContent; b.textContent = T[lang].copied; setTimeout(() => { b.textContent = old; }, 1500);
  };
  $("btn-geo").onclick = () => {
    if (!navigator.geolocation) { $("src-note").textContent = T[lang].geoFail; return; }
    $("src-note").textContent = T[lang].locating;
    navigator.geolocation.getCurrentPosition(
      (p) => { $("lat").value = p.coords.latitude.toFixed(2); $("lon").value = p.coords.longitude.toFixed(2); check(); },
      () => { $("src-note").textContent = T[lang].geoFail; });
  };
  $("lang").onchange = (e) => { lang = e.target.value; renderStatic(); };
  if ("speechSynthesis" in window) speechSynthesis.getVoices();
  renderStatic();
  check();
}
init();
}
