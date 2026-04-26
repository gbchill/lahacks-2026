// TODO: native-speaker review — placeholder translations for visual scaffolding only.

export type MenuLabels = {
  // Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeContinue: string;
  voicePrompt: string;
  voiceListening: string;
  voiceComingSoon: string;
  voiceDetected: string;
  voiceDetecting: string;
  voiceNotDetected: string;
  voiceNotSupported: string;
  voiceMicDenied: string;

  // Home menu cards
  scanTitle: string;
  scanSubtitle: string;
  callTitle: string;
  callSubtitle: string;
  documentsTitle: string;
  documentsSubtitle: string;
  tagline: string;
  statText: string;
  disclaimer: string;

  // Save-history
  saveHeading: string;
  saveBody: string;
  saveAndAccount: string;
  saveAndAccountSub: string;
  dontSave: string;
  dontSaveSub: string;
  decideLater: string;
  decideLaterSub: string;

  // Header
  goBack: string;

  // Signup
  signupHeading: string;
  signupBody: string;
  signupEmail: string;
  signupPassword: string;
  signupSubmit: string;
  signupSkip: string;
  back: string;

  // Capture
  captureHeading: string;
  captureSubtitle: string;
  captureLoading: string;

  // Camera card
  cameraTitle: string;
  cameraSubtitle: string;
  cameraRetake: string;
  cameraContinue: string;

  // Result
  resultNotFound: string;
  resultTakeNew: string;
  resultContinue: string;
  resultCallOffice: string;
  callDialogTitle: string;
  callDialogBody: (language: string) => string;

  // Explanation card
  explainedIn: (language: string) => string;
  showEnglish: string;
  hideEnglish: string;

  // Toast errors
  toastTooMany: string;
  toastTooManyDesc: string;
  toastReadFailed: string;
  toastReadOcrDesc: string;
  toastTryAgain: string;

  // Family page
  familyTitle: string;
  familySubtitle: string;

  // Agent timeline
  timelineHeading: string;
  timelineDoneFooter: (time: string) => string;
  agentParser: string;
  agentContext: string;
  agentDrafter: string;
  agentTranslator: string;
  agentParserActive: string;
  agentContextActive: string;
  agentDrafterActive: string;
  agentTranslatorActive: string;

  // Similar letters
  similarHeading: string;

  // Key facts
  factsDeadline: string;
  factsAction: string;
  factsAmount: string;

  // Audio player
  audioPlayerLabel: string;
  audioProgress: string;
  play: string;
  pause: string;
};

