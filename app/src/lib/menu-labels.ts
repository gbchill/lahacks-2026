// TODO: native-speaker review — placeholder translations for visual scaffolding only.

export type MenuLabels = {
  // Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeContinue: string;
  welcomeSignIn: string;
  voicePrompt: string;
  voiceListening: string;
  voiceComingSoon: string;
  voiceDetected: string;
  voiceDetecting: string;
  voiceNotDetected: string;
  voiceNotSupported: string;
  voiceMicDenied: string;

  // Home menu cards
  homeGreeting: string;
  scanTitle: string;
  scanSubtitle: string;
  callTitle: string;
  callSubtitle: string;
  documentsTitle: string;
  documentsSubtitle: string;
  tagline: string;
  statText: string;
  termsAgree: string;

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

  // Login
  loginHeading: string;
  loginSubmit: string;
  loginNoAccount: string;
  loginCreateAccount: string;
  loginContinueWithout: string;

  // Signup
  signupHeading: string;
  signupBody: string;
  signupEmail: string;
  signupPassword: string;
  signupSubmit: string;
  signupSkip: string;
  signupHasAccount: string;
  signupSignIn: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  back: string;
  continueWithGoogle: string;

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
  resultSaved: string;
  resultSavePrompt: string;
  resultCreateAccount: string;
  resultNotNow: string;
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

  // Bottom tab bar
  tabHome: string;
  tabScan: string;
  tabDocuments: string;
  tabProfile: string;

  // Account page
  accountTitle: string;
  accountLanguage: string;
  accountVoice: string;
  accountVoiceSet: string;
  accountVoiceRecord: string;
  accountSignOut: string;

  // Onboarding wizard
  onboardingProfile: string;
  onboardingName: string;
  onboardingRelationship: string;
  onboardingParent: string;
  onboardingChild: string;
  onboardingFamily: string;
  onboardingLanguage: string;
  onboardingLanguageDesc: string;
  onboardingVoiceTitle: string;
  onboardingVoiceDesc: string;
  onboardingVoiceRecorded: string;
  onboardingSkip: string;
  onboardingFinish: string;
  onboardingContinue: string;

  // Call dialog
  callReady: string;
  callConnecting: string;
  callActive: string;
  callEnded: string;
  callWaitingAudio: string;
  callOfficeLabel: string;
  callYouLabel: string;
  callStart: string;
  callEnd: string;
  callAgain: string;
  callPhoneLabel: string;

  // Chat section (home page)
  chatTitle: string;
  chatSubtitle: string;
  chatPlaceholder: string;
  chatSendLabel: string;
  chatEmptyTitle: string;
  chatEmptyBody: string;
  chatEmptyLink: string;
  chatThinking: string;
  chatError: string;
};

