package com.eplugger.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 佐证图片上传，返回可访问 URL。单次最多 3 张（与 app.upload.max-per-request 一致）。
 */
@RestController
@RequestMapping("/api/checkin")
public class FileUploadController {

    private static final int MAX_FILES = 3;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/gif",
            "image/webp"
    );

    @Value("${app.upload.dir:./upload}")
    private String uploadDirPath;

    /**
     * 上传佐证图片，最多 3 张。返回 URL 列表，供打卡提交时使用。
     * 表单字段名：file 或 files（可多选）。
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(
            @RequestParam(value = "file", required = false) MultipartFile[] singleFiles,
            @RequestParam(value = "files", required = false) MultipartFile[] multipleFiles
    ) throws IOException {
        List<MultipartFile> list = new ArrayList<>();
        if (singleFiles != null) {
            for (MultipartFile f : singleFiles) {
                if (f != null && !f.isEmpty()) list.add(f);
            }
        }
        if (multipleFiles != null) {
            for (MultipartFile f : multipleFiles) {
                if (f != null && !f.isEmpty()) list.add(f);
            }
        }
        if (list.size() > MAX_FILES) {
            return ResponseEntity.badRequest()
                    .body(new UploadResponse(List.of(), "最多上传 " + MAX_FILES + " 张图片"));
        }
        if (list.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new UploadResponse(List.of(), "请选择至少一张图片"));
        }

        Path baseDir = Path.of(uploadDirPath).toAbsolutePath().normalize();
        Files.createDirectories(baseDir);
        List<String> urls = new ArrayList<>();

        for (MultipartFile file : list) {
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
                return ResponseEntity.badRequest()
                        .body(new UploadResponse(List.of(), "仅支持 JPG/PNG/GIF/WebP"));
            }
            String ext = contentType.contains("png") ? ".png" : contentType.contains("gif") ? ".gif" : contentType.contains("webp") ? ".webp" : ".jpg";
            String filename = UUID.randomUUID().toString() + ext;
            Path target = baseDir.resolve(filename);
            file.transferTo(target);
            urls.add("/api/uploads/" + filename);
        }

        return ResponseEntity.ok(new UploadResponse(urls, null));
    }

    public static class UploadResponse {
        private final List<String> urls;
        private final String error;

        public UploadResponse(List<String> urls, String error) {
            this.urls = urls;
            this.error = error;
        }

        public List<String> getUrls() {
            return urls;
        }

        public String getError() {
            return error;
        }
    }
}