export const MENU_LABELS: Record<string, MenuLabels> = {
  en: {
    welcomeTitle: "Welcome",
    welcomeSubtitle: "Choose your language",
    welcomeContinue: "Continue",
    voicePrompt: "Or say it out loud",
    voiceListening: "Listening…",
    voiceComingSoon: "Coming soon",
    voiceDetected: "Language detected!",
    voiceDetecting: "Detecting language…",
    voiceNotDetected: "Couldn't detect language — please try again",
    voiceNotSupported: "Speech recognition isn't supported in this browser",
    voiceMicDenied: "Microphone access denied",

    scanTitle: "Scan a letter",
    scanSubtitle: "Take a photo, hear it explained",
    callTitle: "Make a call",
    callSubtitle: "Translated in real time",
    documentsTitle: "My documents",
    documentsSubtitle: "Letters your family has saved",
    tagline: "For the families who never had a translator at home.",
    statText: "Millions of families face language barriers every day. We're here to make communication easier for everyone.",
    disclaimer: "Orision is not responsible for the accuracy or authenticity of uploaded documents. Users should independently verify documents by contacting the issuing office directly.",

    saveHeading: "Save this for next time?",
    saveBody:
      "If you save it, future letters can use what we already learned about your family.",
    saveAndAccount: "Save & create account",
    saveAndAccountSub: "Remember this and future letters",
    dontSave: "Don't save this",
    dontSaveSub: "Leave nothing behind",
    decideLater: "Decide later",
    decideLaterSub: "We'll ask again next time",

    goBack: "Go back",

    signupHeading: "Create your account",
    signupBody: "Just an email and a password — that's it.",
    signupEmail: "Email",
    signupPassword: "Password",
    signupSubmit: "Create account",
    signupSkip: "Skip for now",
    back: "Back",

    captureHeading: "What letter did you get?",
    captureSubtitle: "Take a photo and we'll explain it in your language.",
    captureLoading: "Our agents are reading your document…",

    cameraTitle: "Take a photo of any English letter",
    cameraSubtitle: "Tap to open camera, or drag a photo here",
    cameraRetake: "Retake",
    cameraContinue: "Continue",

    resultNotFound: "Document not found",
    resultTakeNew: "Take a new photo",
    resultContinue: "Continue",
    resultCallOffice: "Call the office",
    callDialogTitle: "Live translated calls",
    callDialogBody: (lang) =>
      `Call any office with real-time translation — coming next. We'll connect you with an interpreter who speaks ${lang}.`,

    explainedIn: (lang) => `Explained in ${lang}`,
    showEnglish: "Show English",
    hideEnglish: "Hide English",

    toastTooMany: "Too many requests",
    toastTooManyDesc:
      "The API is temporarily overloaded. Wait a minute and try again.",
    toastReadFailed: "We couldn't read that photo",
    toastReadOcrDesc: "Try better lighting or a clearer angle.",
    toastTryAgain: "Please try again in a moment.",

    familyTitle: "Family Timeline",
    familySubtitle: "Document history coming next",

    timelineHeading: "4 specialist agents working together",
    timelineDoneFooter: (time) => `Done in ${time}s · 4 agents`,
    agentParser: "Parser",
    agentContext: "Context",
    agentDrafter: "Drafter",
    agentTranslator: "Translator",
    agentParserActive: "Reading the document…",
    agentContextActive: "Looking through your past letters…",
    agentDrafterActive: "Writing the explanation…",
    agentTranslatorActive: "Translating…",

    similarHeading: "We've seen letters like this before",

    factsDeadline: "Deadline",
    factsAction: "Action Required",
    factsAmount: "Amount Due",

    audioPlayerLabel: "Audio player",
    audioProgress: "Audio progress",
    play: "Play",
    pause: "Pause",
  },
  "zh-CN": {
    welcomeTitle: "欢迎",
    welcomeSubtitle: "选择您的语言",
    welcomeContinue: "继续",
    voicePrompt: "或大声说出来",
    voiceListening: "正在聆听…",
    voiceComingSoon: "即将推出",
    voiceDetected: "语言已检测！",
    voiceDetecting: "正在识别语言…",
    voiceNotDetected: "无法检测语言，请再试一次",
    voiceNotSupported: "此浏览器不支持语音识别",
    voiceMicDenied: "麦克风访问被拒绝",

    scanTitle: "扫描信件",
    scanSubtitle: "拍照,听解释",
    callTitle: "拨打电话",
    callSubtitle: "实时翻译",
    documentsTitle: "我的文件",
    documentsSubtitle: "家人保存的信件",
    tagline: "为那些从未在家中拥有翻译的家庭而设。",
    statText: "数百万家庭每天都面临语言障碍。我们在这里,让每个人的沟通都更轻松。",
    disclaimer: "Orision 不对上传文件的准确性或真实性负责。用户应直接联系发出文件的办公室,独立核实文件内容。",

    saveHeading: "保存以备下次使用?",
    saveBody: "如果保存,下次的信件可以参考我们已经了解的家庭情况。",
    saveAndAccount: "保存并创建账户",
    saveAndAccountSub: "记住这封和将来的信件",
    dontSave: "不要保存",
    dontSaveSub: "什么都不留下",
    decideLater: "稍后决定",
    decideLaterSub: "下次再问",

    goBack: "返回",

    signupHeading: "创建您的账户",
    signupBody: "只需邮箱和密码,就这么简单。",
    signupEmail: "邮箱",
    signupPassword: "密码",
    signupSubmit: "创建账户",
    signupSkip: "暂时跳过",
    back: "返回",

    captureHeading: "您收到什么信件?",
    captureSubtitle: "拍一张照片,我们用您的语言为您解释。",
    captureLoading: "我们的助手正在阅读您的文件…",

    cameraTitle: "拍摄任何英文信件的照片",
    cameraSubtitle: "点击打开相机,或将照片拖到此处",
    cameraRetake: "重拍",
    cameraContinue: "继续",

    resultNotFound: "找不到文件",
    resultTakeNew: "重新拍照",
    resultContinue: "继续",
    resultCallOffice: "致电办公室",
    callDialogTitle: "实时翻译通话",
    callDialogBody: (lang) =>
      `致电任何办公室,获得实时翻译——即将推出。我们将为您连接一位讲${lang}的翻译员。`,

    explainedIn: (lang) => `用${lang}解释`,
    showEnglish: "显示英文",
    hideEnglish: "隐藏英文",

    toastTooMany: "请求过多",
    toastTooManyDesc: "服务暂时繁忙,请稍等一分钟再试。",
    toastReadFailed: "我们无法读取这张照片",
    toastReadOcrDesc: "请尝试更好的光线或更清晰的角度。",
    toastTryAgain: "请稍后再试。",

    familyTitle: "家庭时间线",
    familySubtitle: "文件历史即将推出",

    timelineHeading: "4 位专家助手协同工作",
    timelineDoneFooter: (time) => `用时 ${time} 秒 · 4 位助手`,
    agentParser: "解析员",
    agentContext: "背景员",
    agentDrafter: "撰写员",
    agentTranslator: "翻译员",
    agentParserActive: "正在阅读文件…",
    agentContextActive: "正在查看您过去的信件…",
    agentDrafterActive: "正在撰写解释…",
    agentTranslatorActive: "正在翻译…",

    similarHeading: "我们以前见过类似的信件",

    factsDeadline: "截止日期",
    factsAction: "需要采取的行动",
    factsAmount: "应付金额",

    audioPlayerLabel: "音频播放器",
    audioProgress: "音频进度",
    play: "播放",
    pause: "暂停",
  },
  es: {
    welcomeTitle: "Bienvenido",
    welcomeSubtitle: "Elige tu idioma",
    welcomeContinue: "Continuar",
    voicePrompt: "O dilo en voz alta",
    voiceListening: "Escuchando…",
    voiceComingSoon: "Próximamente",
    voiceDetected: "¡Idioma detectado!",
    voiceDetecting: "Detectando idioma…",
    voiceNotDetected: "No se pudo detectar — intenta de nuevo",
    voiceNotSupported: "Reconocimiento de voz no disponible en este navegador",
    voiceMicDenied: "Acceso al micrófono denegado",

    scanTitle: "Escanear una carta",
    scanSubtitle: "Toma una foto, escucha la explicación",
    callTitle: "Hacer una llamada",
    callSubtitle: "Traducción en tiempo real",
    documentsTitle: "Mis documentos",
    documentsSubtitle: "Cartas que tu familia ha guardado",
    tagline: "Para las familias que nunca tuvieron un traductor en casa.",
    statText: "Millones de familias enfrentan barreras de idioma cada día. Estamos aquí para hacer la comunicación más fácil para todos.",
    disclaimer: "Orision no se hace responsable de la exactitud o autenticidad de los documentos cargados. Los usuarios deben verificar los documentos de forma independiente contactando directamente con la oficina emisora.",

    saveHeading: "¿Guardar para la próxima vez?",
    saveBody:
      "Si lo guardas, las próximas cartas podrán usar lo que ya sabemos de tu familia.",
    saveAndAccount: "Guardar y crear cuenta",
    saveAndAccountSub: "Recuerda esta y futuras cartas",
    dontSave: "No guardar",
    dontSaveSub: "No dejar nada",
    decideLater: "Decidir más tarde",
    decideLaterSub: "Te preguntaremos la próxima vez",

    goBack: "Volver",

    signupHeading: "Crea tu cuenta",
    signupBody: "Solo un correo y una contraseña — eso es todo.",
    signupEmail: "Correo electrónico",
    signupPassword: "Contraseña",
    signupSubmit: "Crear cuenta",
    signupSkip: "Omitir por ahora",
    back: "Atrás",

    captureHeading: "¿Qué carta recibiste?",
    captureSubtitle: "Toma una foto y te la explicaremos en tu idioma.",
    captureLoading: "Nuestros agentes están leyendo tu documento…",

    cameraTitle: "Toma una foto de cualquier carta en inglés",
    cameraSubtitle: "Toca para abrir la cámara, o arrastra una foto aquí",
    cameraRetake: "Volver a tomar",
    cameraContinue: "Continuar",

    resultNotFound: "Documento no encontrado",
    resultTakeNew: "Tomar una nueva foto",
    resultContinue: "Continuar",
    resultCallOffice: "Llamar a la oficina",
    callDialogTitle: "Llamadas con traducción en vivo",
    callDialogBody: (lang) =>
      `Llama a cualquier oficina con traducción en tiempo real — próximamente. Te conectaremos con un intérprete que hable ${lang}.`,

    explainedIn: (lang) => `Explicado en ${lang}`,
    showEnglish: "Mostrar inglés",
    hideEnglish: "Ocultar inglés",

    toastTooMany: "Demasiadas solicitudes",
    toastTooManyDesc:
      "El servicio está temporalmente saturado. Espera un minuto e inténtalo de nuevo.",
    toastReadFailed: "No pudimos leer esa foto",
    toastReadOcrDesc: "Intenta con mejor iluminación o un ángulo más claro.",
    toastTryAgain: "Por favor, inténtalo de nuevo en un momento.",

    familyTitle: "Cronología familiar",
    familySubtitle: "El historial de documentos llegará pronto",

    timelineHeading: "4 agentes especializados trabajando juntos",
    timelineDoneFooter: (time) => `Listo en ${time}s · 4 agentes`,
    agentParser: "Lector",
    agentContext: "Contexto",
    agentDrafter: "Redactor",
    agentTranslator: "Traductor",
    agentParserActive: "Leyendo el documento…",
    agentContextActive: "Revisando tus cartas anteriores…",
    agentDrafterActive: "Escribiendo la explicación…",
    agentTranslatorActive: "Traduciendo…",

    similarHeading: "Ya hemos visto cartas como esta",

    factsDeadline: "Fecha límite",
    factsAction: "Acción requerida",
    factsAmount: "Cantidad a pagar",

    audioPlayerLabel: "Reproductor de audio",
    audioProgress: "Progreso del audio",
    play: "Reproducir",
    pause: "Pausar",
  },
  vi: {
    welcomeTitle: "Chào mừng",
    welcomeSubtitle: "Chọn ngôn ngữ của bạn",
    welcomeContinue: "Tiếp tục",
    voicePrompt: "Hoặc nói to lên",
    voiceListening: "Đang nghe…",
    voiceComingSoon: "Sắp ra mắt",
    voiceDetected: "Đã nhận ra ngôn ngữ!",
    voiceDetecting: "Đang nhận dạng ngôn ngữ…",
    voiceNotDetected: "Không nhận ra ngôn ngữ — vui lòng thử lại",
    voiceNotSupported: "Trình duyệt không hỗ trợ nhận dạng giọng nói",
    voiceMicDenied: "Quyền truy cập microphone bị từ chối",

    scanTitle: "Quét một lá thư",
    scanSubtitle: "Chụp ảnh, nghe giải thích",
    callTitle: "Gọi điện thoại",
    callSubtitle: "Dịch theo thời gian thực",
    documentsTitle: "Tài liệu của tôi",
    documentsSubtitle: "Những lá thư gia đình đã lưu",
    tagline: "Dành cho những gia đình chưa bao giờ có người phiên dịch ở nhà.",
    statText: "Hàng triệu gia đình phải đối mặt với rào cản ngôn ngữ mỗi ngày. Chúng tôi ở đây để giúp việc giao tiếp dễ dàng hơn cho mọi người.",
    disclaimer: "Orision không chịu trách nhiệm về tính chính xác hoặc tính xác thực của các tài liệu được tải lên. Người dùng nên tự xác minh tài liệu bằng cách liên hệ trực tiếp với văn phòng phát hành.",

    saveHeading: "Lưu cho lần sau?",
    saveBody:
      "Nếu bạn lưu, những lá thư sau có thể dùng những gì chúng tôi đã biết về gia đình bạn.",
    saveAndAccount: "Lưu và tạo tài khoản",
    saveAndAccountSub: "Ghi nhớ lá thư này và các lá thư sau",
    dontSave: "Không lưu",
    dontSaveSub: "Không để lại gì",
    decideLater: "Quyết định sau",
    decideLaterSub: "Chúng tôi sẽ hỏi lại lần sau",

    goBack: "Quay lại",

    signupHeading: "Tạo tài khoản của bạn",
    signupBody: "Chỉ cần email và mật khẩu — chỉ vậy thôi.",
    signupEmail: "Email",
    signupPassword: "Mật khẩu",
    signupSubmit: "Tạo tài khoản",
    signupSkip: "Bỏ qua",
    back: "Trở lại",

    captureHeading: "Bạn đã nhận được lá thư gì?",
    captureSubtitle: "Chụp một bức ảnh và chúng tôi sẽ giải thích bằng ngôn ngữ của bạn.",
    captureLoading: "Các trợ lý của chúng tôi đang đọc tài liệu của bạn…",

    cameraTitle: "Chụp ảnh bất kỳ lá thư tiếng Anh nào",
    cameraSubtitle: "Chạm để mở máy ảnh, hoặc kéo ảnh vào đây",
    cameraRetake: "Chụp lại",
    cameraContinue: "Tiếp tục",

    resultNotFound: "Không tìm thấy tài liệu",
    resultTakeNew: "Chụp ảnh mới",
    resultContinue: "Tiếp tục",
    resultCallOffice: "Gọi văn phòng",
    callDialogTitle: "Cuộc gọi dịch trực tiếp",
    callDialogBody: (lang) =>
      `Gọi bất kỳ văn phòng nào với bản dịch thời gian thực — sắp ra mắt. Chúng tôi sẽ kết nối bạn với một thông dịch viên nói ${lang}.`,

    explainedIn: (lang) => `Giải thích bằng ${lang}`,
    showEnglish: "Hiện tiếng Anh",
    hideEnglish: "Ẩn tiếng Anh",

    toastTooMany: "Quá nhiều yêu cầu",
    toastTooManyDesc:
      "Dịch vụ tạm thời quá tải. Vui lòng đợi một phút và thử lại.",
    toastReadFailed: "Chúng tôi không thể đọc được bức ảnh đó",
    toastReadOcrDesc: "Hãy thử với ánh sáng tốt hơn hoặc góc rõ hơn.",
    toastTryAgain: "Vui lòng thử lại sau một lát.",

    familyTitle: "Dòng thời gian gia đình",
    familySubtitle: "Lịch sử tài liệu sắp ra mắt",

    timelineHeading: "4 trợ lý chuyên môn làm việc cùng nhau",
    timelineDoneFooter: (time) => `Hoàn thành trong ${time}s · 4 trợ lý`,
    agentParser: "Người đọc",
    agentContext: "Bối cảnh",
    agentDrafter: "Người soạn",
    agentTranslator: "Người dịch",
    agentParserActive: "Đang đọc tài liệu…",
    agentContextActive: "Đang xem qua các lá thư trước của bạn…",
    agentDrafterActive: "Đang viết phần giải thích…",
    agentTranslatorActive: "Đang dịch…",

    similarHeading: "Chúng tôi đã thấy những lá thư như thế này trước đây",

    factsDeadline: "Hạn chót",
    factsAction: "Hành động cần thiết",
    factsAmount: "Số tiền phải trả",

    audioPlayerLabel: "Trình phát âm thanh",
    audioProgress: "Tiến trình âm thanh",
    play: "Phát",
    pause: "Tạm dừng",
  },
  ro: {
    welcomeTitle: "Bun venit",
    welcomeSubtitle: "Alegeți limba dumneavoastră",
    welcomeContinue: "Continuați",
    voicePrompt: "Sau spuneți cu voce tare",
    voiceListening: "Ascult…",
    voiceComingSoon: "În curând",
    voiceDetected: "Limbă detectată!",
    voiceDetecting: "Se detectează limba…",
    voiceNotDetected: "Nu s-a detectat limba — încercați din nou",
    voiceNotSupported: "Recunoașterea vocală nu este disponibilă în acest browser",
    voiceMicDenied: "Accesul la microfon a fost refuzat",

    scanTitle: "Scanați o scrisoare",
    scanSubtitle: "Faceți o fotografie, ascultați explicația",
    callTitle: "Apel telefonic",
    callSubtitle: "Traducere în timp real",
    documentsTitle: "Documentele mele",
    documentsSubtitle: "Scrisori salvate de familia dumneavoastră",
    tagline: "Pentru familiile care nu au avut niciodată un traducător acasă.",
    statText: "Milioane de familii se confruntă zilnic cu bariere lingvistice. Suntem aici pentru a face comunicarea mai ușoară pentru toți.",
    disclaimer: "Orision nu este responsabilă pentru acuratețea sau autenticitatea documentelor încărcate. Utilizatorii trebuie să verifice documentele în mod independent contactând direct biroul emitent.",

    saveHeading: "Salvați pentru data viitoare?",
    saveBody:
      "Dacă salvați, scrisorile viitoare pot folosi ce știm deja despre familia dumneavoastră.",
    saveAndAccount: "Salvați și creați cont",
    saveAndAccountSub: "Rețineți această scrisoare și cele viitoare",
    dontSave: "Nu salvați",
    dontSaveSub: "Nu lăsați nimic în urmă",
    decideLater: "Decideți mai târziu",
    decideLaterSub: "Vă vom întreba data viitoare",

    goBack: "Înapoi",

    signupHeading: "Creați-vă contul",
    signupBody: "Doar un email și o parolă — atât.",
    signupEmail: "Email",
    signupPassword: "Parolă",
    signupSubmit: "Creați cont",
    signupSkip: "Omiteți deocamdată",
    back: "Înapoi",

    captureHeading: "Ce scrisoare ați primit?",
    captureSubtitle: "Faceți o fotografie și o vom explica în limba dumneavoastră.",
    captureLoading: "Asistenții noștri vă citesc documentul…",

    cameraTitle: "Faceți o fotografie a oricărei scrisori în engleză",
    cameraSubtitle: "Atingeți pentru a deschide camera sau trageți o fotografie aici",
    cameraRetake: "Refaceți",
    cameraContinue: "Continuați",

    resultNotFound: "Document negăsit",
    resultTakeNew: "Faceți o fotografie nouă",
    resultContinue: "Continuați",
    resultCallOffice: "Sunați la birou",
    callDialogTitle: "Apeluri cu traducere în direct",
    callDialogBody: (lang) =>
      `Sunați la orice birou cu traducere în timp real — în curând. Vă vom conecta cu un interpret care vorbește ${lang}.`,

    explainedIn: (lang) => `Explicat în ${lang}`,
    showEnglish: "Afișați engleza",
    hideEnglish: "Ascundeți engleza",

    toastTooMany: "Prea multe cereri",
    toastTooManyDesc:
      "Serviciul este temporar suprasolicitat. Așteptați un minut și încercați din nou.",
    toastReadFailed: "Nu am putut citi acea fotografie",
    toastReadOcrDesc: "Încercați cu o iluminare mai bună sau un unghi mai clar.",
    toastTryAgain: "Vă rugăm să încercați din nou peste o clipă.",

    familyTitle: "Cronologia familiei",
    familySubtitle: "Istoricul documentelor în curând",

    timelineHeading: "4 asistenți specialiști lucrând împreună",
    timelineDoneFooter: (time) => `Gata în ${time}s · 4 asistenți`,
    agentParser: "Cititor",
    agentContext: "Context",
    agentDrafter: "Redactor",
    agentTranslator: "Traducător",
    agentParserActive: "Citește documentul…",
    agentContextActive: "Verifică scrisorile dumneavoastră anterioare…",
    agentDrafterActive: "Scrie explicația…",
    agentTranslatorActive: "Traduce…",

    similarHeading: "Am mai văzut scrisori ca aceasta",

    factsDeadline: "Termen limită",
    factsAction: "Acțiune necesară",
    factsAmount: "Sumă de plată",

    audioPlayerLabel: "Player audio",
    audioProgress: "Progresul audio",
    play: "Redare",
    pause: "Pauză",
  },
};

export function getLabels(code: string | null): MenuLabels {
  if (!code) return MENU_LABELS.en;
  return MENU_LABELS[code] ?? MENU_LABELS.en;
}

// The native name of a language (used inside template strings like "Explained in {lang}")
const NATIVE_NAMES: Record<string, string> = {
  "zh-CN": "中文",
  es: "Español",
  vi: "Tiếng Việt",
  ro: "Română",
  en: "English",
};

export function getNativeName(code: string | null): string {
  if (!code) return "English";
  return NATIVE_NAMES[code] ?? code;
}