export const MENU_LABELS: Record<string, MenuLabels> = {
  en: {
    welcomeTitle: "Welcome",
    welcomeSubtitle: "Choose your language",
    welcomeContinue: "Continue",
    welcomeSignIn: "Already have an account? Sign in",
    voicePrompt: "Or say it out loud",
    voiceListening: "Listening…",
    voiceComingSoon: "Coming soon",
    voiceDetected: "Language detected!",
    voiceDetecting: "Detecting language…",
    voiceNotDetected: "Couldn't detect language — please try again",
    voiceNotSupported: "Speech recognition isn't supported in this browser",
    voiceMicDenied: "Microphone access denied",

    homeGreeting: "Good morning",
    scanTitle: "Scan a document",
    scanSubtitle: "Take a photo, hear it explained",
    callTitle: "Make a call",
    callSubtitle: "Translated in real time",
    documentsTitle: "My documents",
    documentsSubtitle: "Letters your family has saved",
    tagline: "For the families who never had a translator at home.",
    statText: "Millions of families face language barriers every day. We're here to make communication easier for everyone.",
    termsAgree: "I agree to the Orision Terms of Service",

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

    loginHeading: "Welcome back",
    loginSubmit: "Sign in",
    loginNoAccount: "Don't have an account?",
    loginCreateAccount: "Create one",
    loginContinueWithout: "Continue without account",

    signupHeading: "Create your account",
    signupBody: "Just an email and a password — that's it.",
    signupEmail: "Email",
    signupPassword: "Password",
    signupSubmit: "Create account",
    signupSkip: "Skip for now",
    signupHasAccount: "Already have an account?",
    signupSignIn: "Sign in",
    emailPlaceholder: "Email address",
    passwordPlaceholder: "Password",
    back: "Back",
    continueWithGoogle: "Continue with Google",

    captureHeading: "What document did you receive?",
    captureSubtitle: "Snap a photo and we'll explain it in your language.",
    captureLoading: "Our agents are reading your document…",

    cameraTitle: "Upload the document you would like translated",
    cameraSubtitle: "Tap to open camera, or drag a photo here",
    cameraRetake: "Retake",
    cameraContinue: "Continue",

    resultNotFound: "Document not found",
    resultTakeNew: "Take a new photo",
    resultContinue: "Continue",
    resultCallOffice: "Call the office",
    resultSaved: "Saved to your documents",
    resultSavePrompt: "Save this to your history",
    resultCreateAccount: "Create free account",
    resultNotNow: "Not now",
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

    tabHome: "Home",
    tabScan: "Scan",
    tabDocuments: "Documents",
    tabProfile: "Profile",

    accountTitle: "Account",
    accountLanguage: "Language",
    accountVoice: "Voice",
    accountVoiceSet: "Your voice is set up",
    accountVoiceRecord: "Record your voice",
    accountSignOut: "Sign out",

    onboardingProfile: "Tell us about yourself",
    onboardingName: "Your name",
    onboardingRelationship: "I am a...",
    onboardingParent: "Parent",
    onboardingChild: "Child (18+)",
    onboardingFamily: "Family member",
    onboardingLanguage: "Your preferred language",
    onboardingLanguageDesc: "We'll explain all documents in this language",
    onboardingVoiceTitle: "Record your voice",
    onboardingVoiceDesc: "Hear documents read back in a familiar voice",
    onboardingVoiceRecorded: "Your voice has been recorded!",
    onboardingSkip: "Skip for now",
    onboardingFinish: "Finish",
    onboardingContinue: "Continue",

    callReady: "Ready",
    callConnecting: "Connecting…",
    callActive: "In Call",
    callEnded: "Call Ended",
    callWaitingAudio: "Waiting for audio…",
    callOfficeLabel: "Office",
    callYouLabel: "You",
    callStart: "Start Call",
    callEnd: "End Call",
    callAgain: "Call Again",
    callPhoneLabel: "Office phone number",

    chatTitle: "Ask about your documents",
    chatSubtitle: "I know all your family's letters",
    chatPlaceholder: "Ask anything about your documents…",
    chatSendLabel: "Send",
    chatEmptyTitle: "Scan your first document to start chatting",
    chatEmptyBody: "Once you've scanned a letter, I can answer questions about it in your language.",
    chatEmptyLink: "Scan a document",
    chatThinking: "Thinking…",
    chatError: "Something went wrong. Please try again.",
  },
  "zh-CN": {
    welcomeTitle: "欢迎",
    welcomeSubtitle: "选择您的语言",
    welcomeContinue: "继续",
    welcomeSignIn: "已有账户？登录",
    voicePrompt: "或大声说出来",
    voiceListening: "正在聆听…",
    voiceComingSoon: "即将推出",
    voiceDetected: "语言已检测！",
    voiceDetecting: "正在识别语言…",
    voiceNotDetected: "无法检测语言，请再试一次",
    voiceNotSupported: "此浏览器不支持语音识别",
    voiceMicDenied: "麦克风访问被拒绝",

    homeGreeting: "早上好",
    scanTitle: "扫描信件",
    scanSubtitle: "拍照,听解释",
    callTitle: "拨打电话",
    callSubtitle: "实时翻译",
    documentsTitle: "我的文件",
    documentsSubtitle: "家人保存的信件",
    tagline: "为那些从未在家中拥有翻译的家庭而设。",
    statText: "数百万家庭每天都面临语言障碍。我们在这里,让每个人的沟通都更轻松。",
    termsAgree: "我同意 Orision 服务条款",

    saveHeading: "保存以备下次使用?",
    saveBody: "如果保存,下次的信件可以参考我们已经了解的家庭情况。",
    saveAndAccount: "保存并创建账户",
    saveAndAccountSub: "记住这封和将来的信件",
    dontSave: "不要保存",
    dontSaveSub: "什么都不留下",
    decideLater: "稍后决定",
    decideLaterSub: "下次再问",

    goBack: "返回",

    loginHeading: "欢迎回来",
    loginSubmit: "登录",
    loginNoAccount: "没有账户？",
    loginCreateAccount: "创建",
    loginContinueWithout: "无需账户继续",

    signupHeading: "创建您的账户",
    signupBody: "只需邮箱和密码,就这么简单。",
    signupEmail: "邮箱",
    signupPassword: "密码",
    signupSubmit: "创建账户",
    signupSkip: "暂时跳过",
    signupHasAccount: "已有账户？",
    signupSignIn: "登录",
    emailPlaceholder: "电子邮箱",
    passwordPlaceholder: "密码",
    back: "返回",
    continueWithGoogle: "通过 Google 继续",

    captureHeading: "您收到了什么文件？",
    captureSubtitle: "拍张照片，我们用您的语言为您解释。",
    captureLoading: "我们的助手正在阅读您的文件…",

    cameraTitle: "上传您想翻译的文件",
    cameraSubtitle: "点击打开相机,或将照片拖到此处",
    cameraRetake: "重拍",
    cameraContinue: "继续",

    resultNotFound: "找不到文件",
    resultTakeNew: "重新拍照",
    resultContinue: "继续",
    resultCallOffice: "致电办公室",
    resultSaved: "已保存到您的文件",
    resultSavePrompt: "将此保存到您的历史记录",
    resultCreateAccount: "免费创建账户",
    resultNotNow: "暂不",
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

    tabHome: "首页",
    tabScan: "扫描",
    tabDocuments: "文件",
    tabProfile: "个人",

    accountTitle: "账户",
    accountLanguage: "语言",
    accountVoice: "声音",
    accountVoiceSet: "您的声音已设置",
    accountVoiceRecord: "录制您的声音",
    accountSignOut: "退出登录",

    onboardingProfile: "告诉我们关于你",
    onboardingName: "你的名字",
    onboardingRelationship: "我是...",
    onboardingParent: "父母",
    onboardingChild: "子女 (18+)",
    onboardingFamily: "家庭成员",
    onboardingLanguage: "你的首选语言",
    onboardingLanguageDesc: "我们将用此语言解释所有文件",
    onboardingVoiceTitle: "录制你的声音",
    onboardingVoiceDesc: "用熟悉的声音听文件朗读",
    onboardingVoiceRecorded: "你的声音已录制！",
    onboardingSkip: "暂时跳过",
    onboardingFinish: "完成",
    onboardingContinue: "继续",

    callReady: "准备就绪",
    callConnecting: "连接中…",
    callActive: "通话中",
    callEnded: "通话结束",
    callWaitingAudio: "等待音频…",
    callOfficeLabel: "办公室",
    callYouLabel: "您",
    callStart: "开始通话",
    callEnd: "结束通话",
    callAgain: "再次通话",
    callPhoneLabel: "办公室电话号码",

    chatTitle: "询问您的文件",
    chatSubtitle: "我了解您家庭的所有信件",
    chatPlaceholder: "询问有关文件的任何问题…",
    chatSendLabel: "发送",
    chatEmptyTitle: "扫描您的第一份文件以开始聊天",
    chatEmptyBody: "扫描信件后,我可以用您的语言回答相关问题。",
    chatEmptyLink: "扫描文件",
    chatThinking: "思考中…",
    chatError: "出现问题,请重试。",
  },
  es: {
    welcomeTitle: "Bienvenido",
    welcomeSubtitle: "Elige tu idioma",
    welcomeContinue: "Continuar",
    welcomeSignIn: "¿Ya tienes una cuenta? Inicia sesión",
    voicePrompt: "O dilo en voz alta",
    voiceListening: "Escuchando…",
    voiceComingSoon: "Próximamente",
    voiceDetected: "¡Idioma detectado!",
    voiceDetecting: "Detectando idioma…",
    voiceNotDetected: "No se pudo detectar — intenta de nuevo",
    voiceNotSupported: "Reconocimiento de voz no disponible en este navegador",
    voiceMicDenied: "Acceso al micrófono denegado",

    homeGreeting: "Buenos días",
    scanTitle: "Escanear una carta",
    scanSubtitle: "Toma una foto, escucha la explicación",
    callTitle: "Hacer una llamada",
    callSubtitle: "Traducción en tiempo real",
    documentsTitle: "Mis documentos",
    documentsSubtitle: "Cartas que tu familia ha guardado",
    tagline: "Para las familias que nunca tuvieron un traductor en casa.",
    statText: "Millones de familias enfrentan barreras de idioma cada día. Estamos aquí para hacer la comunicación más fácil para todos.",
    termsAgree: "Acepto los Términos de Servicio de Orision",

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

    loginHeading: "Bienvenido",
    loginSubmit: "Iniciar sesión",
    loginNoAccount: "¿No tienes cuenta?",
    loginCreateAccount: "Crear una",
    loginContinueWithout: "Continuar sin cuenta",

    signupHeading: "Crea tu cuenta",
    signupBody: "Solo un correo y una contraseña — eso es todo.",
    signupEmail: "Correo electrónico",
    signupPassword: "Contraseña",
    signupSubmit: "Crear cuenta",
    signupSkip: "Omitir por ahora",
    signupHasAccount: "¿Ya tienes cuenta?",
    signupSignIn: "Inicia sesión",
    emailPlaceholder: "Correo electrónico",
    passwordPlaceholder: "Contraseña",
    back: "Atrás",
    continueWithGoogle: "Continuar con Google",

    captureHeading: "¿Qué documento recibiste?",
    captureSubtitle: "Toma una foto y te lo explicamos en tu idioma.",
    captureLoading: "Nuestros agentes están leyendo tu documento…",

    cameraTitle: "Sube el documento que quieres traducir",
    cameraSubtitle: "Toca para abrir la cámara, o arrastra una foto aquí",
    cameraRetake: "Volver a tomar",
    cameraContinue: "Continuar",

    resultNotFound: "Documento no encontrado",
    resultTakeNew: "Tomar una nueva foto",
    resultContinue: "Continuar",
    resultCallOffice: "Llamar a la oficina",
    resultSaved: "Guardado en tus documentos",
    resultSavePrompt: "Guarda esto en tu historial",
    resultCreateAccount: "Crear cuenta gratis",
    resultNotNow: "Ahora no",
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

    tabHome: "Inicio",
    tabScan: "Escanear",
    tabDocuments: "Documentos",
    tabProfile: "Perfil",

    accountTitle: "Cuenta",
    accountLanguage: "Idioma",
    accountVoice: "Voz",
    accountVoiceSet: "Tu voz está configurada",
    accountVoiceRecord: "Graba tu voz",
    accountSignOut: "Cerrar sesión",

    onboardingProfile: "Cuéntanos sobre ti",
    onboardingName: "Tu nombre",
    onboardingRelationship: "Soy un/a...",
    onboardingParent: "Padre/Madre",
    onboardingChild: "Hijo/a (18+)",
    onboardingFamily: "Familiar",
    onboardingLanguage: "Tu idioma preferido",
    onboardingLanguageDesc: "Explicaremos todos los documentos en este idioma",
    onboardingVoiceTitle: "Graba tu voz",
    onboardingVoiceDesc: "Escucha documentos en una voz familiar",
    onboardingVoiceRecorded: "¡Tu voz ha sido grabada!",
    onboardingSkip: "Omitir por ahora",
    onboardingFinish: "Terminar",
    onboardingContinue: "Continuar",

    callReady: "Listo",
    callConnecting: "Conectando…",
    callActive: "En llamada",
    callEnded: "Llamada finalizada",
    callWaitingAudio: "Esperando audio…",
    callOfficeLabel: "Oficina",
    callYouLabel: "Tú",
    callStart: "Iniciar llamada",
    callEnd: "Finalizar llamada",
    callAgain: "Llamar de nuevo",
    callPhoneLabel: "Número de la oficina",

    chatTitle: "Pregunta sobre tus documentos",
    chatSubtitle: "Conozco todas las cartas de tu familia",
    chatPlaceholder: "Pregunta cualquier cosa sobre tus documentos…",
    chatSendLabel: "Enviar",
    chatEmptyTitle: "Escanea tu primer documento para chatear",
    chatEmptyBody: "Después de escanear una carta, puedo responder preguntas en tu idioma.",
    chatEmptyLink: "Escanear un documento",
    chatThinking: "Pensando…",
    chatError: "Algo salió mal. Intenta de nuevo.",
  },
  vi: {
    welcomeTitle: "Chào mừng",
    welcomeSubtitle: "Chọn ngôn ngữ của bạn",
    welcomeContinue: "Tiếp tục",
    welcomeSignIn: "Đã có tài khoản? Đăng nhập",
    voicePrompt: "Hoặc nói to lên",
    voiceListening: "Đang nghe…",
    voiceComingSoon: "Sắp ra mắt",
    voiceDetected: "Đã nhận ra ngôn ngữ!",
    voiceDetecting: "Đang nhận dạng ngôn ngữ…",
    voiceNotDetected: "Không nhận ra ngôn ngữ — vui lòng thử lại",
    voiceNotSupported: "Trình duyệt không hỗ trợ nhận dạng giọng nói",
    voiceMicDenied: "Quyền truy cập microphone bị từ chối",

    homeGreeting: "Chào buổi sáng",
    scanTitle: "Quét một lá thư",
    scanSubtitle: "Chụp ảnh, nghe giải thích",
    callTitle: "Gọi điện thoại",
    callSubtitle: "Dịch theo thời gian thực",
    documentsTitle: "Tài liệu của tôi",
    documentsSubtitle: "Những lá thư gia đình đã lưu",
    tagline: "Dành cho những gia đình chưa bao giờ có người phiên dịch ở nhà.",
    statText: "Hàng triệu gia đình phải đối mặt với rào cản ngôn ngữ mỗi ngày. Chúng tôi ở đây để giúp việc giao tiếp dễ dàng hơn cho mọi người.",
    termsAgree: "Tôi đồng ý với Điều khoản Dịch vụ của Orision",

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

    loginHeading: "Chào mừng trở lại",
    loginSubmit: "Đăng nhập",
    loginNoAccount: "Chưa có tài khoản?",
    loginCreateAccount: "Tạo tài khoản",
    loginContinueWithout: "Tiếp tục không cần tài khoản",

    signupHeading: "Tạo tài khoản của bạn",
    signupBody: "Chỉ cần email và mật khẩu — chỉ vậy thôi.",
    signupEmail: "Email",
    signupPassword: "Mật khẩu",
    signupSubmit: "Tạo tài khoản",
    signupSkip: "Bỏ qua",
    signupHasAccount: "Đã có tài khoản?",
    signupSignIn: "Đăng nhập",
    emailPlaceholder: "Địa chỉ email",
    passwordPlaceholder: "Mật khẩu",
    back: "Trở lại",
    continueWithGoogle: "Tiếp tục với Google",

    captureHeading: "Bạn đã nhận được tài liệu gì?",
    captureSubtitle: "Chụp ảnh và chúng tôi sẽ giải thích bằng ngôn ngữ của bạn.",
    captureLoading: "Các trợ lý của chúng tôi đang đọc tài liệu của bạn…",

    cameraTitle: "Tải lên tài liệu bạn muốn dịch",
    cameraSubtitle: "Chạm để mở máy ảnh, hoặc kéo ảnh vào đây",
    cameraRetake: "Chụp lại",
    cameraContinue: "Tiếp tục",

    resultNotFound: "Không tìm thấy tài liệu",
    resultTakeNew: "Chụp ảnh mới",
    resultContinue: "Tiếp tục",
    resultCallOffice: "Gọi văn phòng",
    resultSaved: "Đã lưu vào tài liệu của bạn",
    resultSavePrompt: "Lưu nội dung này vào lịch sử",
    resultCreateAccount: "Tạo tài khoản miễn phí",
    resultNotNow: "Chưa phải lúc này",
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

    tabHome: "Trang chủ",
    tabScan: "Quét",
    tabDocuments: "Tài liệu",
    tabProfile: "Hồ sơ",

    accountTitle: "Tài khoản",
    accountLanguage: "Ngôn ngữ",
    accountVoice: "Giọng nói",
    accountVoiceSet: "Giọng nói của bạn đã được thiết lập",
    accountVoiceRecord: "Ghi âm giọng nói của bạn",
    accountSignOut: "Đăng xuất",

    onboardingProfile: "Cho chúng tôi biết về bạn",
    onboardingName: "Tên của bạn",
    onboardingRelationship: "Tôi là...",
    onboardingParent: "Phụ huynh",
    onboardingChild: "Con (18+)",
    onboardingFamily: "Thành viên gia đình",
    onboardingLanguage: "Ngôn ngữ ưa thích",
    onboardingLanguageDesc: "Chúng tôi sẽ giải thích tất cả tài liệu bằng ngôn ngữ này",
    onboardingVoiceTitle: "Ghi âm giọng nói",
    onboardingVoiceDesc: "Nghe tài liệu đọc lại bằng giọng quen thuộc",
    onboardingVoiceRecorded: "Giọng nói của bạn đã được ghi lại!",
    onboardingSkip: "Bỏ qua",
    onboardingFinish: "Hoàn thành",
    onboardingContinue: "Tiếp tục",

    callReady: "Sẵn sàng",
    callConnecting: "Đang kết nối…",
    callActive: "Đang gọi",
    callEnded: "Cuộc gọi kết thúc",
    callWaitingAudio: "Đang chờ âm thanh…",
    callOfficeLabel: "Văn phòng",
    callYouLabel: "Bạn",
    callStart: "Bắt đầu gọi",
    callEnd: "Kết thúc gọi",
    callAgain: "Gọi lại",
    callPhoneLabel: "Số điện thoại văn phòng",

    chatTitle: "Hỏi về tài liệu của bạn",
    chatSubtitle: "Tôi biết tất cả thư của gia đình bạn",
    chatPlaceholder: "Hỏi bất cứ điều gì về tài liệu…",
    chatSendLabel: "Gửi",
    chatEmptyTitle: "Quét tài liệu đầu tiên để bắt đầu trò chuyện",
    chatEmptyBody: "Sau khi quét thư, tôi có thể trả lời câu hỏi bằng ngôn ngữ của bạn.",
    chatEmptyLink: "Quét tài liệu",
    chatThinking: "Đang suy nghĩ…",
    chatError: "Đã xảy ra lỗi. Vui lòng thử lại.",
  },
  ro: {
    welcomeTitle: "Bun venit",
    welcomeSubtitle: "Alegeți limba dumneavoastră",
    welcomeContinue: "Continuați",
    welcomeSignIn: "Aveți deja un cont? Conectați-vă",
    voicePrompt: "Sau spuneți cu voce tare",
    voiceListening: "Ascult…",
    voiceComingSoon: "În curând",
    voiceDetected: "Limbă detectată!",
    voiceDetecting: "Se detectează limba…",
    voiceNotDetected: "Nu s-a detectat limba — încercați din nou",
    voiceNotSupported: "Recunoașterea vocală nu este disponibilă în acest browser",
    voiceMicDenied: "Accesul la microfon a fost refuzat",

    homeGreeting: "Bună dimineața",
    scanTitle: "Scanați o scrisoare",
    scanSubtitle: "Faceți o fotografie, ascultați explicația",
    callTitle: "Apel telefonic",
    callSubtitle: "Traducere în timp real",
    documentsTitle: "Documentele mele",
    documentsSubtitle: "Scrisori salvate de familia dumneavoastră",
    tagline: "Pentru familiile care nu au avut niciodată un traducător acasă.",
    statText: "Milioane de familii se confruntă zilnic cu bariere lingvistice. Suntem aici pentru a face comunicarea mai ușoară pentru toți.",
    termsAgree: "Sunt de acord cu Termenii de Serviciu Orision",

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

    loginHeading: "Bine ai revenit",
    loginSubmit: "Conectare",
    loginNoAccount: "Nu ai cont?",
    loginCreateAccount: "Creează unul",
    loginContinueWithout: "Continuă fără cont",

    signupHeading: "Creează-ți contul",
    signupBody: "Doar un email și o parolă — atât.",
    signupEmail: "Email",
    signupPassword: "Parolă",
    signupSubmit: "Creați cont",
    signupSkip: "Omiteți deocamdată",
    signupHasAccount: "Ai deja cont?",
    signupSignIn: "Conectează-te",
    emailPlaceholder: "Adresă de email",
    passwordPlaceholder: "Parolă",
    back: "Înapoi",
    continueWithGoogle: "Continuați cu Google",

    captureHeading: "Ce document ați primit?",
    captureSubtitle: "Faceți o fotografie și vi-l explicăm în limba dumneavoastră.",
    captureLoading: "Asistenții noștri vă citesc documentul…",

    cameraTitle: "Încărcați documentul pe care doriți să îl traduceți",
    cameraSubtitle: "Atingeți pentru a deschide camera sau trageți o fotografie aici",
    cameraRetake: "Refaceți",
    cameraContinue: "Continuați",

    resultNotFound: "Document negăsit",
    resultTakeNew: "Faceți o fotografie nouă",
    resultContinue: "Continuați",
    resultCallOffice: "Sunați la birou",
    resultSaved: "Salvat în documentele dvs.",
    resultSavePrompt: "Salvați aceasta în istoricul dvs.",
    resultCreateAccount: "Creați cont gratuit",
    resultNotNow: "Nu acum",
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

    tabHome: "Acasă",
    tabScan: "Scanare",
    tabDocuments: "Documente",
    tabProfile: "Profil",

    accountTitle: "Cont",
    accountLanguage: "Limbă",
    accountVoice: "Voce",
    accountVoiceSet: "Vocea dvs. este configurată",
    accountVoiceRecord: "Înregistrați-vă vocea",
    accountSignOut: "Deconectare",

    onboardingProfile: "Spune-ne despre tine",
    onboardingName: "Numele tău",
    onboardingRelationship: "Sunt un/o...",
    onboardingParent: "Părinte",
    onboardingChild: "Copil (18+)",
    onboardingFamily: "Membru al familiei",
    onboardingLanguage: "Limba ta preferată",
    onboardingLanguageDesc: "Vom explica toate documentele în această limbă",
    onboardingVoiceTitle: "Înregistrează-ți vocea",
    onboardingVoiceDesc: "Ascultă documentele citite cu o voce familiară",
    onboardingVoiceRecorded: "Vocea ta a fost înregistrată!",
    onboardingSkip: "Sări peste",
    onboardingFinish: "Finalizare",
    onboardingContinue: "Continuă",

    callReady: "Pregătit",
    callConnecting: "Se conectează…",
    callActive: "În apel",
    callEnded: "Apel încheiat",
    callWaitingAudio: "Se așteaptă audio…",
    callOfficeLabel: "Birou",
    callYouLabel: "Dvs.",
    callStart: "Începeți apelul",
    callEnd: "Încheiați apelul",
    callAgain: "Sunați din nou",
    callPhoneLabel: "Numărul de telefon al biroului",

    chatTitle: "Întrebați despre documentele dvs.",
    chatSubtitle: "Cunosc toate scrisorile familiei dvs.",
    chatPlaceholder: "Întrebați orice despre documentele dvs…",
    chatSendLabel: "Trimite",
    chatEmptyTitle: "Scanați primul document pentru a începe conversația",
    chatEmptyBody: "După ce scanați o scrisoare, pot răspunde la întrebări în limba dvs.",
    chatEmptyLink: "Scanați un document",
    chatThinking: "Se gândește…",
    chatError: "Ceva a mers greșit. Vă rugăm să încercați din nou.",
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
