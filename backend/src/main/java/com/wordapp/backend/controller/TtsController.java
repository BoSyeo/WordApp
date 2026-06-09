package com.wordapp.backend.controller;

import com.google.cloud.texttospeech.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/tts")
public class TtsController {

    private final String cacheDir = "/home/ubuntu/wordapp/tts-cache";

    @GetMapping
    public ResponseEntity<FileSystemResource> getTts(@RequestParam String text) throws Exception {
        String fileName = sha256(text.toLowerCase().trim()) + ".mp3";
        File file = new File(cacheDir, fileName);

        if (!file.exists()) {
            createTtsFile(text, file);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("audio/mpeg"));
        headers.setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS));

        return new ResponseEntity<>(new FileSystemResource(file), headers, HttpStatus.OK);
    }

    private void createTtsFile(String text, File file) throws Exception {
        try (TextToSpeechClient client = TextToSpeechClient.create()) {
            SynthesisInput input = SynthesisInput.newBuilder()
                    .setText(text)
                    .build();

            VoiceSelectionParams voice = VoiceSelectionParams.newBuilder()
                    .setLanguageCode("en-US")
                    .setName("en-US-Neural2-F")
                    .build();

            AudioConfig audioConfig = AudioConfig.newBuilder()
                    .setAudioEncoding(AudioEncoding.MP3)
                    .build();

            SynthesizeSpeechResponse response =
                    client.synthesizeSpeech(input, voice, audioConfig);

            ByteString audioContents = response.getAudioContent();
            Files.write(file.toPath(), audioContents.toByteArray());
        }
    }

    private String sha256(String text) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(text.getBytes());

        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }

        return hex.toString();
    }
}