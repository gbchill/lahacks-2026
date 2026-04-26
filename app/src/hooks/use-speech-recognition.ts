import { useCallback, useEffect, useRef, useState } from "react";
import { detectLanguageFromAudio } from "@/lib/language-api";

export type MicError = "not-supported" | "permission-denied" | "detection-failed" | null;

function isMediaRecorderSupported() {
  return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export function useMicLanguageDetection(recordMs = 4000) {
  const supported = isMediaRecorderSupported();

  const [listening, setListening] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [error, setError] = useState<MicError>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelRef = useRef(false);
  const sessionRef = useRef(0);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cancelRef.current = true;
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    releaseStream();
    setListening(false);
  }, [releaseStream]);

  const start = useCallback(async () => {
    if (!supported) {
      setError("not-supported");
      return;
    }

    cancelRef.current = false;
    const session = ++sessionRef.current;
    setDetectedLang(null);
    setError(null);
    setListening(true);
    setDetecting(false);
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      if (sessionRef.current !== session) return;
      setError("permission-denied");
      setListening(false);
      return;
    }

    if (cancelRef.current || sessionRef.current !== session) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    streamRef.current = stream;

    const mimeType =
      MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : undefined;

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      releaseStream();
      mediaRecorderRef.current = null;

      if (cancelRef.current || sessionRef.current !== session) {
        setListening(false);
        return;
      }

      const actualMime = recorder.mimeType || mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: actualMime });
      if (blob.size < 100) {
        setError("detection-failed");
        setListening(false);
        return;
      }

      setListening(false);
      setDetecting(true);

      try {
        const result = await detectLanguageFromAudio(blob);
        if (sessionRef.current !== session) return;
        setDetectedLang(result.language_code);
      } catch {
        if (sessionRef.current !== session) return;
        setError("detection-failed");
      } finally {
        if (sessionRef.current === session) setDetecting(false);
      }
    };

    recorder.start();

    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, recordMs);
  }, [supported, recordMs, releaseStream]);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      releaseStream();
    };
  }, [releaseStream]);

  return {
    supported,
    listening,
    detecting,
    detectedLang,
    error,
    start,
    stop,
  } as const;
}
